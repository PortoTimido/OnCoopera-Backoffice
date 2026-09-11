import { useEffect, useId, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cx } from '../../lib/cx'

type DatePickerProps = {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  min?: string
  max?: string
  className?: string
}

const weekDayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const monthLabels = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? null : date
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDisplayDate(value: string): string {
  const date = parseIsoDate(value)
  if (!date) return ''
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}

function maskDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)
  if (digits.length <= 2) return day
  if (digits.length <= 4) return `${day}/${month}`
  return `${day}/${month}/${year}`
}

function parseTypedDate(text: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text)
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)
  const isRealCalendarDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day

  return isRealCalendarDate ? date : null
}

/** Date picker global do design system: pode ser digitado no formato dd/mm/aaaa ou preenchido pelo calendário. */
export function DatePicker({ id, label, value, onChange, placeholder = 'dd/mm/aaaa', required, min, max, className }: DatePickerProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const containerRef = useRef<HTMLDivElement>(null)
  const monthMenuRef = useRef<HTMLDivElement>(null)
  const yearMenuRef = useRef<HTMLDivElement>(null)
  const yearListRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false)
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false)
  const selectedDate = parseIsoDate(value)
  const [viewDate, setViewDate] = useState(() => selectedDate ?? new Date())
  const [textValue, setTextValue] = useState(() => formatDisplayDate(value))
  const [lastSyncedValue, setLastSyncedValue] = useState(value)

  if (value !== lastSyncedValue) {
    setLastSyncedValue(value)
    setViewDate(selectedDate ?? new Date())
    setTextValue(formatDisplayDate(value))
  }

  function closeCalendar() {
    setIsOpen(false)
    setIsMonthMenuOpen(false)
    setIsYearMenuOpen(false)
  }

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (containerRef.current && !containerRef.current.contains(target)) { closeCalendar(); return }
      if (monthMenuRef.current && !monthMenuRef.current.contains(target)) setIsMonthMenuOpen(false)
      if (yearMenuRef.current && !yearMenuRef.current.contains(target)) setIsYearMenuOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeCalendar()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isYearMenuOpen) return
    const selectedYearButton = yearListRef.current?.querySelector('[data-selected="true"]')
    selectedYearButton?.scrollIntoView({ block: 'center' })
  }, [isYearMenuOpen])

  const minDate = min ? parseIsoDate(min) : null
  const maxDate = max ? parseIsoDate(max) : null

  function isDisabled(date: Date) {
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    return false
  }

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startWeekday = new Date(year, month, 1).getDay()

  const cells: Array<Date | null> = [...Array(startWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1))]
  while (cells.length % 7 !== 0) cells.push(null)

  const currentYear = new Date().getFullYear()
  const earliestYear = minDate ? minDate.getFullYear() : currentYear - 120
  const latestYear = maxDate ? maxDate.getFullYear() : currentYear + 10
  const years: number[] = []
  for (let candidateYear = latestYear; candidateYear >= earliestYear; candidateYear--) years.push(candidateYear)

  function selectDate(date: Date) {
    if (isDisabled(date)) return
    setTextValue(formatDisplayDate(toIsoDate(date)))
    setLastSyncedValue(toIsoDate(date))
    onChange(toIsoDate(date))
    setIsOpen(false)
  }

  function handleTextChange(event: ChangeEvent<HTMLInputElement>) {
    const masked = maskDateInput(event.target.value)
    setTextValue(masked)

    if (masked === '') { setLastSyncedValue(''); onChange(''); return }

    const typedDate = parseTypedDate(masked)
    if (typedDate && !isDisabled(typedDate)) {
      setLastSyncedValue(toIsoDate(typedDate))
      onChange(toIsoDate(typedDate))
      setViewDate(typedDate)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      {label ? <label className="mb-1.5 block text-sm font-bold text-muted-strong" htmlFor={inputId}>{label}</label> : null}
      <div className="relative">
        <input
          className={cx(className, 'pr-11')}
          id={inputId}
          inputMode="numeric"
          maxLength={10}
          onChange={handleTextChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          value={textValue}
        />
        <button
          aria-label="Abrir calendário"
          className="absolute right-3.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-surface-soft hover:text-brand-teal"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          <Calendar aria-hidden="true" size={17} />
        </button>
      </div>
      {isOpen ? (
        <div className="absolute z-20 mt-2 w-80 rounded-2xl border border-line bg-white p-4 shadow-[5px_5px_0_rgba(187,202,196,0.55)]" role="dialog">
          <div className="flex items-center gap-2">
            <button aria-label="Mês anterior" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-strong transition hover:bg-surface-soft" onClick={() => setViewDate(new Date(year, month - 1, 1))} type="button">
              <ChevronLeft size={16} />
            </button>
            <div className="flex flex-1 items-stretch rounded-lg border border-line bg-white">
              <div className="relative flex-1" ref={monthMenuRef}>
                <button
                  aria-expanded={isMonthMenuOpen}
                  className="flex w-full items-center justify-center gap-1 rounded-l-lg px-2 py-1.5 text-xs font-bold text-admin-text transition hover:bg-surface-soft"
                  onClick={() => { setIsMonthMenuOpen((open) => !open); setIsYearMenuOpen(false) }}
                  type="button"
                >
                  {monthLabels[month]}
                  <ChevronDown className="text-muted" size={12} />
                </button>
                {isMonthMenuOpen ? (
                  <div className="absolute left-0 top-full z-30 mt-1 max-h-48 w-32 overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-[3px_3px_0_rgba(187,202,196,0.55)]">
                    {monthLabels.map((monthLabel, index) => (
                      <button
                        className={cx(
                          'block w-full rounded-lg px-2 py-1.5 text-left text-xs',
                          index === month ? 'bg-brand-teal font-bold text-white' : 'text-admin-text hover:bg-surface-mint',
                        )}
                        key={monthLabel}
                        onClick={() => { setViewDate(new Date(year, index, 1)); setIsMonthMenuOpen(false) }}
                        type="button"
                      >
                        {monthLabel}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <span aria-hidden="true" className="w-px bg-line" />
              <div className="relative" ref={yearMenuRef}>
                <button
                  aria-expanded={isYearMenuOpen}
                  className="flex items-center justify-center gap-1 rounded-r-lg px-2 py-1.5 text-xs font-bold text-admin-text transition hover:bg-surface-soft"
                  onClick={() => { setIsYearMenuOpen((open) => !open); setIsMonthMenuOpen(false) }}
                  type="button"
                >
                  {year}
                  <ChevronDown className="text-muted" size={12} />
                </button>
                {isYearMenuOpen ? (
                  <div className="absolute right-0 top-full z-30 mt-1 max-h-48 w-20 overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-[3px_3px_0_rgba(187,202,196,0.55)]" ref={yearListRef}>
                  {years.map((yearOption) => (
                    <button
                      className={cx(
                        'block w-full rounded-lg px-2 py-1.5 text-left text-xs',
                        yearOption === year ? 'bg-brand-teal font-bold text-white' : 'text-admin-text hover:bg-surface-mint',
                      )}
                      data-selected={yearOption === year}
                      key={yearOption}
                      onClick={() => { setViewDate(new Date(yearOption, month, 1)); setIsYearMenuOpen(false) }}
                      type="button"
                    >
                      {yearOption}
                    </button>
                  ))}
                </div>
              ) : null}
              </div>
            </div>
            <button aria-label="Próximo mês" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-strong transition hover:bg-surface-soft" onClick={() => setViewDate(new Date(year, month + 1, 1))} type="button">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted">
            {weekDayLabels.map((weekDay, index) => <span key={`${weekDay}-${index}`}>{weekDay}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((date, index) => {
              if (!date) return <span key={index} />
              const disabled = isDisabled(date)
              const isSelected = Boolean(selectedDate && toIsoDate(date) === toIsoDate(selectedDate))

              return (
                <button
                  className={cx(
                    'h-8 w-8 rounded-full text-sm transition',
                    isSelected ? 'bg-brand-teal font-bold text-white' : 'text-admin-text hover:bg-surface-mint',
                    disabled ? 'cursor-not-allowed opacity-30 hover:bg-transparent' : undefined,
                  )}
                  disabled={disabled}
                  key={index}
                  onClick={() => selectDate(date)}
                  type="button"
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
