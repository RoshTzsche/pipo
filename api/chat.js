import Groq from 'groq-sdk'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

function retrieveTopClinicas(sintomas, categoria) {
  try {
    // En Vercel el cwd es la raíz del proyecto
    const clinicasPath = join(process.cwd(), 'data', 'clinicas.json')
    if (!existsSync(clinicasPath)) return []

    const clinicasFile = JSON.parse(readFileSync(clinicasPath, 'utf8'))
    let clinicas = clinicasFile.clinicas || []

    const textoBusqueda = sintomas.toLowerCase()

    clinicas.forEach(clinica => {
      let score = 0
      const capacidadesTxt = (clinica.equipamiento || []).join(' ').toLowerCase()

      if ((textoBusqueda.includes('fractura') || textoBusqueda.includes('hueso') || textoBusqueda.includes('caída')) && capacidadesTxt.includes('rayos_x')) score += 10
      if (categoria === 'URGENTE' && capacidadesTxt.includes('urgencias_24h')) score += 15
      if ((textoBusqueda.includes('niño') || textoBusqueda.includes('bebé')) && capacidadesTxt.includes('pediatría')) score += 10
      if (textoBusqueda.includes('corazón') || textoBusqueda.includes('pecho')) score += 10

      const ocupacion = clinica.ocupacion_porcentaje || 50
      score -= ocupacion * 0.05
      clinica.rag_score = score
    })

    return clinicas
      .sort((a, b) => b.rag_score - a.rag_score)
      .slice(0, 3)
      .map(({ rag_score, ...rest }) => rest)
  } catch (error) {
    console.error('Error en Retriever RAG:', error)
    return []
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages, municipio } = req.body

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'No se recibieron mensajes' })
  }

  const systemPromptTriaje = `Eres un Especialista de Triaje empático y profesional en salud pública de Puebla.

INSTRUCCIONES:
1. Sé empático y recopila: nombre, edad, sexo, municipio y síntomas.
2. Responde SIEMPRE en texto natural mientras recolectas datos. NUNCA muestres JSON al usuario.
3. NUNCA MUESTRES TUS PENSAMIENTOS
REGLA MÁXIMA DE CIERRE:
Cuando tengas TODOS los datos, genera ÚNICAMENTE este JSON. ESTÁ ESTRICTAMENTE PROHIBIDO decir "Perfecto", "Aquí tienes", o usar formato Markdown.
{
  "status": "finalizado",
  "expediente": {
    "paciente": {"nombre": "", "edad": 0, "municipio": "", "sexo": ""},
    "clinico": {"sintoma": "", "evolucion": "", "categoria": ""},
    "insight_puebla": "[REEMPLAZA ESTE TEXTO con una advertencia médica real basada en el CONTEXTO EPIDEMIOLÓGICO de arriba, mencionando el Popocatépetl si aplica]",
    "prioridad_num": 1
  }
}`



  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: systemPromptTriaje }, ...messages],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1
    })

    let rawContent = chatCompletion.choices[0].message.content
    let cleanedContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim()

    // Extraer SOLO el primer objeto JSON válido encontrado
    const jsonMatch = cleanedContent.match(/\{[\s\S]*"status"[\s\S]*"finalizado"[\s\S]*\}/)
    if (jsonMatch) {
      cleanedContent = jsonMatch[0]
    }
    if (cleanedContent.startsWith('{') && cleanedContent.endsWith('}')) {
      try {
        const parsedObject = JSON.parse(cleanedContent)

        if (parsedObject.status === 'finalizado' && parsedObject.expediente) {
          const contextoClinicas = retrieveTopClinicas(
            parsedObject.expediente.clinico.sintoma,
            parsedObject.expediente.clinico.categoria
          )

          const systemPromptAsignacion = `Eres el Director Médico de Puebla y sistema experto de triaje.
Se te entrega un expediente médico y una base de conocimiento reducida (Top 3 clínicas pre-filtradas para este caso).
Elige la mejor opción para el paciente basándote en su categoría de riesgo, el equipamiento de la clínica y muy importante: el tiempo de espera estimado ('tiempos_espera').

BASE DE CONOCIMIENTO (CLÍNICAS RECUPERADAS):
${JSON.stringify(contextoClinicas)}

EXPEDIENTE DEL PACIENTE:
${JSON.stringify(parsedObject.expediente)}

INSTRUCCIONES Y REGLAS ESTRICTAS:
1. Analiza el nivel de urgencia y los síntomas.
2. Prioriza la clínica con menor tiempo de espera en urgencias que cuente con el equipamiento adecuado.
3. Si el municipio del paciente está muy lejos de las clínicas sugeridas, usa tu conocimiento para sugerir el Hospital General Público más cercano.
4. TIENES PROHIBIDO INVENTAR CLÍNICAS.

INSTRUCCIONES DE SALIDA (ESTRICTO JSON):
{
  "clinica_recomendada": "Nombre exacto de la clínica elegida",
  "recomendacion_medica": "Tu explicación VIP, empática y en primera persona de por qué elegiste esta unidad."
}`

          const asignacionCompletion = await groq.chat.completions.create({
            messages: [{ role: 'system', content: systemPromptAsignacion }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            response_format: { type: 'json_object' }
          })

          const asignacionJson = JSON.parse(asignacionCompletion.choices[0].message.content)
          parsedObject.expediente.clinica_asignada = asignacionJson.clinica_recomendada
          parsedObject.expediente.recomendacion_medica = asignacionJson.recomendacion_medica

          return res.status(200).json(parsedObject)
        }
      } catch (e) {
        console.error('Error parseando JSON del Agente 1:', e)
      }
    }

    return res.status(200).json({ message: cleanedContent })
  } catch (error) {
    console.error('Error en el handler:', error)
    return res.status(500).json({ error: 'Error de servidor' })
  }
}