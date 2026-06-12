import type { OutfitSelection } from '../types'

export const DEFAULT_OUTFIT_SELECTION: OutfitSelection = {
  meshIds: [],
  fitId: null,
  fabricId: null,
  colorId: null,
  collarId: null,
  sleeveId: null,
  detailIds: [],
  patternId: null,
  finishId: null,
}

/** Ensure JSONB / partial saves never leave meshIds or detailIds undefined */
export function normalizeSelection(raw?: Partial<OutfitSelection> | null): OutfitSelection {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_OUTFIT_SELECTION }

  return {
    meshIds: Array.isArray(raw.meshIds) ? raw.meshIds : [],
    fitId: raw.fitId ?? null,
    fabricId: raw.fabricId ?? null,
    colorId: raw.colorId ?? null,
    collarId: raw.collarId ?? null,
    sleeveId: raw.sleeveId ?? null,
    detailIds: Array.isArray(raw.detailIds) ? raw.detailIds : [],
    patternId: raw.patternId ?? null,
    finishId: raw.finishId ?? null,
  }
}
