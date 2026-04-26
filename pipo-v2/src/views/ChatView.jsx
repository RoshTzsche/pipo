import React, { useState, useRef, useEffect } from 'react'
import { Send, Mic, Info } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import { TalaveraCorner, TalaveraPattern } from '../components/TalaveraPattern.jsx'
import { PipoMascot } from '../components/PipoMascot.jsx'

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    '¡Hola! Soy Pipo. Dime, ¿para qué especialidad buscas cita o qué molestias tienes hoy? Yo me encargo de encontrarte un lugar rápido.'
}

export default function ChatView() {
  const {
    addExpediente,
    setCurrentView,
    intentarAgendarCita
  } = useAppContext()

  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [municipio, setMunicipio] = useState('')
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const detectarMunicipio = (text) => {
    const municipios = [
      'puebla', 'cholula', 'san andrés cholula', 'san pedro cholula',
      'atlixco', 'tehuacán', 'huejotzingo', 'amozoc', 'cuautlancingo',
      'san martín texmelucan', 'valsequillo'
    ]
    const lower = text.toLowerCase()
    const found = municipios.find(m => lower.includes(m))
    if (found && found !== municipio) setMunicipio(found)
  }

  const sendMessage = async (textRaw) => {
    const text = (textRaw ?? input).trim()
    if (!text || isTyping) return

    detectarMunicipio(text)

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    const historialBackend = newMessages
      .filter(m => m.id !== 'welcome')
      .map(({ role, content }) => ({ role, content }))

    try {
      // Ruta relativa: en dev usa el proxy de Vite (vite.config.js → localhost:5001),
      // en producción usa el rewrite de vercel.json hacia tu API en Vercel.
      const API_URL = import.meta.env.VITE_API_URL || '/api/chat'
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historialBackend,
          municipio: municipio || undefined
        })
      })

      if (!res.ok) throw new Error('Bad response')
      const data = await res.json()

      if (data.status === 'finalizado' && data.expediente) {
        const exp = addExpediente(data.expediente)
        const cierre = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: '¡Listo! Estoy buscando disponibilidad en las clínicas de tu zona…'
        }
        setMessages([...newMessages, cierre])
        setIsTyping(false)

        // Después de un breve delay decide si agenda o no
        setTimeout(() => {
          const exito = intentarAgendarCita(exp)
          setCurrentView(exito ? 'cita' : 'sin-cita')
        }, 1500)
        return
      }

      if (data.message) {
        setMessages([...newMessages, {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.message
        }])
      }
    } catch (err) {
      setMessages([...newMessages, {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ No pude conectar con el servicio. Verifica tu conexión e inténtalo de nuevo.'
      }])
    } finally {
      setIsTyping(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#ECF9FF] overflow-hidden">
      <TalaveraPattern opacity={0.03} />

      {/* Esquinas decorativas Talavera - tamaño responsivo */}
      <div className="hidden sm:block">
        <TalaveraCorner position="top-left" size={140} />
        <TalaveraCorner position="top-right" size={140} />
      </div>
      <div className="sm:hidden">
        <TalaveraCorner position="top-left" size={100} />
        <TalaveraCorner position="top-right" size={100} />
      </div>

      {/* Card principal del chat con borde doble */}
      <div className="relative z-10 flex-1 flex flex-col mx-2 sm:mx-3 mt-20 sm:mt-28 md:mt-32 mb-3 bg-white rounded-3xl border-[3px] border-[#E6A231] shadow-[4px_4px_0px_#080869] overflow-hidden min-h-[400px]">
        {/* Borde interior tipo doble */}
        <div className="absolute inset-2 border-2 border-[#080869]/20 rounded-2xl pointer-events-none" />

        {/* Logo Pipo arriba del card */}
        <div className="relative pt-4 pb-1 sm:pt-5 sm:pb-2 px-4 text-center">
          <h2 className="font-display font-black text-[#080869] text-3xl sm:text-4xl italic tracking-wider">
            <span className="inline-block w-1.5 h-1.5 bg-[#080869] rounded-full mr-1 align-middle" />
            PiPo
            <span className="inline-block w-1.5 h-1.5 bg-[#080869] rounded-full ml-1 align-middle" />
          </h2>
        </div>

        {/* Disclaimer IA - sutil, debajo del header */}
        <div className="relative mx-4 mb-2 px-3 py-1.5 bg-[#FFF4E0] border border-[#E6A231]/40 rounded-full flex items-start gap-1.5">
          <Info className="w-3 h-3 text-[#E6A231] shrink-0 mt-0.5" strokeWidth={2.5} />
          <p className="text-[10px] sm:text-[11px] text-[#080869]/70 leading-snug">
            Pipo es una IA que te orienta. No sustituye atención médica profesional. Si es urgente, busca atención personalizada.
          </p>
        </div>

        {/* Mensajes */}
        <div
          ref={scrollRef}
          className="relative flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isTyping && (
            <div className="flex items-end gap-2">
              <PipoAvatar />
              <div className="bg-white border-2 border-[#080869] rounded-3xl rounded-bl-md px-4 py-3 shadow-[2px_2px_0px_rgba(8,8,105,0.1)]">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E6A231] typing-dot" style={{ animationDelay: '0s' }} />
                  <span className="w-2 h-2 rounded-full bg-[#E6A231] typing-dot" style={{ animationDelay: '0.15s' }} />
                  <span className="w-2 h-2 rounded-full bg-[#E6A231] typing-dot" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input flotante con borde dorado */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 mx-2 sm:mx-3 mb-3"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white border-[3px] border-[#E6A231] rounded-full px-3 sm:px-4 py-2 shadow-[3px_3px_0px_#080869]">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe tus síntomas"
            disabled={isTyping}
            className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[#080869] placeholder:text-[#080869]/40 placeholder:font-display placeholder:italic text-sm py-2 disabled:opacity-60"
          />
          <button
            type="button"
            className="text-[#080869] p-1.5 hover:bg-[#080869]/5 rounded-full transition-colors shrink-0"
            aria-label="Hablar"
            tabIndex={-1}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#080869] bg-white flex items-center justify-center text-[#080869] hover:bg-[#080869] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#080869] shrink-0"
            aria-label="Enviar"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] sm:max-w-[75%] bg-[#FFF4E0] border-2 border-[#E6A231] rounded-3xl rounded-br-md px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-[#080869] font-medium leading-relaxed shadow-[2px_2px_0px_rgba(230,162,49,0.3)]">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2">
      <PipoAvatar />
      <div className="max-w-[80%] sm:max-w-[75%] bg-white border-2 border-[#080869] rounded-3xl rounded-bl-md px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-[#080869] font-medium leading-relaxed shadow-[2px_2px_0px_rgba(8,8,105,0.1)] whitespace-pre-wrap">
        {message.content}
      </div>
    </div>
  )
}

function PipoAvatar() {
  return (
    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full border-2 border-[#080869] bg-[#ECF9FF] flex items-center justify-center overflow-hidden shadow-[2px_2px_0px_rgba(8,8,105,0.15)]">
      <div className="w-11 h-11 sm:w-12 sm:h-12 -mt-1">
        <PipoMascot variant="happy" className="w-full h-full" />
      </div>
    </div>
  )
}
