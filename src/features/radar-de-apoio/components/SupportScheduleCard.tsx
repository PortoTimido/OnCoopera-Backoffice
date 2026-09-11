import { AlarmClock, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AdminCreateSelect } from '../../settings/components/AdminCreateSelect'
import type { SupportSchedule } from '../model/supportTypes'

const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const dayOptions = days.map((label, index) => ({ label, value: String(index) }))
const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, '0')
  const minutes = index % 2 === 0 ? '00' : '30'
  const value = `${hour}:${minutes}`
  return { label: value, value }
})
const timePickerOptions = [{ label: 'Selecione', value: '' }, ...timeOptions]
const fieldButtonClass = 'h-10 rounded-lg !border !border-[#bbcac4]/35 bg-white px-3 text-sm font-normal shadow-none'

export function SupportScheduleCard({ schedule, onChange }: { schedule: SupportSchedule[]; onChange: (schedule: SupportSchedule[]) => void }) {
  const [day, setDay] = useState('1')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [error, setError] = useState('')

  function addSchedule() {
    if (!startTime || !endTime) { setError('Informe o horário de início e fim.'); return }
    if (startTime >= endTime) { setError('O horário de início deve ser anterior ao fim.'); return }
    onChange([...schedule, { diaSemana: Number(day), horarioInicio: startTime, horarioFim: endTime }])
    setStartTime('')
    setEndTime('')
    setError('')
  }

  function removeSchedule(index: number) { onChange(schedule.filter((_, currentIndex) => currentIndex !== index)) }

  return <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-[4px_4px_0_rgba(187,202,196,0.45)]">
    <h2 className="flex items-center gap-3 border-b border-line pb-4 font-display text-2xl text-admin-text"><AlarmClock className="text-brand-teal" size={21} />Horários</h2>
    <div className="grid gap-3 rounded-xl bg-surface-mint p-3">
      <AdminCreateSelect buttonClassName={fieldButtonClass} className="text-xs font-bold text-admin-text" label="Dia da semana" menuClassName="z-20" onChange={(value) => { setDay(value); setError('') }} options={dayOptions} tone="adminField" value={day} />
      <div className="grid grid-cols-2 gap-2">
        <AdminCreateSelect buttonClassName={fieldButtonClass} className="text-xs font-bold text-admin-text" label="Início" menuClassName="z-20" onChange={(value) => { setStartTime(value); setError('') }} options={timePickerOptions} tone="adminField" value={startTime} />
        <AdminCreateSelect buttonClassName={fieldButtonClass} className="text-xs font-bold text-admin-text" label="Fim" menuClassName="z-20" onChange={(value) => { setEndTime(value); setError('') }} options={timePickerOptions} tone="adminField" value={endTime} />
      </div>
      <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-teal px-3 text-sm font-bold text-white" onClick={addSchedule} type="button"><Plus size={16} />Adicionar horário</button>
      {error ? <p className="text-xs font-semibold text-red-700" role="alert">{error}</p> : null}
    </div>
    <div className="grid">{days.map((label, dayIndex) => {
      const entries = schedule.map((entry, index) => ({ entry, index })).filter(({ entry }) => entry.diaSemana === dayIndex)
      return <div className="flex min-h-9 items-center justify-between gap-2 border-b border-[#bbcac4]/20 py-2 text-xs last:border-0" key={label}><span className="text-admin-text">{label}</span>{entries.length ? <span className="flex flex-wrap justify-end gap-1">{entries.map(({ entry, index }) => <span className="inline-flex items-center gap-1 rounded bg-[#edf0ef] py-1 pl-2 pr-1 text-[10px] text-admin-text" key={`${entry.horarioInicio}-${entry.horarioFim}-${index}`}>{entry.horarioInicio} – {entry.horarioFim}<button aria-label={`Remover horário de ${label}: ${entry.horarioInicio} até ${entry.horarioFim}`} className="grid h-5 w-5 place-items-center rounded text-muted hover:bg-white hover:text-red-700" onClick={() => removeSchedule(index)} type="button"><Trash2 size={12} /></button></span>)}</span> : <span className="text-[10px] text-muted">Fechado</span>}</div>
    })}</div>
  </section>
}
