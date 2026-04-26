import React, { useState } from 'react'
import {
  Settings, User, Bell, Shield, Sliders, LogOut,
  ChevronRight, Heart, Globe, Languages
} from 'lucide-react'
import { useAppContext } from '../context/AppContext.jsx'
import TalaveraPattern from '../components/TalaveraPattern.jsx'

export default function AjustesView() {
  const { profiles, activeProfileId, setActiveProfileId } = useAppContext()
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0]
  const inicial = activeProfile?.name?.charAt(0).toUpperCase() || '?'

  const [notif, setNotif] = useState({
    citas: true,
    medicamentos: true,
    promo: false,
    emergencias: true
  })

  const toggle = (key) => setNotif(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="relative min-h-full pb-20 md:pb-0">
      <TalaveraPattern />

      {/* Header */}
      <header className="relative bg-[#080869] border-b-[6px] border-[#E6A231] text-white px-4 md:px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E6A231] flex items-center justify-center">
            <Settings className="w-6 h-6 text-[#080869]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#E6A231]">
              Configuración personal
            </p>
            <h2 className="font-black uppercase tracking-widest text-xl md:text-2xl">Ajustes</h2>
          </div>
        </div>
      </header>

      <div className="relative p-4 md:p-8 space-y-6 max-w-3xl mx-auto">
        {/* Perfil activo */}
        <section className="bg-white border-[3px] border-[#080869] rounded-2xl shadow-[4px_4px_0px_rgba(8,8,105,0.15)] p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#E6A231] border-[3px] border-[#080869] flex items-center justify-center font-black text-2xl text-[#080869] shadow-[3px_3px_0px_rgba(8,8,105,0.2)]">
              {inicial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#080869]/60">
                Perfil activo
              </p>
              <h3 className="font-black uppercase tracking-wider text-[#080869] text-lg truncate">
                {activeProfile?.name}
              </h3>
              {activeProfile?.chronicCondition && (
                <p className="text-xs text-[#080869]/70 mt-0.5 inline-flex items-center gap-1">
                  <Heart className="w-3 h-3 text-[#E6A231]" />
                  {activeProfile.chronicCondition}
                </p>
              )}
            </div>
          </div>

          {profiles.length > 1 && (
            <div className="mt-4 pt-4 border-t-2 border-dashed border-[#080869]/15">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#080869]/60 mb-2">
                Cambiar perfil
              </p>
              <div className="flex gap-2 flex-wrap">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActiveProfileId(p.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border-2 transition-all ${
                      p.id === activeProfileId
                        ? 'bg-[#080869] text-white border-[#080869] shadow-[2px_2px_0px_#E6A231]'
                        : 'bg-white text-[#080869] border-[#080869]/40 hover:border-[#080869]'
                    }`}
                  >
                    {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Perfil */}
        <SectionCard title="Perfil" icon={User}>
          <SettingRow label="Datos personales" />
          <SettingRow label="Información médica" />
          <SettingRow label="Contactos de emergencia" />
          <SettingRow label="Alergias y medicamentos" />
        </SectionCard>

        {/* Notificaciones */}
        <SectionCard title="Notificaciones" icon={Bell}>
          <ToggleRow label="Recordatorios de citas"      checked={notif.citas}        onChange={() => toggle('citas')} />
          <ToggleRow label="Recordatorios de medicamentos" checked={notif.medicamentos} onChange={() => toggle('medicamentos')} />
          <ToggleRow label="Alertas epidemiológicas"     checked={notif.emergencias}  onChange={() => toggle('emergencias')} />
          <ToggleRow label="Promociones y noticias IMSS" checked={notif.promo}        onChange={() => toggle('promo')} />
        </SectionCard>

        {/* Privacidad */}
        <SectionCard title="Privacidad" icon={Shield}>
          <SettingRow label="Política de privacidad" />
          <SettingRow label="Compartir datos con IMSS" />
          <SettingRow label="Descargar mis datos" />
          <SettingRow label="Eliminar cuenta" danger />
        </SectionCard>

        {/* Preferencias */}
        <SectionCard title="Preferencias" icon={Sliders}>
          <SettingRow label="Idioma" icon={Languages} value="Español" />
          <SettingRow label="Región" icon={Globe} value="Puebla, MX" />
          <SettingRow label="Tema visual" value="Claro" />
        </SectionCard>

        {/* Cerrar sesión */}
        <button
          className="w-full bg-[#8B1538] text-white border-2 border-[#8B1538] rounded-2xl px-5 py-4 font-black uppercase tracking-widest text-sm shadow-[3px_3px_0px_rgba(139,21,56,0.4)] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>

        {/* Footer */}
        <footer className="text-center pt-4 pb-2 space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-[#080869]/60">
            Versión 1.0.0 · Pipo IMSS Puebla
          </p>
          <p className="text-xs font-black uppercase tracking-widest text-[#080869]">
            Hecho en México 🇲🇽
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[#080869]/50 font-bold">
            Gobierno de Puebla
          </p>
        </footer>
      </div>
    </div>
  )
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <section className="bg-white border-[3px] border-[#080869] rounded-2xl shadow-[4px_4px_0px_rgba(8,8,105,0.15)] overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-[#ECF9FF] border-b-2 border-[#080869]/15">
        <Icon className="w-4 h-4 text-[#E6A231]" />
        <h3 className="font-black uppercase tracking-widest text-[#080869] text-sm">{title}</h3>
      </div>
      <div className="divide-y-2 divide-[#080869]/10">
        {children}
      </div>
    </section>
  )
}

function SettingRow({ label, value, icon: Icon, danger = false }) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-[#ECF9FF] transition-colors text-left ${
        danger ? 'text-[#8B1538]' : 'text-[#080869]'
      }`}
    >
      {Icon && <Icon className="w-4 h-4 opacity-70" />}
      <span className="flex-1 font-bold text-sm">{label}</span>
      {value && <span className="text-xs text-[#080869]/60 font-semibold">{value}</span>}
      <ChevronRight className="w-4 h-4 opacity-40" />
    </button>
  )
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <span className="flex-1 font-bold text-sm text-[#080869]">{label}</span>
      <button
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        className={`relative w-12 h-7 rounded-full border-2 transition-all ${
          checked
            ? 'bg-[#080869] border-[#080869]'
            : 'bg-white border-[#080869]/40'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full transition-all ${
            checked ? 'left-[22px] bg-[#E6A231]' : 'left-0.5 bg-[#080869]/40'
          }`}
        />
      </button>
    </div>
  )
}
