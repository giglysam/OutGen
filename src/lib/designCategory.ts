import { MESH_ITEMS } from '../data/promptCatalog'
import type { OutfitSelection } from '../types'
import type { PrintProductId } from './credits'

const PRIORITY: Record<PrintProductId, number> = {
  outerwear: 7,
  hoodie: 6,
  pants: 5,
  sweatshirt: 4,
  shorts: 3,
  tee: 2,
  cap: 1,
}

function classifyMeshId(meshId: string): PrintProductId {
  if (meshId.includes('hoodie')) return 'hoodie'
  if (
    meshId.includes('shorts') ||
    meshId === 'sweat-shorts' ||
    meshId === 'bermuda-denim' ||
    meshId === 'skirt-mini'
  ) {
    return 'shorts'
  }
  if (
    meshId.includes('puffer') ||
    meshId.includes('bomber') ||
    meshId.includes('varsity') ||
    meshId.includes('denim-jacket') ||
    meshId.includes('windbreaker') ||
    meshId.includes('track-jacket') ||
    meshId.includes('blazer') ||
    meshId.includes('vest')
  ) {
    return 'outerwear'
  }
  if (
    meshId.includes('cargo') ||
    meshId.includes('joggers') ||
    meshId.includes('jeans') ||
    meshId.includes('chinos') ||
    meshId.includes('trousers') ||
    meshId.includes('flare')
  ) {
    return 'pants'
  }
  if (meshId.includes('quarter-zip')) return 'sweatshirt'
  if (meshId === 'cap' || meshId === 'beanie') return 'cap'
  return 'tee'
}

/** Primary garment type for printing — from outfit pieces picked in studio */
export function inferPrintProduct(selection: OutfitSelection): PrintProductId {
  if (!selection.meshIds.length) return 'tee'

  let best: PrintProductId = 'tee'
  let bestScore = 0

  for (const meshId of selection.meshIds) {
    const product = classifyMeshId(meshId)
    const score = PRIORITY[product] ?? 1
    if (score > bestScore) {
      bestScore = score
      best = product
    }
  }

  return best
}

export function primaryGarmentLabel(selection: OutfitSelection): string {
  if (!selection.meshIds.length) return 'T-shirt'
  const first = MESH_ITEMS.find((m) => m.id === selection.meshIds[0])
  return first?.label ?? 'Garment'
}
