import type { ReactNode } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { cx } from '../../../lib/cx'

export type AdminCreateSelectOption<TValue extends string> = {
  label: string
  value: TValue
}

export function AdminCreateSelect<TValue extends string>({
  buttonClassName,
  className,
  label,
  labelClassName,
  leftElement,
  menuClassName,
  onChange,
  optionClassName,
  options,
  tone = 'settings',
  value,
}: {
  buttonClassName?: string
  className?: string
  label: string
  labelClassName?: string
  leftElement?: ReactNode
  menuClassName?: string
  onChange: (value: TValue) => void
  optionClassName?: string
  options: Array<AdminCreateSelectOption<TValue>>
  tone?: 'settings' | 'adminField'
  value: TValue
}) {
  const [isOpen, setIsOpen] = useState(false)
  const generatedId = useId()
  const labelId = `${generatedId}-label`
  const listboxId = `${generatedId}-listbox`
  const selectedOption = options.find((option) => option.value === value) ?? options[0]
  const isAdminField = tone === 'adminField'

  function selectOption(nextValue: TValue) {
    onChange(nextValue)
    setIsOpen(false)
  }

  return (
    <div
      className={cx('relative grid gap-2 text-sm font-semibold text-ink-strong', className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false)
        }
      }}
    >
      <span className={labelClassName} id={labelId}>
        {label}
      </span>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={labelId}
        className={cx(
          isAdminField
            ? 'relative flex h-11 w-full items-center justify-between rounded-xl border-0 bg-[#e6e9e8] px-10 text-left text-sm text-admin-text outline-none shadow-[inset_2px_2px_4px_rgba(215,219,218,0.8)] transition focus:ring-4 focus:ring-brand-mint/20'
            : 'relative flex h-13 w-full items-center justify-between rounded-xl border-2 border-[#e9efeb] bg-surface-mint px-5 text-left text-base text-admin-text outline-none shadow-[inset_3px_3px_6px_2px_rgba(0,0,0,0.04),inset_-3px_-3px_6px_2px_rgba(255,255,255,0.7)] transition focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20',
          leftElement ? 'pl-10' : undefined,
          buttonClassName,
          isOpen ? 'border-brand-mint ring-4 ring-brand-mint/20' : undefined,
        )}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsOpen(false)
          }
        }}
        role="combobox"
        type="button"
      >
        {leftElement ? <span className="pointer-events-none absolute left-3.5 top-1/2 grid -translate-y-1/2 place-items-center text-muted-strong">{leftElement}</span> : null}
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown className={cx('shrink-0 text-muted transition', isOpen ? 'rotate-180 text-brand-teal' : undefined)} size={isAdminField ? 16 : 20} strokeWidth={2} />
      </button>

      {isOpen ? (
        <div
          className={cx(
            'absolute left-0 right-0 top-[calc(100%+8px)] z-10 max-h-64 overflow-y-auto rounded-2xl border border-brand-mint/30 bg-white p-1.5 shadow-[6px_6px_0_rgba(187,202,196,0.35),0_18px_36px_rgba(15,23,42,0.08)]',
            menuClassName,
          )}
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
        >
          {options.map((option) => {
            const isSelected = option.value === value

            return (
              <button
                aria-selected={isSelected}
                className={cx(
                  'flex min-h-11 w-full items-center justify-between rounded-xl px-4 py-2 text-left text-sm transition',
                  optionClassName,
                  isSelected ? 'bg-brand-mint/25 font-bold text-brand-teal' : 'text-admin-text hover:bg-surface-mint',
                )}
                key={option.value}
                onClick={() => selectOption(option.value)}
                role="option"
                type="button"
              >
                <span>{option.label}</span>
                {isSelected ? <Check size={18} strokeWidth={2.4} /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
