export type PrintProductId = 'tee' | 'hoodie' | 'sweatshirt' | 'cargo' | 'cap'
export type PrintQualityId = 'light_cotton' | 'heavy_cotton' | 'premium_blend'

export const SUBSCRIPTION_PRICE_USD = 30
export const SUBSCRIPTION_CREDITS_PER_MONTH = 3
export const EXTRA_CREDIT_PRICE_USD = 10
export const WELCOME_CREDITS = 1
export const PRINT_ETA_DAYS = 7

export const PRINT_PRODUCTS: {
  id: PrintProductId
  label: string
  baseCredits: number
  description: string
}[] = [
  { id: 'tee', label: 'T-shirt', baseCredits: 1, description: 'Classic crew tee print' },
  { id: 'hoodie', label: 'Hoodie', baseCredits: 3, description: 'Pullover or zip hoodie' },
  { id: 'sweatshirt', label: 'Sweatshirt', baseCredits: 2, description: 'Crew or quarter-zip' },
  { id: 'cargo', label: 'Cargo pants', baseCredits: 2, description: 'Technical cargo' },
  { id: 'cap', label: 'Cap', baseCredits: 1, description: 'Structured cap' },
]

export const PRINT_QUALITIES: {
  id: PrintQualityId
  label: string
  extraCredits: number
  description: string
}[] = [
  { id: 'light_cotton', label: 'Light cotton', extraCredits: 0, description: 'Soft, breathable' },
  { id: 'heavy_cotton', label: 'Heavy cotton', extraCredits: 1, description: 'Thick, premium hand-feel' },
  { id: 'premium_blend', label: 'Premium blend', extraCredits: 2, description: 'Best color & durability' },
]

export function creditsPerUnit(product: PrintProductId, quality: PrintQualityId): number {
  const base = PRINT_PRODUCTS.find((p) => p.id === product)?.baseCredits ?? 1
  const extra = PRINT_QUALITIES.find((q) => q.id === quality)?.extraCredits ?? 0
  return base + extra
}

export function totalPrintCredits(
  product: PrintProductId,
  quality: PrintQualityId,
  quantity: number,
): number {
  return creditsPerUnit(product, quality) * Math.max(1, quantity)
}
