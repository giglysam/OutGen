import type { PromptItem } from '../types'

/** Base scene — prepended to every outfit prompt */
export const BASE_SCENE =
  'Ultra high resolution fashion editorial photograph, photorealistic, professional studio softbox lighting, neutral grey seamless backdrop, sharp fabric microtexture, single adult fashion model in relaxed neutral stance, full body in frame, luxury streetwear campaign quality, 8k detail, accurate anatomy and garment drape'

export const MESH_ITEMS: PromptItem[] = [
  { id: 'hoodie-pullover', label: 'Pullover hoodie', category: 'Tops', prompt: 'pullover hoodie with generous hood volume, kangaroo pocket, ribbed cuffs and hem' },
  { id: 'hoodie-zip', label: 'Zip hoodie', category: 'Tops', prompt: 'full-zip hoodie with metal zipper track, split kangaroo pockets, structured hood' },
  { id: 'hoodie-cropped', label: 'Cropped hoodie', category: 'Tops', prompt: 'cropped pullover hoodie exposing midriff, wide ribbed hem band, compact hood' },
  { id: 'hoodie-oversized', label: 'Oversized hoodie', category: 'Tops', prompt: 'dramatically oversized drop-shoulder hoodie with elongated sleeves and deep hood' },
  {
    id: 'quarter-zip',
    label: 'Quarter-zip sweatshirt',
    category: 'Tops',
    prompt: 'quarter-zip pullover sweatshirt with short zip at chest, stand collar or funnel neck, ribbed cuffs',
  },
  { id: 'crew-tee', label: 'Crew neck tee', category: 'Tops', prompt: 'classic crew neck short sleeve t-shirt, clean shoulder seams, retail fit' },
  { id: 'boxy-tee', label: 'Boxy tee', category: 'Tops', prompt: 'boxy oversized short sleeve tee with wide body and cropped length' },
  { id: 'longsleeve-tee', label: 'Long sleeve tee', category: 'Tops', prompt: 'long sleeve crew neck jersey tee, slim tubular sleeves' },
  { id: 'vneck-tee', label: 'V-neck tee', category: 'Tops', prompt: 'slim v-neck short sleeve t-shirt, deep but modest plunge' },
  {
    id: 'tank-top',
    label: 'Tank top',
    category: 'Tops',
    prompt: 'fitted sleeveless tank top, wide shoulder straps, clean armholes, ribbed or jersey body',
  },
  { id: 'polo', label: 'Polo', category: 'Tops', prompt: 'structured pique polo shirt with two-button placket and ribbed collar' },
  { id: 'oxford-shirt', label: 'Oxford shirt', category: 'Tops', prompt: 'button-down oxford shirt with chest pocket, crisp collar roll' },
  { id: 'bomber', label: 'Bomber', category: 'Outerwear', prompt: 'classic MA-1 style bomber jacket with ribbed collar cuffs hem, zip front, utility sleeve pocket' },
  { id: 'varsity', label: 'Varsity', category: 'Outerwear', prompt: 'varsity jacket with contrast leather or faux-leather sleeves, striped rib trims, snap front' },
  { id: 'puffer-narrow', label: 'Narrow-quilt puffer', category: 'Outerwear', prompt: 'narrow-channel down puffer jacket, high collar, matte technical shell' },
  { id: 'puffer-wide', label: 'Wide-baffle puffer', category: 'Outerwear', prompt: 'wide-baffle puffer jacket, voluminous silhouette, glossy or satin shell' },
  { id: 'windbreaker', label: 'Windbreaker', category: 'Outerwear', prompt: 'lightweight windbreaker with hood, half-zip or full-zip, crinkled nylon texture' },
  { id: 'denim-jacket', label: 'Denim jacket', category: 'Outerwear', prompt: 'classic trucker denim jacket with chest flap pockets, contrast stitching' },
  { id: 'track-jacket', label: 'Track jacket', category: 'Outerwear', prompt: 'retro track jacket with stand collar, contrast side stripes, zip front' },
  { id: 'blazer', label: 'Blazer', category: 'Outerwear', prompt: 'single-breasted tailored blazer, notch lapels, structured shoulders' },
  {
    id: 'puffer-vest',
    label: 'Puffer vest',
    category: 'Outerwear',
    prompt: 'sleeveless down puffer vest, high collar, horizontal quilting, matte technical shell',
  },
  {
    id: 'utility-vest',
    label: 'Utility vest',
    category: 'Outerwear',
    prompt: 'utility vest with multiple zip and flap pockets, mesh panels, technical outdoor styling',
  },
  { id: 'cargo-pants', label: 'Cargo pants', category: 'Bottoms', prompt: 'technical cargo pants with multiple bellows pockets, articulated knees, taper below knee' },
  { id: 'joggers', label: 'Joggers', category: 'Bottoms', prompt: 'tapered sweatpants joggers with elastic cuffs and drawstring waist, clean side seams' },
  { id: 'wide-trousers', label: 'Wide-leg trousers', category: 'Bottoms', prompt: 'wide-leg tailored trousers with pressed creases, high waist' },
  { id: 'denim-jeans', label: 'Straight jeans', category: 'Bottoms', prompt: 'straight leg five-pocket denim jeans, mid rise, subtle whiskering' },
  { id: 'baggy-jeans', label: 'Baggy jeans', category: 'Bottoms', prompt: 'baggy y2k style denim jeans with pooling at sneakers, low-slung fit' },
  {
    id: 'chinos',
    label: 'Chinos',
    category: 'Bottoms',
    prompt: 'slim straight chino trousers, pressed crease, belt loops, cotton twill',
  },
  {
    id: 'flare-pants',
    label: 'Flare pants',
    category: 'Bottoms',
    prompt: 'high-rise trousers with pronounced flare from knee to hem, long clean lines',
  },
  { id: 'shorts-athletic', label: 'Athletic shorts', category: 'Bottoms', prompt: 'above-knee athletic mesh or woven shorts with contrast binding' },
  { id: 'shorts-cargo', label: 'Cargo shorts', category: 'Bottoms', prompt: 'cargo shorts with side utility pockets, belt loops, knee length' },
  { id: 'sweat-shorts', label: 'Fleece shorts', category: 'Bottoms', prompt: 'fleece sweat shorts with elastic waist, minimal design' },
  {
    id: 'bermuda-denim',
    label: 'Denim shorts',
    category: 'Bottoms',
    prompt: 'knee-length denim bermuda shorts, five-pocket styling, frayed or clean hem',
  },
  { id: 'skirt-mini', label: 'Mini skirt', category: 'Bottoms', prompt: 'structured mini skirt with clean hem, contemporary silhouette' },
  { id: 'beanie', label: 'Beanie', category: 'Accessories', prompt: 'close-fitting rib knit beanie hat' },
  { id: 'cap', label: 'Cap', category: 'Accessories', prompt: 'six-panel curved brim baseball cap with stitched eyelets' },
  { id: 'tote', label: 'Tote bag', category: 'Accessories', prompt: 'large canvas tote bag carried in hand, minimal branding area' },
  { id: 'crossbody', label: 'Crossbody bag', category: 'Accessories', prompt: 'compact crossbody bag with wide strap across torso' },
  {
    id: 'duffel',
    label: 'Duffel bag',
    category: 'Accessories',
    prompt: 'large cylindrical duffel bag with twin handles and shoulder strap, athletic travel styling',
  },
  {
    id: 'luggage-roll',
    label: 'Rolling luggage',
    category: 'Accessories',
    prompt: 'upright rolling hardshell suitcase with telescoping handle and spinner wheels',
  },
  {
    id: 'balaclava',
    label: 'Balaclava',
    category: 'Accessories',
    prompt: 'knit balaclava face covering with eye opening, streetwear ski mask aesthetic',
  },
  { id: 'socks-crew', label: 'Crew socks', category: 'Accessories', prompt: 'mid crew socks visible above sneakers, ribbed texture' },
]

export const FIT_ITEMS: PromptItem[] = [
  { id: 'fit-oversized', label: 'Oversized', prompt: 'overall oversized volumetric silhouette with exaggerated ease and stacked folds' },
  { id: 'fit-regular', label: 'Regular', prompt: 'true-to-size regular retail fit, balanced ease, clean lines' },
  { id: 'fit-slim', label: 'Slim', prompt: 'slim tailored fit closely following body lines without tension' },
  { id: 'fit-cropped', label: 'Cropped', prompt: 'cropped length proportions emphasizing waist and layering potential' },
  { id: 'fit-cargo', label: 'Cargo', prompt: 'utility cargo proportions with structured pocket volumes' },
  { id: 'fit-zip', label: 'Full zip', prompt: 'full-zip front closure emphasized as a key design line' },
  { id: 'fit-pullover', label: 'Pullover', prompt: 'pull-on construction with no front zip, clean chest canvas' },
]

export const FABRIC_ITEMS: PromptItem[] = [
  { id: 'fabric-cotton', label: 'Cotton', prompt: 'premium heavyweight cotton jersey with visible loopback or fleece interior where applicable' },
  { id: 'fabric-denim', label: 'Denim', prompt: 'rigid or lightly washed denim with authentic weave and nep texture' },
  { id: 'fabric-fleece', label: 'Fleece', prompt: 'plush brushed fleece interior, soft pill-resistant face' },
  { id: 'fabric-tech', label: 'Tech / nylon', prompt: 'matte technical nylon or polyester ripstop with crisp hand' },
  { id: 'fabric-wool', label: 'Wool', prompt: 'fine merino wool knit or woven suiting hand, subtle nap' },
  { id: 'fabric-leather', label: 'Leather', prompt: 'full grain or pebbled leather panels with natural creasing' },
  { id: 'fabric-satin', label: 'Satin', prompt: 'liquid satin sheen with specular highlights along folds' },
  { id: 'fabric-linen', label: 'Linen', prompt: 'airy linen blend with characteristic slub and breathable drape' },
]

export const COLOR_ITEMS: PromptItem[] = [
  { id: 'col-black', label: 'Black', prompt: 'deep neutral black colorway with rich shadows' },
  { id: 'col-white', label: 'White', prompt: 'clean off-white to optic white depending on material' },
  { id: 'col-grey', label: 'Grey', prompt: 'heathered medium grey melange' },
  { id: 'col-red', label: 'Red', prompt: 'saturated crimson red accent colorway' },
  { id: 'col-orange', label: 'Orange', prompt: 'vivid safety orange or burnt orange tone' },
  { id: 'col-yellow', label: 'Yellow', prompt: 'golden yellow highlight colorway' },
  { id: 'col-green', label: 'Green', prompt: 'deep forest or sage green' },
  { id: 'col-teal', label: 'Teal', prompt: 'dark teal petrol tone' },
  { id: 'col-blue', label: 'Blue', prompt: 'royal or cobalt blue' },
  { id: 'col-navy', label: 'Navy', prompt: 'deep navy ink tone' },
  { id: 'col-purple', label: 'Purple', prompt: 'electric purple or aubergine' },
  { id: 'col-brown', label: 'Brown', prompt: 'warm chocolate brown' },
]

export const COLLAR_ITEMS: PromptItem[] = [
  { id: 'neck-crew', label: 'Crew neck', prompt: 'crew neckline with narrow ribbed binding' },
  { id: 'neck-v', label: 'V-neck', prompt: 'v-neck opening with clean topstitch' },
  { id: 'neck-hood', label: 'Hood', prompt: 'integrated hood structure with drawcord channels' },
  { id: 'neck-mock', label: 'Mock neck', prompt: 'mock neck tall collar in self fabric' },
  { id: 'neck-turtle', label: 'Turtleneck', prompt: 'fine rib turtleneck collar' },
]

export const SLEEVE_ITEMS: PromptItem[] = [
  { id: 'slv-short', label: 'Short sleeves', prompt: 'short sleeves ending mid bicep' },
  { id: 'slv-long', label: 'Long sleeves', prompt: 'full length sleeves to wrist' },
  { id: 'slv-raglan', label: 'Raglan', prompt: 'raglan sleeve insertion with diagonal seam from underarm to neck' },
  { id: 'slv-drop', label: 'Drop shoulder', prompt: 'exaggerated drop shoulder seam placement' },
]

export const DETAIL_ITEMS: PromptItem[] = [
  { id: 'det-pockets', label: 'Pockets', prompt: 'visible utility pockets with reinforced bar tacks' },
  { id: 'det-zip', label: 'Zippers', prompt: 'exposed matte metal zippers as graphic elements' },
  { id: 'det-rib', label: 'Ribbed trims', prompt: 'chunky rib knit at cuffs hem and collar' },
  { id: 'det-waist', label: 'Elastic waist', prompt: 'wide elasticated waistband with drawcord exit' },
  { id: 'det-cuff', label: 'Tight cuffs', prompt: 'tight ribbed cuffs creating stack at wrist' },
  { id: 'det-hood', label: 'Structured hood', prompt: 'double-layer hood with structured peak' },
  { id: 'det-straps', label: 'Straps', prompt: 'adjustable webbing straps and hardware' },
  { id: 'det-panels', label: 'Panels', prompt: 'colorblocked contrast panels and inset seams' },
  { id: 'det-embroidery', label: 'Embroidery', prompt: 'dense tonal embroidery texture on key panels' },
  { id: 'det-print', label: 'Print', prompt: 'crisp screenprint or digital print graphic-ready flat areas' },
]

export const PATTERN_ITEMS: PromptItem[] = [
  { id: 'pat-solid', label: 'Solid', prompt: 'solid color fields without pattern' },
  { id: 'pat-stripe', label: 'Stripes', prompt: 'bold vertical or horizontal stripe repeat' },
  { id: 'pat-camo', label: 'Camo', prompt: 'abstract micro-camo or woodland inspired print' },
  { id: 'pat-check', label: 'Plaid', prompt: 'tailored check or plaid alignment across seams' },
  { id: 'pat-graphic', label: 'Graphic', prompt: 'large front and back graphic composition zones' },
]

export const FINISH_ITEMS: PromptItem[] = [
  { id: 'fin-matte', label: 'Matte', prompt: 'overall matte finish with suppressed highlights' },
  { id: 'fin-gloss', label: 'Glossy', prompt: 'subtle gloss sheen on synthetic areas' },
  { id: 'fin-vintage', label: 'Vintage wash', prompt: 'sun-faded vintage wash and soft hand' },
  { id: 'fin-distress', label: 'Distressed', prompt: 'controlled distressing and frayed edges' },
  { id: 'fin-tech', label: 'Seamless tech', prompt: 'laser-cut edges and bonded seams aesthetic' },
]

/** One-tap English fragments appended to creative notes (advanced keyboard). */
export const CREATIVE_SNIPPETS: { id: string; label: string; snippet: string }[] = [
  { id: 'sn-huge-type', label: 'XXL type', snippet: 'oversized chest typography in clean neo-grotesk, high contrast, perfectly kerned' },
  { id: 'sn-arch-logo', label: 'Arch logo', snippet: 'small curved arch logo lockup above chest, embroidery or puff print' },
  { id: 'sn-back-hit', label: 'Back graphic', snippet: 'large back print spanning shoulder blades, centered composition' },
  { id: 'sn-sleeve-hit', label: 'Sleeve detail', snippet: 'repeat micro logo running along left sleeve outer seam' },
  { id: 'sn-metallic', label: 'Metallic foil', snippet: 'metallic foil accent hits on selected panels only, tasteful not garish' },
  { id: 'sn-neon-edge', label: 'Neon piping', snippet: 'thin neon edge piping on seams and hood outline, cyber streetwear vibe' },
  { id: 'sn-monogram', label: 'Monogram', snippet: 'all-over tonal monogram jacquard subtle luxury repeat' },
  { id: 'sn-patches', label: 'Patches', snippet: 'mix of woven label patches and rubberized badges, asymmetric placement' },
  { id: 'sn-deboss', label: 'Debossed logo', snippet: 'debossed tonal logo into heavyweight fabric, shadow depth' },
  { id: 'sn-gradient', label: 'Airbrush fade', snippet: 'airbrushed color gradient fade across torso, soft and premium' },
  { id: 'sn-tech-print', label: 'Tech motif', snippet: 'futuristic micro QR-like graphic motif as texture, not readable QR' },
  { id: 'sn-vintage-crack', label: 'Cracked ink', snippet: 'intentionally cracked vintage ink print texture on graphics' },
]

export function findById(list: PromptItem[], id: string | null): PromptItem | undefined {
  if (!id) return undefined
  return list.find((x) => x.id === id)
}

export function findManyById(list: PromptItem[], ids: string[]): PromptItem[] {
  return ids.map((id) => list.find((x) => x.id === id)).filter(Boolean) as PromptItem[]
}
