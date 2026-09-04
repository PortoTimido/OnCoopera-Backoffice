import { AlarmClock, Info } from 'lucide-react'
import type { SupportSchedule } from '../model/supportTypes'

export function SupportScheduleCard({ schedule }: { schedule: SupportSchedule[] }) {
  return <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-[4px_4px_0_rgba(187,202,196,0.45)]">
    <h2 className="flex items-center gap-3 border-b border-line pb-4 font-display text-2xl text-admin-text"><AlarmClock className="text-brand-teal" size={21} />Horários</h2>
    <div className="rounded-lg bg-surface-mint px-3 py-2 text-xs text-brand-teal"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-brand-mint" />Aberto agora <span className="ml-2 text-muted">Fecha às 18:00</span></div>
    <div className="grid">
      {schedule.map((entry, index) => <div className="flex min-h-9 items-center justify-between gap-2 border-b border-[#bbcac4]/20 py-1.5 text-xs last:border-0" key={entry.day}>
        <span className={index === 0 ? 'font-semibold text-brand-teal' : 'text-admin-text'}>{entry.day}</span>
        {entry.closed ? <span className="rounded bg-red-50 px-2 py-1 text-[10px] text-red-700">Fechado</span> : <span className="flex flex-wrap justify-end gap-1">{entry.periods.map((period) => <span className="rounded bg-[#edf0ef] px-2 py-1 text-[10px] text-admin-text" key={period}>{period}</span>)}</span>}
      </div>)}
    </div>
    <p className="flex items-start gap-2 text-[10px] leading-4 text-muted"><Info className="mt-0.5 shrink-0 text-brand-teal" size={14} />Horário de almoço<br />12:00 às 13:00 (não atendemos neste período)</p>
  </section>
}
