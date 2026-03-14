import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  /** Optional dot color */
  dotColor?: string
  /** Optional icon rendered before the label */
  icon?: React.ReactNode
  /** Optional description shown below the label in the dropdown panel */
  description?: string
}

interface SelectDropdownProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
  /** Extra classes on the outer wrapper div */
  className?: string
  /** Extra classes applied directly to the trigger button (e.g. height overrides) */
  triggerClassName?: string
}

export function SelectDropdown({
  value,
  onChange,
  options,
  disabled = false,
  className = '',
  triggerClassName = '',
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value) ?? options[0]

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open])

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'}
          ${open ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : ''}
          ${triggerClassName}`}
      >
        {selected?.dotColor && (
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: selected.dotColor }}
          />
        )}
        {selected?.icon && <span className="shrink-0 opacity-70">{selected.icon}</span>}
        <span>{selected?.label ?? '—'}</span>
        <ChevronDown
          size={11}
          className={`ml-0.5 shrink-0 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full z-200 mt-1.5 min-w-max overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-xs transition-colors hover:bg-slate-50
                  ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}
              >
                {/* Dot or icon */}
                <span className="mt-0.5 shrink-0">
                  {opt.dotColor ? (
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: opt.dotColor }}
                    />
                  ) : opt.icon ? (
                    <span className="opacity-70">{opt.icon}</span>
                  ) : null}
                </span>

                <span className="flex-1">
                  <span className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>
                    {opt.label}
                  </span>
                  {opt.description && (
                    <span className="block text-[11px] text-slate-400 mt-0.5 font-normal">
                      {opt.description}
                    </span>
                  )}
                </span>

                {isSelected && (
                  <Check size={12} className="shrink-0 mt-0.5 text-indigo-500" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
