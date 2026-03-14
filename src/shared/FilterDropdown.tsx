import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'

export interface DropdownOption {
  value: string
  label: string
  /** Optional colored dot (any valid CSS color or Tailwind bg class) */
  dotColor?: string
}

interface FilterDropdownProps {
  value: string | null
  onChange: (value: string | null) => void
  options: DropdownOption[]
  placeholder: string
  icon?: React.ReactNode
  /** Color of the dot on the trigger when a value is selected */
  activeDotColor?: string
}

export function FilterDropdown({
  value,
  onChange,
  options,
  placeholder,
  icon,
  activeDotColor,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value) ?? null

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
          selected
            ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
            : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-white hover:border-slate-300 hover:text-slate-700'
        }`}
      >
        {/* Dot or icon */}
        {selected ? (
          <span
            className="inline-block h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: activeDotColor ?? selected.dotColor ?? '#6366f1' }}
          />
        ) : icon ? (
          <span className="text-slate-400">{icon}</span>
        ) : null}

        <span>{selected?.label ?? placeholder}</span>
        <ChevronDown
          size={11}
          className={`transition-transform ${open ? 'rotate-180' : ''} text-current opacity-60`}
        />

        {/* Clear button — appears inside trigger when a value is selected */}
        {selected && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onChange(null) }}
            className="ml-0.5 rounded-full p-0.5 hover:bg-indigo-200 transition-colors"
            title="Clear filter"
          >
            <X size={10} />
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 min-w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {/* "All" row */}
          <button
            type="button"
            onClick={() => { onChange(null); setOpen(false) }}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 transition-colors ${
              !value ? 'text-slate-800 font-medium' : 'text-slate-500'
            }`}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-slate-200 shrink-0" />
            All
            {!value && <Check size={11} className="ml-auto text-indigo-500" />}
          </button>

          <div className="h-px bg-slate-100 mx-2" />

          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-50 transition-colors ${
                value === opt.value ? 'text-slate-800 font-medium' : 'text-slate-600'
              }`}
            >
              {opt.dotColor && (
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: opt.dotColor }}
                />
              )}
              {opt.label}
              {value === opt.value && <Check size={11} className="ml-auto text-indigo-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
