import {
  COLLAR_ITEMS,
  COLOR_ITEMS,
  DETAIL_ITEMS,
  FABRIC_ITEMS,
  FINISH_ITEMS,
  FIT_ITEMS,
  MESH_ITEMS,
  PATTERN_ITEMS,
  SLEEVE_ITEMS,
  findById,
  findManyById,
} from '../data/promptCatalog'
import type { OutfitSelection } from '../types'
import { normalizeSelection } from './normalizeSelection'

/** Human-readable labels for what the user picked in the studio */
export function selectionChoiceLabels(selection: OutfitSelection): string[] {
  const sel = normalizeSelection(selection)
  const labels: string[] = []

  for (const mesh of findManyById(MESH_ITEMS, sel.meshIds)) labels.push(mesh.label)
  const fit = findById(FIT_ITEMS, sel.fitId)
  if (fit) labels.push(fit.label)
  const fabric = findById(FABRIC_ITEMS, sel.fabricId)
  if (fabric) labels.push(fabric.label)
  const color = findById(COLOR_ITEMS, sel.colorId)
  if (color) labels.push(color.label)
  const collar = findById(COLLAR_ITEMS, sel.collarId)
  if (collar) labels.push(collar.label)
  const sleeve = findById(SLEEVE_ITEMS, sel.sleeveId)
  if (sleeve) labels.push(sleeve.label)
  for (const detail of findManyById(DETAIL_ITEMS, sel.detailIds)) labels.push(detail.label)
  const pattern = findById(PATTERN_ITEMS, sel.patternId)
  if (pattern) labels.push(pattern.label)
  const finish = findById(FINISH_ITEMS, sel.finishId)
  if (finish) labels.push(finish.label)

  return labels
}

export function selectionSummaryLine(selection: OutfitSelection): string {
  const labels = selectionChoiceLabels(selection)
  if (labels.length === 0) return 'No pieces chosen yet'
  if (labels.length <= 3) return labels.join(' · ')
  return `${labels.slice(0, 3).join(' · ')} +${labels.length - 3} more`
}
