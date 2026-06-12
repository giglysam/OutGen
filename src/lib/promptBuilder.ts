import {
  BASE_SCENE,
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
import type { OutfitSelection, ViewAngle } from '../types'

const ANGLE_PROMPTS: Record<ViewAngle, string> = {
  front:
    'Camera: straight-on full frontal view, entire outfit visible head to toe, symmetrical framing, eye-level lens.',
  back:
    'Camera: full back view showing entire outfit from behind, hair does not obscure garment details, eye-level lens.',
  left:
    'Camera: three-quarter left profile, model turned 45 degrees showing left side volumes and seam lines.',
  right:
    'Camera: three-quarter right profile, model turned 45 degrees showing right side volumes and seam lines.',
  top:
    'Camera: elevated high angle looking down at model, emphasis on shoulders chest and upper garment topology.',
  down:
    'Camera: low hero angle from shin height upward, dramatic perspective emphasizing silhouette and footwear stack.',
}

export function buildGarmentDescription(sel: OutfitSelection): string {
  const meshes = findManyById(MESH_ITEMS, sel.meshIds)
  const garment =
    meshes.length > 0
      ? `Outfit composed of: ${meshes.map((m) => m.prompt).join('; ')}.`
      : 'Contemporary streetwear outfit with cohesive styling.'

  const parts: string[] = [garment]

  const fit = findById(FIT_ITEMS, sel.fitId)
  if (fit) parts.push(fit.prompt)

  const fabric = findById(FABRIC_ITEMS, sel.fabricId)
  if (fabric) parts.push(fabric.prompt)

  const color = findById(COLOR_ITEMS, sel.colorId)
  if (color) parts.push(color.prompt)

  const collar = findById(COLLAR_ITEMS, sel.collarId)
  if (collar) parts.push(collar.prompt)

  const sleeve = findById(SLEEVE_ITEMS, sel.sleeveId)
  if (sleeve) parts.push(sleeve.prompt)

  const details = findManyById(DETAIL_ITEMS, sel.detailIds)
  if (details.length) parts.push(details.map((d) => d.prompt).join(' '))

  const pattern = findById(PATTERN_ITEMS, sel.patternId)
  if (pattern) parts.push(pattern.prompt)

  const finish = findById(FINISH_ITEMS, sel.finishId)
  if (finish) parts.push(finish.prompt)

  return parts.join(' ')
}

export function buildFullPrompt(
  sel: OutfitSelection,
  logoDescription: string,
  userNotes: string,
  angle: ViewAngle,
): string {
  const garment = buildGarmentDescription(sel)
  const logo = logoDescription.trim()
    ? `Branding requirement: ${logoDescription.trim()}, integrated believably on garments with correct perspective and curvature.`
    : ''
  const notes = userNotes.trim() ? `Additional creative direction: ${userNotes.trim()}.` : ''

  const chunks = [BASE_SCENE, garment, logo, notes, ANGLE_PROMPTS[angle]].filter(Boolean)
  return chunks.join(' ')
}

export const VIEW_ORDER: ViewAngle[] = ['front', 'back', 'left', 'right', 'top', 'down']

export const VIEW_LABELS: Record<ViewAngle, string> = {
  front: 'Front',
  back: 'Back',
  left: 'Left ¾',
  right: 'Right ¾',
  top: 'High angle',
  down: 'Low angle',
}
