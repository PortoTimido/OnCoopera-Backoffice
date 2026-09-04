import { AlarmClock, Info } from 'lucide-react'
import type { SupportSchedule } from '../model/supportTypes'

const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

export function SupportScheduleCard({ schedule }: { schedule: SupportSchedule[] }) {
  const schedulesByDay = new Map<number, SupportSchedule[]>()
  schedule.forEach((entry) => schedulesByDay.set(entry.diaSemana, [...(schedulesByDay.get(entry.diaSemana) ?? []), entry]))
  return <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-[4px_4px_0_rgba(187,202,196,0.45)]"><h2 className="flex items-center gap-3 border-b border-line pb-4 font-display text-2xl text-admin-text"><AlarmClock className="text-brand-teal" size={21} />Horários</h2>{schedule.length === 0 ? <p className="rounded-lg bg-surface-mint px-3 py-3 text-sm text-muted">Horários não informados.</p> : <div className="grid">{days.map((day, index) => { const entries = schedulesByDay.get(index) ?? []; return <div className="flex min-h-9 items-center justify-between gap-2 border-b border-[#bbcac4]/20 py-1.5 text-xs last:border-0" key={day}><span className="text-admin-text">{day}</span>{entries.length ? <span className="flex flex-wrap justify-end gap-1">{entries.map((entry) => <span className="rounded bg-[#edf0ef] px-2 py-1 text-[10px] text-admin-text" key={`${entry.horarioInicio}-${entry.horarioFim}`}>{entry.horarioInicio} – {entry.horarioFim}</span>)}</span> : <span className="text-[10px] text-muted">Fechado</span>}</div> })}</div>}<p className="flex items-start gap-2 text-[10px] leading-4 text-muted"><Info className="mt-0.5 shrink-0 text-brand-teal" size={14} />Os horários são definidos pelo backend.</p></section>
}
