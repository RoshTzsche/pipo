import React, { useState, useRef, useEffect } from 'react'
import { Bot, Send, Sparkles, AlertCircle, Calendar, Activity } from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import TalaveraPattern from '../components/TalaveraPattern.jsx'

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    '¡Hola! Soy Pipo 👋 Tu asistente de salud del IMSS Puebla.\nCuéntame cómo te sientes o qué necesitas hoy.'
}

const QUICK_CHIPS = [
  { label: 'Tengo síntomas',     text: 'Tengo síntomas, me siento mal',         icon: Activity },
  { label: 'Quiero una cita',    text: 'Quiero agendar una cita médica',        icon: Calendar },
  { label: 'Es una emergencia',  text: 'Es una emergencia, necesito ayuda ya',  icon: AlertCircle }
]

export default function ChatView() {
  const { addExpediente, setCurrentView } = useAppContext()
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [municipio, setMunicipio] = useState('')
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll automático al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Detección sencilla de municipio en el último mensaje user
  const detectarMunicipio = (text) => {
    const municipiosPuebla = [
      'puebla', 'cholula', 'san andrés cholula', 'san pedro cholula',
      'atlixco', 'tehuacán', 'huejotzingo', 'amozoc', 'cuautlancingo',
      'san martín texmelucan', 'valsequillo'
    ]
    const lower = text.toLowerCase()
    const found = municipiosPuebla.find(m => lower.includes(m))
    if (found && found !== municipio) setMunicipio(found)
  }

  const sendMessage = async (textRaw) => {
    const text = (textRaw ?? input).trim()
    if (!text || isTyping) return

    detectarMunicipio(text)

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    // Historial enviado al backend SIN el mensaje de bienvenida
    const historialParaBackend = newMessages
      .filter(m => m.id !== 'welcome')
      .map(({ role, content }) => ({ role, content }))

    try {
      const res = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historialParaBackend,
          municipio: municipio || undefined
        })
      })

      if (!res.ok) throw new Error('Bad response')
      const data = await res.json()

      if (data.status === 'finalizado' && data.expediente) {
        addExpediente(data.expediente)
        const cierre = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content:
            '✅ He generado tu expediente clínico. Te llevo a verlo junto con tu QR.'
        }
        setMessages([...newMessages, cierre])
        setIsTyping(false)
        setTimeout(() => setCurrentView('expediente'), 800)
        return
      }

      if (data.message) {
        const assistantMsg = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.message
        }
        setMessages([...newMessages, assistantMsg])
      }
    } catch (err) {
      const errorMsg = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content:
          '⚠️ No pude conectar con el servicio en este momento. Verifica tu conexión o vuelve a intentarlo en unos segundos.'
      }
      setMessages([...newMessages, errorMsg])
    } finally {
      setIsTyping(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  const handleChipClick = (text) => {
    setInput(text)
    inputRef.current?.focus()
  }

  return (
    <div className="relative flex flex-col h-full pb-20 md:pb-0">
      <TalaveraPattern />

      {/* Header */}
      <header className="relative bg-[#080869] border-b-[6px] border-[#E6A231] text-white px-4 md:px-6 py-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#E6A231] flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">
              <Bot className="w-7 h-7 md:w-8 md:h-8 text-[#080869]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#080869]" />
          </div>
          <div className="flex-1">
            <h2 className="font-black uppercase tracking-widest text-xl md:text-2xl">Pipo</h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-400/40">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                En línea
              </span>
              <span className="text-xs text-white/70">Triaje Médico IMSS</span>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-[#E6A231] hidden md:block" />
        </div>
      </header>

      {/* Mensajes */}
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E6A231] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[#080869]" />
            </div>
            <div className="bg-white border-2 border-[#080869]/20 rounded-2xl rounded-bl-sm px-4 py-3 shadow-[2px_2px_0px_rgba(8,8,105,0.1)]">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E6A231] typing-dot" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 rounded-full bg-[#E6A231] typing-dot" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 rounded-full bg-[#E6A231] typing-dot" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chips rápidos */}
      <div className="relative px-4 md:px-6 pt-2 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {QUICK_CHIPS.map(({ label, text, icon: Icon }) => (
            <button
              key={label}
              onClick={() => handleChipClick(text)}
              type="button"
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-[#080869] rounded-full text-xs font-bold uppercase tracking-wider text-[#080869] shadow-[2px_2px_0px_#E6A231] hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="relative px-4 md:px-6 py-4 bg-[#ECF9FF] border-t-2 border-[#080869]/10 shrink-0"
      >
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Cuéntale a Pipo cómo te sientes…"
            disabled={isTyping}
            className="flex-1 px-4 py-3 bg-white border-[3px] border-[#080869] rounded-2xl shadow-[3px_3px_0px_rgba(8,8,105,0.15)] focus:outline-none focus:border-[#E6A231] text-[#080869] placeholder:text-[#080869]/40 text-sm disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="bg-[#080869] text-white border-2 border-[#080869] rounded-2xl px-4 py-3 shadow-[3px_3px_0px_#E6A231] hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0px_#E6A231] flex items-center justify-center"
            aria-label="Enviar"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#E6A231] flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-[#080869]" />
        </div>
      )}
      <div
        className={`max-w-[80%] md:max-w-[65%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-[#080869] text-white rounded-2xl rounded-br-sm shadow-[3px_3px_0px_rgba(230,162,49,0.4)]'
            : 'bg-white border-2 border-[#080869]/20 text-[#080869] rounded-2xl rounded-bl-sm shadow-[2px_2px_0px_rgba(8,8,105,0.1)]'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}
