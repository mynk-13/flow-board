import { describe, it, expect } from 'vitest'
import { getLabelDef, PRESET_LABELS } from './labels'

describe('getLabelDef', () => {
  it('returns correct definition for a known preset label', () => {
    const def = getLabelDef('bug')
    expect(def.value).toBe('bug')
    expect(def.label).toBe('Bug')
    expect(def.bg).toBe('#fef2f2')
    expect(def.fg).toBe('#991b1b')
    expect(def.dot).toBe('#ef4444')
  })

  it('is case-insensitive', () => {
    expect(getLabelDef('BUG').label).toBe('Bug')
    expect(getLabelDef('Feature').label).toBe('Feature')
    expect(getLabelDef('INFRA').label).toBe('Infra')
  })

  it('returns a neutral fallback for an unknown label', () => {
    const def = getLabelDef('my-custom-tag')
    expect(def.value).toBe('my-custom-tag')
    expect(def.label).toBe('my-custom-tag')
    expect(def.bg).toBe('#f1f5f9')
    expect(def.fg).toBe('#475569')
    expect(def.dot).toBe('#94a3b8')
  })

  it('covers all preset labels without throwing', () => {
    for (const preset of PRESET_LABELS) {
      const def = getLabelDef(preset.value)
      expect(def.value).toBe(preset.value)
      expect(def.bg).toBeTruthy()
      expect(def.fg).toBeTruthy()
      expect(def.dot).toBeTruthy()
    }
  })

  it('handles empty string gracefully', () => {
    const def = getLabelDef('')
    expect(def.bg).toBe('#f1f5f9')
  })
})
