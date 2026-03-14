import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { PRESET_LABELS, getLabelDef } from '@/lib/labels'

interface LabelPickerProps {
  selected: string[]
  onChange: (labels: string[]) => void
  disabled?: boolean
}

export function LabelPicker({ selected, onChange, disabled = false }: LabelPickerProps) {
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  function toggle(value: string) {
    if (disabled) return
    if (selected.includes(value)) {
      onChange(selected.filter((l) => l !== value))
    } else {
      onChange([...selected, value])
    }
  }

  function addCustom() {
    const trimmed = customInput.trim()
    if (!trimmed || selected.includes(trimmed)) {
      setCustomInput('')
      setShowCustom(false)
      return
    }
    onChange([...selected, trimmed])
    setCustomInput('')
    setShowCustom(false)
  }

  // Labels that are selected but not in the preset list (custom)
  const customSelected = selected.filter(
    (l) => !PRESET_LABELS.some((p) => p.value === l)
  )

  return (
    <div className="flex flex-col gap-2">
      {/* Preset label grid */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_LABELS.map((def) => {
          const isActive = selected.includes(def.value)
          return (
            <button
              key={def.value}
              type="button"
              disabled={disabled}
              onClick={() => toggle(def.value)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all
                ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:opacity-90 hover:shadow-sm'}
                ${isActive ? 'ring-2' : 'opacity-60 hover:opacity-80'}`}
              style={{
                backgroundColor: def.bg,
                color: def.fg,
                ringColor: def.dot,
                ...(isActive ? { outline: `2px solid ${def.dot}`, outlineOffset: '1px' } : {}),
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: def.dot }}
              />
              {def.label}
            </button>
          )
        })}
      </div>

      {/* Custom labels already selected */}
      {customSelected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {customSelected.map((label) => {
            const def = getLabelDef(label)
            return (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ backgroundColor: def.bg, color: def.fg }}
              >
                {label}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => toggle(label)}
                    className="ml-0.5 rounded-full hover:opacity-70"
                  >
                    <X size={10} />
                  </button>
                )}
              </span>
            )
          })}
        </div>
      )}

      {/* Add custom label */}
      {!disabled && (
        showCustom ? (
          <div className="flex items-center gap-1.5 mt-0.5">
            <input
              autoFocus
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addCustom() }
                if (e.key === 'Escape') { setShowCustom(false); setCustomInput('') }
              }}
              placeholder="Custom label…"
              className="w-36 rounded-lg border border-indigo-300 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={!customInput.trim()}
              className="rounded-lg bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setShowCustom(false); setCustomInput('') }}
              className="rounded-lg px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="mt-0.5 inline-flex items-center gap-1 self-start rounded-lg border border-dashed border-slate-300 px-2 py-1 text-[11px] text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
          >
            <Plus size={11} /> Custom label
          </button>
        )
      )}
    </div>
  )
}
