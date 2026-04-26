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

// Aseguramos la instancia de Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY }); 

// Crear carpeta expedientes si no existe
const expedientesDir = path.join(process.cwd(), 'expedientes');
if (!fs.existsSync(expedientesDir)) {
  fs.mkdirSync(expedientesDir);
  console.log('📁 Carpeta expedientes creada');
}

app.post('/api/chat', async (req, res) => {
  const { messages, municipio } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "No se recibieron mensajes" });
  }

  // Leer datos de conocimiento de Puebla
  let municipioData = null;
  try {
    const knowledgePath = path.join(process.cwd(), 'data', 'puebla_knowledge_merged.json');
    if (fs.existsSync(knowledgePath)) {
      const knowledgeData = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
      if (municipio && knowledgeData.riesgo_por_municipio) {
        municipioData = knowledgeData.riesgo_por_municipio.find(m => 
          m.municipio.toLowerCase() === municipio.toLowerCase()
        );
      }
    }
  } catch (error) {
    console.error('Error al leer datos de conocimiento:', error);
  }

  // System Prompt Blindado
  let systemPrompt = `Eres un Especialista de Triaje empático y profesional en salud pública de Puebla.

INSTRUCCIONES:
1. Sé empático y recopila: nombre, edad, sexo, municipio y síntomas.
2. Responde SIEMPRE en texto natural mientras recolectas datos. NUNCA muestres JSON al usuario.

CONTEXTO EPIDEMIOLÓGICO Y AMBIENTAL DE PUEBLA (¡USAR PARA EL INSIGHT!):
- RIESGO VOLCÁNICO: Si el paciente es de San Andrés Cholula, San Pedro Cholula, Atlixco o Puebla capital, y presenta tos, irritación de garganta o ardor de ojos, ES POR CAÍDA DE CENIZA DEL POPOCATÉPETL. 
- MORTALIDAD HOMBRES >35: Alto riesgo de enfermedades del hígado y corazón.
- MORTALIDAD MUJERES >65: Alto riesgo de enfermedades cardiovasculares y diabetes.

SEVERIDAD:
- URGENTE: fractura, no puedo respirar, dolor pecho, sangrado, desmayo.
- MODERADO: fiebre, vómito, diarrea, dolor fuerte, afectación por ceniza.
- LEVE: tos leve, gripa, resfriado, cansancio.

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
}`;

  if (municipioData) {
    systemPrompt += `\nDATOS DEL MUNICIPIO DE ${municipioData.municipio.toUpperCase()}: Riesgo de atención: ${municipioData.riesgo_atencion}. Considéralo para tu insight.`;
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1, // Casi en cero para matar las alucinaciones y forzar formato
      max_tokens: 1024
    });

    const rawContent = chatCompletion.choices[0].message.content;
    console.log("IA respondió:", rawContent);

    // Limpieza: Eliminar cualquier rastro de markdown (```json y ```)
    let cleanedContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();

    // EXTRACCIÓN DE JSON POR FUERZA BRUTA
    const firstBracket = cleanedContent.indexOf('{');
    const lastBracket = cleanedContent.lastIndexOf('}');

    if (firstBracket !== -1 && lastBracket !== -1) {
      const jsonString = cleanedContent.substring(firstBracket, lastBracket + 1);
      try {
        const parsedObject = JSON.parse(jsonString);

        // LÓGICA DE PERSISTENCIA SEGURA
        if (parsedObject.status === 'finalizado' && parsedObject.expediente) {
          const timestamp = Date.now();
          const filename = `expediente_${timestamp}.json`;
          const filepath = path.join(expedientesDir, filename);
          
          fs.writeFileSync(filepath, JSON.stringify(parsedObject.expediente, null, 2));
          console.log(`💾 Expediente guardado: ${filename}`);
          
          return res.json(parsedObject);
        }
      } catch (parseError) {
        console.error('Error de parseo del JSON extraído:', parseError);
      }
    }

    // CAÍDA SEGURA (FALLBACK PARA PLÁTICA NORMAL)
    // Retorna SIEMPRE un objeto estructurado para que React nunca truene
    return res.json({ message: cleanedContent });

  } catch (error) {
    console.error("Error en Groq:", error);
    return res.status(500).json({ error: "Error de servidor", message: "Error interno" });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Modelo 1 encendido en http://localhost:${PORT}`);
});