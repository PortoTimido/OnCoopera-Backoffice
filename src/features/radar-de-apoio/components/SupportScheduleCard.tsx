import { AlarmClock, Check, Copy, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { AdminCreateSelect } from '../../settings/components/AdminCreateSelect'
import { cx } from '../../../lib/cx'
import type { SupportSchedule } from '../model/supportTypes'

const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const dayOptions = days.map((label, index) => ({ label, value: String(index) }))
const timeOptions = Array.from({ length: 48 }, (_, index) => { const value = `${String(Math.floor(index / 2)).padStart(2, '0')}:${index % 2 === 0 ? '00' : '30'}`; return { label: value, value } })
const timePickerOptions = [{ label: 'Selecione', value: '' }, ...timeOptions]
const fieldButtonClass = 'h-10 rounded-lg !border !border-[#bbcac4]/35 bg-white px-3 text-sm font-normal shadow-none'

export function SupportScheduleCard({ schedule, onChange }: { schedule: SupportSchedule[]; onChange: (schedule: SupportSchedule[]) => void }) {
  const [day, setDay] = useState('1')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [error, setError] = useState('')
  const [copySource, setCopySource] = useState<{ entry: SupportSchedule; index: number } | null>(null)
  const [copyDays, setCopyDays] = useState<number[]>([])

  function addSchedule() {
    if (!startTime || !endTime) { setError('Informe o horário de início e fim.'); return }
    if (startTime >= endTime) { setError('O horário de início deve ser anterior ao fim.'); return }
    onChange([...schedule, { diaSemana: Number(day), horarioInicio: startTime, horarioFim: endTime }])
    setStartTime(''); setEndTime(''); setError('')
  }
  function removeSchedule(index: number) { onChange(schedule.filter((_, currentIndex) => currentIndex !== index)); if (copySource?.index === index) { setCopySource(null); setCopyDays([]) } }
  function openCopy(source: SupportSchedule, index: number) { setCopySource({ entry: source, index }); setCopyDays([]) }
  function toggleCopyDay(dayIndex: number) { setCopyDays((current) => current.includes(dayIndex) ? current.filter((value) => value !== dayIndex) : [...current, dayIndex]) }
  function duplicateSchedule() {
    if (!copySource || copyDays.length === 0) return
    const additions = copyDays.filter((dayIndex) => !schedule.some((entry) => entry.diaSemana === dayIndex && entry.horarioInicio === copySource.entry.horarioInicio && entry.horarioFim === copySource.entry.horarioFim)).map((dayIndex) => ({ ...copySource.entry, diaSemana: dayIndex }))
    onChange([...schedule, ...additions])
    setCopySource(null); setCopyDays([])
  }

  return <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-[4px_4px_0_rgba(187,202,196,0.45)]">
    <h2 className="flex items-center gap-3 border-b border-line pb-4 font-display text-2xl text-admin-text"><AlarmClock className="text-brand-teal" size={21} />Horários</h2>
    <div className="grid gap-3 rounded-xl bg-surface-mint p-3"><AdminCreateSelect buttonClassName={fieldButtonClass} className="text-xs font-bold text-admin-text" label="Dia da semana" menuClassName="z-20" onChange={(value) => { setDay(value); setError('') }} options={dayOptions} tone="adminField" value={day} /><div className="grid grid-cols-2 gap-2"><AdminCreateSelect buttonClassName={fieldButtonClass} className="text-xs font-bold text-admin-text" label="Início" menuClassName="z-20" onChange={(value) => { setStartTime(value); setError('') }} options={timePickerOptions} tone="adminField" value={startTime} /><AdminCreateSelect buttonClassName={fieldButtonClass} className="text-xs font-bold text-admin-text" label="Fim" menuClassName="z-20" onChange={(value) => { setEndTime(value); setError('') }} options={timePickerOptions} tone="adminField" value={endTime} /></div><button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-teal px-3 text-sm font-bold text-white" onClick={addSchedule} type="button"><Plus size={16} />Adicionar horário</button>{error ? <p className="text-xs font-semibold text-red-700" role="alert">{error}</p> : null}</div>
    {copySource ? <div className="grid gap-3 rounded-xl border border-brand-mint/45 bg-surface-mint p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-admin-text">Duplicar horário</p><p className="text-xs text-muted">{copySource.entry.horarioInicio} – {copySource.entry.horarioFim} de {days[copySource.entry.diaSemana]}</p></div><button aria-label="Cancelar duplicação" className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-white" onClick={() => { setCopySource(null); setCopyDays([]) }} type="button"><X size={16} /></button></div><div className="flex flex-wrap gap-1.5">{days.map((label, index) => { const isSourceDay = index === copySource.entry.diaSemana; const selected = copyDays.includes(index); return <button aria-pressed={selected} className={cx('h-8 rounded-lg px-2 text-xs font-bold transition', isSourceDay ? 'cursor-not-allowed bg-[#e0e3e2] text-muted' : selected ? 'bg-brand-teal text-white' : 'bg-white text-admin-text hover:bg-brand-mint/25')} disabled={isSourceDay} key={label} onClick={() => toggleCopyDay(index)} type="button">{label.slice(0, 3)}</button> })}</div><button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-brand-teal bg-white px-3 text-sm font-bold text-brand-teal disabled:cursor-not-allowed disabled:opacity-50" disabled={copyDays.length === 0} onClick={duplicateSchedule} type="button"><Check size={15} />Duplicar para {copyDays.length} {copyDays.length === 1 ? 'dia' : 'dias'}</button></div> : null}
    <div className="grid">{days.map((label, dayIndex) => { const entries = schedule.map((entry, index) => ({ entry, index })).filter(({ entry }) => entry.diaSemana === dayIndex); return <div className="flex min-h-9 items-center justify-between gap-2 border-b border-[#bbcac4]/20 py-2 text-xs last:border-0" key={label}><span className="text-admin-text">{label}</span>{entries.length ? <span className="flex flex-wrap justify-end gap-1">{entries.map(({ entry, index }) => <span className="inline-flex items-center gap-1 rounded bg-[#edf0ef] py-1 pl-2 pr-1 text-[10px] text-admin-text" key={`${entry.horarioInicio}-${entry.horarioFim}-${index}`}>{entry.horarioInicio} – {entry.horarioFim}<button aria-label={`Duplicar horário de ${label}: ${entry.horarioInicio} até ${entry.horarioFim}`} className="grid h-5 w-5 place-items-center rounded text-muted hover:bg-white hover:text-brand-teal" onClick={() => openCopy(entry, index)} type="button"><Copy size={12} /></button><button aria-label={`Remover horário de ${label}: ${entry.horarioInicio} até ${entry.horarioFim}`} className="grid h-5 w-5 place-items-center rounded text-muted hover:bg-white hover:text-red-700" onClick={() => removeSchedule(index)} type="button"><Trash2 size={12} /></button></span>)}</span> : <span className="text-[10px] text-muted">Fechado</span>}</div> })}</div>
  </section>
}
