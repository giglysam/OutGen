import type { PromptItem } from '../types'

/** Base scene — prepended to every outfit prompt */
export const BASE_SCENE =
  'Ultra high resolution fashion editorial photograph, photorealistic, professional studio softbox lighting, neutral grey seamless backdrop, sharp fabric microtexture, single adult fashion model in relaxed neutral stance, full body in frame, luxury streetwear campaign quality, 8k detail, accurate anatomy and garment drape'

export const MESH_ITEMS: PromptItem[] = [
  { id: 'hoodie-pullover', label: 'Sweat à capuche', category: 'Hauts', prompt: 'pullover hoodie with generous hood volume, kangaroo pocket, ribbed cuffs and hem' },
  { id: 'hoodie-zip', label: 'Hoodie zippé', category: 'Hauts', prompt: 'full-zip hoodie with metal zipper track, split kangaroo pockets, structured hood' },
  { id: 'hoodie-cropped', label: 'Hoodie crop', category: 'Hauts', prompt: 'cropped pullover hoodie exposing midriff, wide ribbed hem band, compact hood' },
  { id: 'hoodie-oversized', label: 'Hoodie oversize', category: 'Hauts', prompt: 'dramatically oversized drop-shoulder hoodie with elongated sleeves and deep hood' },
  { id: 'crew-tee', label: 'T-shirt col rond', category: 'Hauts', prompt: 'classic crew neck short sleeve t-shirt, clean shoulder seams, retail fit' },
  { id: 'boxy-tee', label: 'T-shirt boxy', category: 'Hauts', prompt: 'boxy oversized short sleeve tee with wide body and cropped length' },
  { id: 'longsleeve-tee', label: 'T-shirt manches longues', category: 'Hauts', prompt: 'long sleeve crew neck jersey tee, slim tubular sleeves' },
  { id: 'vneck-tee', label: 'T-shirt col V', category: 'Hauts', prompt: 'slim v-neck short sleeve t-shirt, deep but modest plunge' },
  { id: 'polo', label: 'Polo', category: 'Hauts', prompt: 'structured pique polo shirt with two-button placket and ribbed collar' },
  { id: 'oxford-shirt', label: 'Chemise Oxford', category: 'Hauts', prompt: 'button-down oxford shirt with chest pocket, crisp collar roll' },
  { id: 'bomber', label: 'Bomber', category: 'Outerwear', prompt: 'classic MA-1 style bomber jacket with ribbed collar cuffs hem, zip front, utility sleeve pocket' },
  { id: 'varsity', label: 'Varsity', category: 'Outerwear', prompt: 'varsity jacket with contrast leather or faux-leather sleeves, striped rib trims, snap front' },
  { id: 'puffer-narrow', label: 'Doudoune fines quilts', category: 'Outerwear', prompt: 'narrow-channel down puffer jacket, high collar, matte technical shell' },
  { id: 'puffer-wide', label: 'Doudoune larges quilts', category: 'Outerwear', prompt: 'wide-baffle puffer jacket, voluminous silhouette, glossy or satin shell' },
  { id: 'windbreaker', label: 'Coupe-vent', category: 'Outerwear', prompt: 'lightweight windbreaker with hood, half-zip or full-zip, crinkled nylon texture' },
  { id: 'denim-jacket', label: 'Veste en jean', category: 'Outerwear', prompt: 'classic trucker denim jacket with chest flap pockets, contrast stitching' },
  { id: 'track-jacket', label: 'Veste de survêtement', category: 'Outerwear', prompt: 'retro track jacket with stand collar, contrast side stripes, zip front' },
  { id: 'blazer', label: 'Blazer', category: 'Outerwear', prompt: 'single-breasted tailored blazer, notch lapels, structured shoulders' },
  { id: 'cargo-pants', label: 'Pantalon cargo', category: 'Bas', prompt: 'technical cargo pants with multiple bellows pockets, articulated knees, taper below knee' },
  { id: 'joggers', label: 'Joggers', category: 'Bas', prompt: 'tapered sweatpants joggers with elastic cuffs and drawstring waist, clean side seams' },
  { id: 'wide-trousers', label: 'Pantalon large', category: 'Bas', prompt: 'wide-leg tailored trousers with pressed creases, high waist' },
  { id: 'denim-jeans', label: 'Jean droit', category: 'Bas', prompt: 'straight leg five-pocket denim jeans, mid rise, subtle whiskering' },
  { id: 'baggy-jeans', label: 'Jean baggy', category: 'Bas', prompt: 'baggy y2k style denim jeans with pooling at sneakers, low-slung fit' },
  { id: 'shorts-athletic', label: 'Short sport', category: 'Bas', prompt: 'above-knee athletic mesh or woven shorts with contrast binding' },
  { id: 'shorts-cargo', label: 'Short cargo', category: 'Bas', prompt: 'cargo shorts with side utility pockets, belt loops, knee length' },
  { id: 'sweat-shorts', label: 'Short molleton', category: 'Bas', prompt: 'fleece sweat shorts with elastic waist, minimal design' },
  { id: 'skirt-mini', label: 'Jupe', category: 'Bas', prompt: 'structured mini skirt with clean hem, contemporary silhouette' },
  { id: 'beanie', label: 'Bonnet', category: 'Accessoires', prompt: 'close-fitting rib knit beanie hat' },
  { id: 'cap', label: 'Casquette', category: 'Accessoires', prompt: 'six-panel curved brim baseball cap with stitched eyelets' },
  { id: 'tote', label: 'Tote bag', category: 'Accessoires', prompt: 'large canvas tote bag carried in hand, minimal branding area' },
  { id: 'crossbody', label: 'Sac bandoulière', category: 'Accessoires', prompt: 'compact crossbody bag with wide strap across torso' },
  { id: 'socks-crew', label: 'Chaussettes', category: 'Accessoires', prompt: 'mid crew socks visible above sneakers, ribbed texture' },
]

export const FIT_ITEMS: PromptItem[] = [
  { id: 'fit-oversized', label: 'Oversize', prompt: 'overall oversized volumetric silhouette with exaggerated ease and stacked folds' },
  { id: 'fit-regular', label: 'Régulier', prompt: 'true-to-size regular retail fit, balanced ease, clean lines' },
  { id: 'fit-slim', label: 'Slim', prompt: 'slim tailored fit closely following body lines without tension' },
  { id: 'fit-cropped', label: 'Crop', prompt: 'cropped length proportions emphasizing waist and layering potential' },
  { id: 'fit-cargo', label: 'Cargo', prompt: 'utility cargo proportions with structured pocket volumes' },
  { id: 'fit-zip', label: 'Zip intégral', prompt: 'full-zip front closure emphasized as a key design line' },
  { id: 'fit-pullover', label: 'Pullover', prompt: 'pull-on construction with no front zip, clean chest canvas' },
]

export const FABRIC_ITEMS: PromptItem[] = [
  { id: 'fabric-cotton', label: 'Coton', prompt: 'premium heavyweight cotton jersey with visible loopback or fleece interior where applicable' },
  { id: 'fabric-denim', label: 'Denim', prompt: 'rigid or lightly washed denim with authentic weave and nep texture' },
  { id: 'fabric-fleece', label: 'Molleton', prompt: 'plush brushed fleece interior, soft pill-resistant face' },
  { id: 'fabric-tech', label: 'Tech / nylon', prompt: 'matte technical nylon or polyester ripstop with crisp hand' },
  { id: 'fabric-wool', label: 'Laine', prompt: 'fine merino wool knit or woven suiting hand, subtle nap' },
  { id: 'fabric-leather', label: 'Cuir', prompt: 'full grain or pebbled leather panels with natural creasing' },
  { id: 'fabric-satin', label: 'Satin', prompt: 'liquid satin sheen with specular highlights along folds' },
  { id: 'fabric-linen', label: 'Lin', prompt: 'airy linen blend with characteristic slub and breathable drape' },
]

export const COLOR_ITEMS: PromptItem[] = [
  { id: 'col-black', label: 'Noir', prompt: 'deep neutral black colorway with rich shadows' },
  { id: 'col-white', label: 'Blanc', prompt: 'clean off-white to optic white depending on material' },
  { id: 'col-grey', label: 'Gris', prompt: 'heathered medium grey melange' },
  { id: 'col-red', label: 'Rouge', prompt: 'saturated crimson red accent colorway' },
  { id: 'col-orange', label: 'Orange', prompt: 'vivid safety orange or burnt orange tone' },
  { id: 'col-yellow', label: 'Jaune', prompt: 'golden yellow highlight colorway' },
  { id: 'col-green', label: 'Vert', prompt: 'deep forest or sage green' },
  { id: 'col-teal', label: 'Bleu vert', prompt: 'dark teal petrol tone' },
  { id: 'col-blue', label: 'Bleu', prompt: 'royal or cobalt blue' },
  { id: 'col-navy', label: 'Marine', prompt: 'deep navy ink tone' },
  { id: 'col-purple', label: 'Violet', prompt: 'electric purple or aubergine' },
  { id: 'col-brown', label: 'Marron', prompt: 'warm chocolate brown' },
]

export const COLLAR_ITEMS: PromptItem[] = [
  { id: 'neck-crew', label: 'Col rond', prompt: 'crew neckline with narrow ribbed binding' },
  { id: 'neck-v', label: 'Col V', prompt: 'v-neck opening with clean topstitch' },
  { id: 'neck-hood', label: 'Capuche', prompt: 'integrated hood structure with drawcord channels' },
  { id: 'neck-mock', label: 'Mock neck', prompt: 'mock neck tall collar in self fabric' },
  { id: 'neck-turtle', label: 'Col roulé', prompt: 'fine rib turtleneck collar' },
]

export const SLEEVE_ITEMS: PromptItem[] = [
  { id: 'slv-short', label: 'Manches courtes', prompt: 'short sleeves ending mid bicep' },
  { id: 'slv-long', label: 'Manches longues', prompt: 'full length sleeves to wrist' },
  { id: 'slv-raglan', label: 'Raglan', prompt: 'raglan sleeve insertion with diagonal seam from underarm to neck' },
  { id: 'slv-drop', label: 'Épaule tombante', prompt: 'exaggerated drop shoulder seam placement' },
]

export const DETAIL_ITEMS: PromptItem[] = [
  { id: 'det-pockets', label: 'Poches', prompt: 'visible utility pockets with reinforced bar tacks' },
  { id: 'det-zip', label: 'Zipper', prompt: 'exposed matte metal zippers as graphic elements' },
  { id: 'det-rib', label: 'Bord-côtes', prompt: 'chunky rib knit at cuffs hem and collar' },
  { id: 'det-waist', label: 'Ceinture élastique', prompt: 'wide elasticated waistband with drawcord exit' },
  { id: 'det-cuff', label: 'Poignets serrés', prompt: 'tight ribbed cuffs creating stack at wrist' },
  { id: 'det-hood', label: 'Capuche renforcée', prompt: 'double-layer hood with structured peak' },
  { id: 'det-straps', label: 'Sangles', prompt: 'adjustable webbing straps and hardware' },
  { id: 'det-panels', label: 'Empiècements', prompt: 'colorblocked contrast panels and inset seams' },
  { id: 'det-embroidery', label: 'Broderie', prompt: 'dense tonal embroidery texture on key panels' },
  { id: 'det-print', label: 'Impression', prompt: 'crisp screenprint or digital print graphic-ready flat areas' },
]

export const PATTERN_ITEMS: PromptItem[] = [
  { id: 'pat-solid', label: 'Uni', prompt: 'solid color fields without pattern' },
  { id: 'pat-stripe', label: 'Rayures', prompt: 'bold vertical or horizontal stripe repeat' },
  { id: 'pat-camo', label: 'Camouflage', prompt: 'abstract micro-camo or woodland inspired print' },
  { id: 'pat-check', label: 'Carreaux', prompt: 'tailored check or plaid alignment across seams' },
  { id: 'pat-graphic', label: 'Graphique', prompt: 'large front and back graphic composition zones' },
]

export const FINISH_ITEMS: PromptItem[] = [
  { id: 'fin-matte', label: 'Mat', prompt: 'overall matte finish with suppressed highlights' },
  { id: 'fin-gloss', label: 'Brillant', prompt: 'subtle gloss sheen on synthetic areas' },
  { id: 'fin-vintage', label: 'Vintage wash', prompt: 'sun-faded vintage wash and soft hand' },
  { id: 'fin-distress', label: 'Usé', prompt: 'controlled distressing and frayed edges' },
  { id: 'fin-tech', label: 'Tech sans coutures', prompt: 'laser-cut edges and bonded seams aesthetic' },
]

export function findById(list: PromptItem[], id: string | null): PromptItem | undefined {
  if (!id) return undefined
  return list.find((x) => x.id === id)
}

export function findManyById(list: PromptItem[], ids: string[]): PromptItem[] {
  return ids.map((id) => list.find((x) => x.id === id)).filter(Boolean) as PromptItem[]
}
