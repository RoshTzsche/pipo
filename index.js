import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); 

const expedientesDir = path.join(process.cwd(), 'expedientes');
if (!fs.existsSync(expedientesDir)) {
  fs.mkdirSync(expedientesDir);
  console.log('📁 Carpeta expedientes creada');
}

// ==========================================
// 🧠 MOTOR RAG (RETRIEVER) ACTUALIZADO
// ==========================================
function retrieveTopClinicas(sintomas, categoria) {
  try {
    const clinicasPath = path.join(process.cwd(), 'data', 'clinicas.json');
    if (!fs.existsSync(clinicasPath)) return [];
    
    // Leemos el nuevo formato del JSON que ahora tiene metadatos
    const clinicasFile = JSON.parse(fs.readFileSync(clinicasPath, 'utf8'));
    let clinicas = clinicasFile.clinicas || []; 
    
    const textoBusqueda = sintomas.toLowerCase();

    // Lógica de "Embeddings/Búsqueda Semántica" simplificada para RAG
    clinicas.forEach(clinica => {
      let score = 0;
      // Ahora se llama "equipamiento" en el nuevo JSON
      const capacidadesTxt = (clinica.equipamiento || []).join(' ').toLowerCase();

      // Reglas de matching (Simulando un vector search)
      if ((textoBusqueda.includes('fractura') || textoBusqueda.includes('hueso') || textoBusqueda.includes('caída')) && capacidadesTxt.includes('rayos_x')) score += 10;
      if (textoBusqueda.includes('ceniza') && capacidadesTxt.includes('ceniza')) score += 10;
      // Actualizado a urgencias_24h basado en tu nuevo JSON
      if (categoria === 'URGENTE' && capacidadesTxt.includes('urgencias_24h')) score += 15; 
      if ((textoBusqueda.includes('niño') || textoBusqueda.includes('bebé')) && capacidadesTxt.includes('pediatría')) score += 10;
      if (textoBusqueda.includes('corazón') || textoBusqueda.includes('pecho')) score += 10;
      
      // Penalizar por saturación/ocupación alta (ahora usa ocupacion_porcentaje)
      const ocupacion = clinica.ocupacion_porcentaje || 50;
      score -= (ocupacion * 0.05);

      clinica.rag_score = score;
    });

    // Ordenar por score y devolver solo el Top 3 (El contexto recuperado)
    const topClinicas = clinicas.sort((a, b) => b.rag_score - a.rag_score).slice(0, 3);
    
    // Limpiamos el score para no confundir al LLM
    return topClinicas.map(({ rag_score, ...rest }) => rest);
  } catch (error) {
    console.error('Error en Retriever RAG:', error);
    return [];
  }
}

// ==========================================
// 🚀 ENDPOINT PRINCIPAL
// ==========================================
app.post('/api/chat', async (req, res) => {
  const { messages, municipio } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "No se recibieron mensajes" });
  }

  // AGENTE 1: TRIADOR (INTACTO COMO SOLICITASTE)
  let systemPromptTriaje = `Eres Pipo, un Especialista de Triaje de Puebla.
1. Sé empático y averigua: nombre, edad, sexo, municipio y síntomas.
2. MIENTRAS recolectas datos, responde en texto natural.
3. NUNCA MUESTRES JSON EN TUS RESPUESTAS.
4. CUANDO TENGAS TODOS LOS DATOS, tu respuesta DEBE ser ÚNICAMENTE un objeto JSON, sin texto adicional, con esta estructura exacta:
{
  "status": "finalizado",
  "expediente": {
    "paciente": {"nombre": "...", "edad": 0, "municipio": "...", "sexo": "..."},
    "clinico": {"sintoma": "...", "evolucion": "...", "categoria": "URGENTE/MODERADO/LEVE"},
    "insight_puebla": "Advertencia médica basada en Puebla"
  }
}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPromptTriaje }, ...messages],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      // NO forzamos JSON mode aquí porque el agente necesita hablar en texto natural primero
    });

    let rawContent = chatCompletion.choices[0].message.content;
    let cleanedContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();

    // Intentamos ver si el Agente 1 ya terminó y generó el JSON
    if (cleanedContent.startsWith('{') && cleanedContent.endsWith('}')) {
      try {
        const parsedObject = JSON.parse(cleanedContent);

        if (parsedObject.status === 'finalizado' && parsedObject.expediente) {
          console.log("Agente 1 terminó. Iniciando Pipeline RAG para Agente 2...");

          // 1. FASE RAG: Recuperar conocimiento
          const contextoClinicas = retrieveTopClinicas(
            parsedObject.expediente.clinico.sintoma,
            parsedObject.expediente.clinico.categoria
          );

          // 2. FASE RAG: Generación Aumentada (Agente 2 - ROBUSTECIDO)
          const systemPromptAsignacion = `Eres el Director Médico VIP de Puebla y sistema experto de triaje.
Se te entrega un expediente médico y una base de conocimiento reducida (Top 3 clínicas pre-filtradas para este caso).
Elige la mejor opción para el paciente basándote en su categoría de riesgo, el equipamiento de la clínica y muy importante: el tiempo de espera estimado ('tiempos_espera').

BASE DE CONOCIMIENTO (CLÍNICAS RECUPERADAS):
${JSON.stringify(contextoClinicas)}

EXPEDIENTE DEL PACIENTE:
${JSON.stringify(parsedObject.expediente)}

INSTRUCCIONES Y REGLAS ESTRICTAS:
1. Analiza el nivel de urgencia y los síntomas.
2. Prioriza la clínica con menor tiempo de espera en urgencias ('tiempos_espera.urgencias_min') que cuente con el 'equipamiento' adecuado.
3. INYECCIÓN DINÁMICA: Si el municipio del paciente está demasiado lejos de las clínicas en la base de conocimiento (por ejemplo, vive en un municipio alejado y las opciones son solo de Puebla capital), tienes permitido IGNORAR el Top 3 y usar tu conocimiento médico para sugerir el Hospital General Público más cercano a su municipio real.
4. TIENES PROHIBIDO INVENTAR CLÍNICAS, SOLO USA LAS DE TU CONOCIMIENTO.

INSTRUCCIONES DE SALIDA (ESTRICTO JSON):
Debes devolver un JSON con esta estructura exacta:
{
  "clinica_recomendada": "Nombre exacto de la clínica elegida del Top 3 (o el nombre del hospital público local si aplicaste la Inyección Dinámica por lejanía)",
  "recomendacion_medica": "Tu explicación VIP, empática y en primera persona de por qué elegiste esta unidad, justificando con los síntomas, el equipamiento y haciendo énfasis en los tiempos de espera favorables o cercanía a su municipio. Ejem: 'Elegí esta clínica para ti porque el tiempo de espera actual en urgencias es de solo 38 minutos y cuentan con Rayos X...'"
}`;

          const asignacionCompletion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemPromptAsignacion }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            // ¡MAGIA! Forzamos a nivel de API que la respuesta sea un JSON perfecto
            response_format: { type: "json_object" } 
          });

          const asignacionJson = JSON.parse(asignacionCompletion.choices[0].message.content);
            
          // Inyectamos la decisión en el expediente maestro que viaja al frontend
          parsedObject.expediente.clinica_asignada = asignacionJson.clinica_recomendada;
          parsedObject.expediente.recomendacion_medica = asignacionJson.recomendacion_medica;

          // Guardar el expediente
          const timestamp = Date.now();
          const filename = `expediente_${timestamp}.json`;
          fs.writeFileSync(path.join(expedientesDir, filename), JSON.stringify(parsedObject.expediente, null, 2));
          
          return res.json(parsedObject);
        }
      } catch (e) {
        console.error('Error parseando JSON del Agente 1:', e);
      }
    }

    // Si no es JSON, es que Pipo sigue platicando
    return res.json({ message: cleanedContent });

  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).json({ error: "Error de servidor" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor RAG encendido en http://localhost:${PORT}`);
});