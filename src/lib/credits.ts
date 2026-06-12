export type PrintProductId =
  | 'tee'
  | 'shorts'
  | 'hoodie'
  | 'sweatshirt'
  | 'pants'
  | 'cap'
  | 'outerwear'

export type PrintQualityId = 'light_cotton' | 'heavy_cotton' | 'premium_blend'

/** 1 credit = $10 */
export const CREDIT_USD = 10
export const SUBSCRIPTION_PRICE_USD = 30
export const SUBSCRIPTION_CREDITS_PER_MONTH = 3
export const EXTRA_CREDIT_PRICE_USD = CREDIT_USD
export const WELCOME_CREDITS = 1
export const PRINT_ETA_DAYS = 7

export const PRINT_PRODUCTS: {
  id: PrintProductId
  label: string
  baseCredits: number
  usdFrom: number
  description: string
}[] = [
  { id: 'tee', label: 'T-shirt', baseCredits: 1, usdFrom: 10, description: 'Tees & light tops' },
  { id: 'shorts', label: 'Shorts', baseCredits: 1, usdFrom: 10, description: 'Shorts & skirts' },
  { id: 'cap', label: 'Cap', baseCredits: 1, usdFrom: 10, description: 'Caps & beanies' },
  { id: 'sweatshirt', label: 'Sweatshirt', baseCredits: 2, usdFrom: 20, description: 'Sweatshirts & quarter-zips' },
  { id: 'pants', label: 'Pants', baseCredits: 3, usdFrom: 30, description: 'Jeans, cargos, joggers' },
  { id: 'hoodie', label: 'Hoodie', baseCredits: 4, usdFrom: 40, description: 'Hoodies & zip-ups' },
  { id: 'outerwear', label: 'Jacket / coat', baseCredits: 6, usdFrom: 60, description: 'Puffers, bombers, vests' },
]

export const PRINT_QUALITIES: {
  id: PrintQualityId
  label: string
  extraCredits: number
  extraUsd: number
  description: string
}[] = [
  { id: 'light_cotton', label: 'Light cotton', extraCredits: 0, extraUsd: 0, description: 'Standard — included' },
  { id: 'heavy_cotton', label: 'Heavy cotton', extraCredits: 1, extraUsd: 10, description: 'Thicker fabric (+$10)' },
  { id: 'premium_blend', label: 'Premium', extraCredits: 4, extraUsd: 40, description: 'Best quality (+$40)' },
]

export function productLabel(id: PrintProductId): string {
  return PRINT_PRODUCTS.find((p) => p.id === id)?.label ?? id
}

export function creditsPerUnit(product: PrintProductId, quality: PrintQualityId): number {
  const base = PRINT_PRODUCTS.find((p) => p.id === product)?.baseCredits ?? 1
  const extra = PRINT_QUALITIES.find((q) => q.id === quality)?.extraCredits ?? 0
  return base + extra
}

export function usdEstimate(product: PrintProductId, quality: PrintQualityId, quantity: number): number {
  return creditsPerUnit(product, quality) * CREDIT_USD * Math.max(1, quantity)
}

export function totalPrintCredits(
  product: PrintProductId,
  quality: PrintQualityId,
  quantity: number,
): number {
  return creditsPerUnit(product, quality) * Math.max(1, quantity)
}
