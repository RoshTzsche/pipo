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

// Función auxiliar para leer las clínicas desde el JSON
const leerClinicas = () => {
  try {
    const clinicasPath = path.join(process.cwd(), 'data', 'clinicas.json');
    if (fs.existsSync(clinicasPath)) {
      return JSON.parse(fs.readFileSync(clinicasPath, 'utf8'));
    }
    return []; // Fallback si no existe el archivo
  } catch (error) {
    console.error('Error al leer el archivo de clínicas:', error);
    return [];
  }
};

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

  // AGENTE 1: Sistema de Triaje
  let systemPromptTriaje = `Eres un Especialista de Triaje empático y profesional en salud pública de Puebla.

INSTRUCCIONES:
1. Sé empático y recopila: nombre, edad, sexo, municipio y síntomas.
2. Responde SIEMPRE en texto natural mientras recolectas datos. NUNCA muestres JSON al usuario.

CONTEXTO EPIDEMIOLÓGICO Y AMBIENTAL DE PUEBLA (¡USAR PARA EL INSIGHT!):
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
    systemPromptTriaje += `\nDATOS DEL MUNICIPIO DE ${municipioData.municipio.toUpperCase()}: Riesgo de atención: ${municipioData.riesgo_atencion}. Considéralo para tu insight.`;
  }

  try {
    // 1. LLAMADA AL PRIMER MODELO (TRIAJE)
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPromptTriaje }, ...messages],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1, 
      max_tokens: 1024
    });

    const rawContent = chatCompletion.choices[0].message.content;
    console.log("IA Triaje respondió:", rawContent);

    // Limpieza de Markdown
    let cleanedContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();

    const firstBracket = cleanedContent.indexOf('{');
    const lastBracket = cleanedContent.lastIndexOf('}');

    if (firstBracket !== -1 && lastBracket !== -1) {
      const jsonString = cleanedContent.substring(firstBracket, lastBracket + 1);
      try {
        const parsedObject = JSON.parse(jsonString);

        // SI EL TRIAJE TERMINÓ, LLAMAMOS AL SEGUNDO MODELO
        if (parsedObject.status === 'finalizado' && parsedObject.expediente) {
          
          console.log("Iniciando Agente 2: Asignación de Clínica...");
          
          // Leer las clínicas actualizadas desde el archivo JSON
          const clinicasDisponibles = leerClinicas();

          // AGENTE 2: Asignación de Clínica
          const systemPromptAsignacion = `Eres el Director Médico de Asignación del Gobierno de Puebla. 
Se te entregará el expediente de un paciente recién evaluado y una lista de clínicas con sus capacidades.
Tu objetivo es elegir la MEJOR clínica y redactar una justificación estelar.

REGLAS DE ASIGNACIÓN:
1. CRUCE MÉDICO: Asegúrate de que la clínica tenga la capacidad exacta para el síntoma (Ej. Rayos X para fracturas).
2. LA RECOMENDACIÓN (EL PUNCH): Escribe un mensaje directo, empático y muy convincente dirigido al paciente en segunda persona. Debe sonar como un verdadero médico VIP cuidando de él. 
Ejemplo de tono: "Elegí esta clínica para ti porque cuenta con equipo de Rayos X para revisar tu brazo, y actualmente tiene baja saturación, por lo que te atenderán rapidísimo."

DATOS DE CLÍNICAS DISPONIBLES:
${JSON.stringify(clinicasDisponibles)}

EXPEDIENTE DEL PACIENTE:
${JSON.stringify(parsedObject.expediente)}

Devuelve ÚNICAMENTE un JSON con este formato, SIN markdown:
{
  "clinica_recomendada": "Nombre exacto de la clínica elegida",
  "recomendacion_medica": "Tu mensaje hiper-personalizado y empático aquí"
}`;

          // 2. LLAMADA AL SEGUNDO MODELO (ASIGNACIÓN)
          const asignacionCompletion = await groq.chat.completions.create({
            messages: [{ role: "system", content: systemPromptAsignacion }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            max_tokens: 500
          });

          let asignacionRaw = asignacionCompletion.choices[0].message.content;
          let asignacionClean = asignacionRaw.replace(/```json/g, '').replace(/```/g, '').trim();
          
          const aFirst = asignacionClean.indexOf('{');
          const aLast = asignacionClean.lastIndexOf('}');
          
          if (aFirst !== -1 && aLast !== -1) {
            const asignacionJson = JSON.parse(asignacionClean.substring(aFirst, aLast + 1));
            
            // JUNTAR LOS RESULTADOS DEL AGENTE 1 Y AGENTE 2
            parsedObject.expediente.clinica_asignada = asignacionJson.clinica_recomendada;
            parsedObject.expediente.recomendacion_medica = asignacionJson.recomendacion_medica;
          }

          // GUARDAR EXPEDIENTE ACTUALIZADO
          const timestamp = Date.now();
          const filename = `expediente_${timestamp}.json`;
          const filepath = path.join(expedientesDir, filename);
          
          fs.writeFileSync(filepath, JSON.stringify(parsedObject.expediente, null, 2));
          console.log(`💾 Expediente guardado con asignación médica: ${filename}`);
          
          return res.json(parsedObject);
        }
      } catch (parseError) {
        console.error('Error de parseo del JSON extraído:', parseError);
      }
    }

    // CAÍDA SEGURA
    return res.json({ message: cleanedContent });

  } catch (error) {
    console.error("Error en Groq:", error);
    return res.status(500).json({ error: "Error de servidor", message: "Error interno" });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Modelos Duales encendidos en http://localhost:${PORT}`);
});