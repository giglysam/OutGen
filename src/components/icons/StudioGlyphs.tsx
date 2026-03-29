import type { ReactNode } from 'react'

export type StudioCategory =
  | 'pieces'
  | 'coupe'
  | 'matiere'
  | 'couleur'
  | 'col'
  | 'manches'
  | 'motif'
  | 'finition'
  | 'details'
  | 'texte'

function SvgFrame({ children, className = 'h-9 w-9' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}

/** Line-art garment / option icons (keyboard keys) */
export function MeshGlyph({ id }: { id: string }) {
  switch (id) {
    case 'hoodie-pullover':
    case 'hoodie-oversized':
      return (
        <SvgFrame>
          <path d="M14 20c0-6 4-10 10-10s10 4 10 10v22H14V20z" />
          <path d="M14 22h-4l-4-6 6-4 6 4" />
          <path d="M34 22h4l4-6-6-4-6 4" />
          <path d="M20 42v-8h8v8" />
          <path d="M18 14c2-4 5-6 6-6s4 2 6 6" />
        </SvgFrame>
      )
    case 'hoodie-zip':
      return (
        <SvgFrame>
          <path d="M14 20c0-6 4-10 10-10s10 4 10 10v22H14V20z" />
          <path d="M24 18v14" />
          <path d="M24 22h.01" />
          <path d="M24 28h.01" />
          <path d="M14 22h-4l-4-6 6-4 6 4" />
          <path d="M34 22h4l4-6-6-4-6 4" />
        </SvgFrame>
      )
    case 'hoodie-cropped':
      return (
        <SvgFrame>
          <path d="M14 18c0-5 4-8 10-8s10 3 10 8v14H14V18z" />
          <path d="M14 20h-4l-3-5 5-3 5 3" />
          <path d="M34 20h4l3-5-5-3-5 3" />
          <path d="M18 32h12" />
        </SvgFrame>
      )
    case 'crew-tee':
    case 'boxy-tee':
    case 'longsleeve-tee':
    case 'vneck-tee':
      return (
        <SvgFrame>
          <path d="M16 18h16v20H16V18z" />
          <path d="M16 18l-5-4-3 5 6 5" />
          <path d="M32 18l5-4 3 5-6 5" />
          {id === 'vneck-tee' && <path d="M22 18l2 4h4l2-4" />}
          {id === 'longsleeve-tee' && (
            <>
              <path d="M11 22v14" />
              <path d="M37 22v14" />
            </>
          )}
        </SvgFrame>
      )
    case 'polo':
      return (
        <SvgFrame>
          <path d="M16 18h16v20H16V18z" />
          <path d="M22 18v6l2 2 2-2v-6" />
          <path d="M16 18l-5-4-3 5 6 5" />
          <path d="M32 18l5-4 3 5-6 5" />
        </SvgFrame>
      )
    case 'oxford-shirt':
      return (
        <SvgFrame>
          <path d="M15 17h18v22H15V17z" />
          <path d="M24 17v22" />
          <path d="M15 17l-5-3-3 5 7 5" />
          <path d="M33 17l5-3 3 5-7 5" />
          <path d="M19 22h4v3h-4z" />
        </SvgFrame>
      )
    case 'bomber':
    case 'varsity':
      return (
        <SvgFrame>
          <path d="M13 19c1-5 5-9 11-9s10 4 11 9v21H13V19z" />
          <path d="M13 21h-4l-3-5 5-4 6 4" />
          <path d="M35 21h4l3-5-5-4-6 4" />
          <path d="M18 26h12v8H18z" />
          {id === 'varsity' && <path d="M15 32h6M27 32h6" strokeDasharray="2 2" />}
        </SvgFrame>
      )
    case 'puffer-narrow':
    case 'puffer-wide':
      return (
        <SvgFrame>
          <path d="M12 18h24v22H12V18z" />
          <path d="M12 22h24M12 28h24M12 34h24" />
          <path d="M18 18v22M24 18v22M30 18v22" />
          <path d="M18 14h12l2 4h-16z" />
        </SvgFrame>
      )
    case 'windbreaker':
      return (
        <SvgFrame>
          <path d="M14 20h20v20H14V20z" />
          <path d="M20 16l4-3 4 3" />
          <path d="M14 22l-4-2v-4l4 2" />
          <path d="M34 22l4-2v-4l-4 2" />
          <path d="M22 26h4v8h-4z" />
        </SvgFrame>
      )
    case 'denim-jacket':
    case 'track-jacket':
      return (
        <SvgFrame>
          <path d="M13 18h22v22H13V18z" />
          <path d="M13 20h-4l-3-5 5-3 5 3" />
          <path d="M35 20h4l3-5-5-3-5 3" />
          <path d="M24 18v20" />
          <path d="M17 24h5v4h-5zM26 24h5v4h-5z" />
        </SvgFrame>
      )
    case 'blazer':
      return (
        <SvgFrame>
          <path d="M14 17h20v23H14V17z" />
          <path d="M24 17v23" />
          <path d="M18 17l-6-2-2 6 6 3" />
          <path d="M30 17l6-2 2 6-6 3" />
          <path d="M20 20l4 3 4-3" />
        </SvgFrame>
      )
    case 'cargo-pants':
    case 'joggers':
    case 'wide-trousers':
    case 'denim-jeans':
    case 'baggy-jeans':
      return (
        <SvgFrame>
          <path d="M17 14h14v6H17z" />
          <path d="M17 20h5v20h-5zM26 20h5v20h-5z" />
          {id === 'cargo-pants' ? (
            <>
              <path d="M17 26h4v4h-4zM27 28h4v4h-4z" />
            </>
          ) : null}
        </SvgFrame>
      )
    case 'shorts-athletic':
    case 'shorts-cargo':
    case 'sweat-shorts':
      return (
        <SvgFrame>
          <path d="M17 14h14v5H17z" />
          <path d="M17 19h5v12h-5zM26 19h5v12h-5z" />
          {id === 'shorts-cargo' && <path d="M17 22h4v3h-4z" />}
        </SvgFrame>
      )
    case 'skirt-mini':
      return (
        <SvgFrame>
          <path d="M16 16h16l-2 18H18z" />
          <path d="M16 16c0-3 3-5 8-5s8 2 8 5" />
        </SvgFrame>
      )
    case 'beanie':
      return (
        <SvgFrame>
          <path d="M14 28c0-8 6-14 14-14s14 6 14 14v4H14z" />
          <path d="M16 32h16" />
        </SvgFrame>
      )
    case 'cap':
      return (
        <SvgFrame>
          <path d="M14 26c2-8 8-12 16-10 4 1 6 4 6 8v2H14z" />
          <path d="M12 30h26" />
        </SvgFrame>
      )
    case 'tote':
    case 'crossbody':
      return (
        <SvgFrame>
          <path d="M14 20h20v18H14V20z" />
          <path d="M18 20v-4c0-3 2-5 6-5s6 2 6 5v4" />
          {id === 'crossbody' && <path d="M32 22c4 2 6 6 6 10" />}
        </SvgFrame>
      )
    case 'socks-crew':
      return (
        <SvgFrame>
          <path d="M18 12h6v18h-6zM24 12h6v18h-6z" />
          <path d="M18 30h12v6H18z" />
        </SvgFrame>
      )
    case 'quarter-zip':
      return (
        <SvgFrame>
          <path d="M15 18h18v22H15V18z" />
          <path d="M15 20h-4l-3-5 5-3 5 3" />
          <path d="M33 20h4l3-5-5-3-5 3" />
          <path d="M24 20v12" />
          <path d="M22 20h4" />
        </SvgFrame>
      )
    case 'tank-top':
      return (
        <SvgFrame>
          <path d="M18 20h12v18H18V20z" />
          <path d="M18 20l-4-3-2 4 5 3" />
          <path d="M30 20l4-3 2 4-5 3" />
          <path d="M20 16h8v4h-8z" />
        </SvgFrame>
      )
    case 'puffer-vest':
      return (
        <SvgFrame>
          <path d="M14 18h20v22H14V18z" />
          <path d="M14 22h20M14 28h20M14 34h20" />
          <path d="M18 18v22M24 18v22M30 18v22" />
          <path d="M12 20h4M32 20h4" />
        </SvgFrame>
      )
    case 'utility-vest':
      return (
        <SvgFrame>
          <path d="M14 18h20v22H14V18z" />
          <path d="M16 24h6v5h-6zM26 24h6v5h-6z" />
          <path d="M22 22h4v14h-4z" />
          <path d="M12 20h4M32 20h4" />
        </SvgFrame>
      )
    case 'chinos':
      return (
        <SvgFrame>
          <path d="M17 14h14v5H17z" />
          <path d="M17 19h5v21h-5zM26 19h5v21h-5z" />
          <path d="M19 24h10" strokeDasharray="1 2" />
        </SvgFrame>
      )
    case 'flare-pants':
      return (
        <SvgFrame>
          <path d="M17 14h14v5H17z" />
          <path d="M16 19h7v20h-7zM25 19h7v20h-7z" />
          <path d="M16 36l3 4M32 36l-3 4" />
        </SvgFrame>
      )
    case 'bermuda-denim':
      return (
        <SvgFrame>
          <path d="M17 14h14v6H17z" />
          <path d="M17 20h5v11h-5zM26 20h5v11h-5z" />
          <path d="M19 22h10" opacity="0.5" />
        </SvgFrame>
      )
    case 'duffel':
      return (
        <SvgFrame>
          <ellipse cx="24" cy="30" rx="14" ry="8" />
          <path d="M14 26c0-4 4-8 10-8s10 4 10 8" />
          <path d="M18 22h12" />
        </SvgFrame>
      )
    case 'luggage-roll':
      return (
        <SvgFrame>
          <rect x="14" y="16" width="20" height="22" rx="2" />
          <path d="M18 16v-3h12v3" />
          <circle cx="19" cy="40" r="2" />
          <circle cx="29" cy="40" r="2" />
        </SvgFrame>
      )
    case 'balaclava':
      return (
        <SvgFrame>
          <path d="M16 18c0-6 3-10 8-10s8 4 8 10v14c0 4-3 8-8 8s-8-4-8-8V18z" />
          <ellipse cx="24" cy="22" rx="5" ry="4" />
        </SvgFrame>
      )
    default:
      return (
        <SvgFrame>
          <rect x="14" y="14" width="20" height="22" rx="2" />
        </SvgFrame>
      )
  }
}

/**
 * “Technical flat” look: light panel + dark strokes (same idea as your reference sheet, without broken sprites).
 */
export function MeshFlatIcon({ id }: { id: string }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-300 p-1 shadow-[inset_0_2px_4px_rgba(255,255,255,0.85),inset_0_-2px_6px_rgba(0,0,0,0.06)] ring-1 ring-zinc-500/45">
      <span className="flex items-center justify-center [&>svg]:h-[1.85rem] [&>svg]:w-[1.85rem] [&>svg]:text-zinc-900">
        <MeshGlyph id={id} />
      </span>
    </span>
  )
}

export function FitGlyph({ id }: { id: string }) {
  const wide = id.includes('oversized') || id.includes('cargo')
  return (
    <SvgFrame>
      <path
        d={
          wide
            ? 'M12 16h24v20H12zM16 36v4M32 36v4'
            : id.includes('slim')
              ? 'M18 16h12v20H18zM20 36v4M28 36v4'
              : 'M15 16h18v20H15zM18 36v4M30 36v4'
        }
      />
      {id.includes('cropped') && <path d="M15 16h18v10H15z" />}
      {id.includes('zip') && <path d="M24 16v20" />}
    </SvgFrame>
  )
}

export function FabricGlyph({ id }: { id: string }) {
  if (id.includes('denim'))
    return (
      <SvgFrame>
        <rect x="14" y="14" width="20" height="20" rx="1" />
        <path d="M14 18h20M14 22h20M14 26h20" strokeDasharray="2 2" />
      </SvgFrame>
    )
  if (id.includes('fleece') || id.includes('cotton'))
    return (
      <SvgFrame>
        <circle cx="24" cy="24" r="10" />
        <path d="M18 24h12M24 18v12" opacity="0.5" />
      </SvgFrame>
    )
  if (id.includes('tech') || id.includes('nylon'))
    return (
      <SvgFrame>
        <path d="M14 18l10-6 10 6v14l-10 6-10-6z" />
        <path d="M24 12v26" />
      </SvgFrame>
    )
  if (id.includes('wool'))
    return (
      <SvgFrame>
        <path d="M16 20c4-4 12-4 16 0v14H16V20z" />
        <path d="M18 24c2-2 10-2 12 0" />
      </SvgFrame>
    )
  if (id.includes('leather'))
    return (
      <SvgFrame>
        <path d="M14 16h20v18H14z" />
        <path d="M18 20h12v10H18z" />
      </SvgFrame>
    )
  if (id.includes('satin'))
    return (
      <SvgFrame>
        <path d="M12 20c8-6 16-6 24 0v14c-8 6-16 6-24 0z" />
        <path d="M16 22l16 10" opacity="0.4" />
      </SvgFrame>
    )
  if (id.includes('linen'))
    return (
      <SvgFrame>
        <path d="M14 18h20v16H14z" />
        <path d="M14 22h20M14 26h20" opacity="0.5" />
      </SvgFrame>
    )
  return (
    <SvgFrame>
      <rect x="15" y="15" width="18" height="18" rx="2" />
    </SvgFrame>
  )
}

export function CollarGlyph({ id }: { id: string }) {
  if (id.includes('v'))
    return (
      <SvgFrame>
        <path d="M14 18h20M18 18l6 8 6-8" />
        <path d="M16 26h16v12H16z" />
      </SvgFrame>
    )
  if (id.includes('hood'))
    return (
      <SvgFrame>
        <path d="M18 22c0-6 2-10 6-10s6 4 6 10v10H18z" />
        <path d="M20 14c2-3 4-4 4-4s2 1 4 4" />
      </SvgFrame>
    )
  if (id.includes('mock') || id.includes('turtle'))
    return (
      <SvgFrame>
        <path d="M18 16h12v6H18z" />
        <path d="M16 22h16v14H16z" />
      </SvgFrame>
    )
  return (
    <SvgFrame>
      <path d="M14 20h20" />
      <path d="M16 20v14h16V20" />
    </SvgFrame>
  )
}

export function SleeveGlyph({ id }: { id: string }) {
  if (id.includes('short'))
    return (
      <SvgFrame>
        <path d="M18 16h12v8H18zM14 18h4v6h-4zM30 18h4v6h-4z" />
        <path d="M18 24h12v12H18z" />
      </SvgFrame>
    )
  if (id.includes('raglan'))
    return (
      <SvgFrame>
        <path d="M24 16v20" />
        <path d="M16 20l8-4 8 4v16H16z" />
      </SvgFrame>
    )
  if (id.includes('drop'))
    return (
      <SvgFrame>
        <path d="M12 22h8v14h-8zM28 22h8v14h-8z" />
        <path d="M18 18h12v6H18z" />
      </SvgFrame>
    )
  return (
    <SvgFrame>
      <path d="M14 18h4v16h-4zM30 18h4v16h-4z" />
      <path d="M18 16h12v20H18z" />
    </SvgFrame>
  )
}

export function PatternGlyph({ id }: { id: string }) {
  if (id.includes('stripe'))
    return (
      <SvgFrame>
        <path d="M14 14h4v22h-4zM22 14h4v22h-4zM30 14h4v22h-4z" />
      </SvgFrame>
    )
  if (id.includes('camo'))
    return (
      <SvgFrame>
        <circle cx="20" cy="22" r="5" />
        <circle cx="30" cy="28" r="4" />
        <circle cx="26" cy="18" r="3" />
      </SvgFrame>
    )
  if (id.includes('check'))
    return (
      <SvgFrame>
        <path d="M14 14h8v8h-8zM26 14h8v8h-8zM14 26h8v8h-8zM26 26h8v8h-8z" />
      </SvgFrame>
    )
  if (id.includes('graphic'))
    return (
      <SvgFrame>
        <rect x="14" y="16" width="20" height="18" rx="2" />
        <circle cx="24" cy="25" r="5" />
      </SvgFrame>
    )
  return (
    <SvgFrame>
      <rect x="16" y="18" width="16" height="14" rx="1" />
    </SvgFrame>
  )
}

export function FinishGlyph({ id }: { id: string }) {
  if (id.includes('gloss'))
    return (
      <SvgFrame>
        <ellipse cx="24" cy="26" rx="12" ry="8" />
        <path d="M16 20l16 4" opacity="0.5" />
      </SvgFrame>
    )
  if (id.includes('vintage') || id.includes('distress'))
    return (
      <SvgFrame>
        <rect x="14" y="16" width="20" height="18" rx="2" />
        <path d="M16 30l4-8 4 6 4-10 4 8" />
      </SvgFrame>
    )
  if (id.includes('tech'))
    return (
      <SvgFrame>
        <path d="M14 20h20M14 24h20M14 28h20" />
        <path d="M18 16v18M30 16v18" />
      </SvgFrame>
    )
  return (
    <SvgFrame>
      <rect x="15" y="17" width="18" height="16" rx="2" />
    </SvgFrame>
  )
}

export function DetailGlyph({ id }: { id: string }) {
  if (id.includes('pockets'))
    return (
      <SvgFrame>
        <rect x="16" y="18" width="16" height="16" rx="1" />
        <path d="M18 26h5v5h-5zM25 26h5v5h-5z" />
      </SvgFrame>
    )
  if (id.includes('zip'))
    return (
      <SvgFrame>
        <path d="M24 14v22" />
        <path d="M24 18h.01M24 22h.01M24 26h.01" />
      </SvgFrame>
    )
  if (id.includes('rib'))
    return (
      <SvgFrame>
        <path d="M14 34h20M14 30h20M14 26h20" />
      </SvgFrame>
    )
  if (id.includes('waist'))
    return (
      <SvgFrame>
        <path d="M14 26h20M16 26v6h16v-6" />
        <path d="M18 30h12" />
      </SvgFrame>
    )
  if (id.includes('cuff'))
    return (
      <SvgFrame>
        <path d="M14 20h20v4H14zM14 34h20v4H14z" />
      </SvgFrame>
    )
  if (id.includes('hood'))
    return (
      <SvgFrame>
        <path d="M18 20c0-5 2-8 6-8s6 3 6 8v8H18z" />
      </SvgFrame>
    )
  if (id.includes('straps'))
    return (
      <SvgFrame>
        <path d="M18 14v22M30 14v22" />
        <path d="M16 20h4M28 20h4" />
      </SvgFrame>
    )
  if (id.includes('panels'))
    return (
      <SvgFrame>
        <path d="M14 16h8v18h-8zM22 16h12v18H22z" />
      </SvgFrame>
    )
  if (id.includes('embroidery'))
    return (
      <SvgFrame>
        <path d="M20 20c4 2 8 8 8 14M18 28c6-2 10-6 12-10" />
      </SvgFrame>
    )
  if (id.includes('print'))
    return (
      <SvgFrame>
        <rect x="16" y="18" width="16" height="14" rx="1" />
        <path d="M20 22h8M20 26h6" />
      </SvgFrame>
    )
  return (
    <SvgFrame>
      <circle cx="24" cy="24" r="8" />
    </SvgFrame>
  )
}

export function CategoryTabIcon({ cat }: { cat: StudioCategory }) {
  switch (cat) {
    case 'pieces':
      return (
        <SvgFrame className="h-6 w-6">
          <path d="M18 14h12v22H18zM14 18h4v14h-4zM30 18h4v14h-4z" />
        </SvgFrame>
      )
    case 'coupe':
      return (
        <SvgFrame className="h-6 w-6">
          <path d="M16 14h16l-2 20H18z" />
        </SvgFrame>
      )
    case 'matiere':
      return (
        <SvgFrame className="h-6 w-6">
          <circle cx="24" cy="24" r="9" />
        </SvgFrame>
      )
    case 'couleur':
      return (
        <SvgFrame className="h-6 w-6">
          <circle cx="24" cy="20" r="6" />
          <circle cx="18" cy="28" r="4" />
          <circle cx="30" cy="28" r="4" />
        </SvgFrame>
      )
    case 'col':
      return (
        <SvgFrame className="h-6 w-6">
          <path d="M14 22h20M18 22v12h12V22" />
        </SvgFrame>
      )
    case 'manches':
      return (
        <SvgFrame className="h-6 w-6">
          <path d="M20 16h8v14h-8zM14 18h4v10h-4zM30 18h4v10h-4z" />
        </SvgFrame>
      )
    case 'motif':
      return (
        <SvgFrame className="h-6 w-6">
          <path d="M14 16h8v8h-8zM26 16h8v8h-8zM14 26h8v8h-8zM26 26h8v8h-8z" />
        </SvgFrame>
      )
    case 'finition':
      return (
        <SvgFrame className="h-6 w-6">
          <path d="M16 30c4-10 12-10 16 0" />
        </SvgFrame>
      )
    case 'details':
      return (
        <SvgFrame className="h-6 w-6">
          <path d="M14 20h20v10H14zM18 16h4v6M26 16h4v6" />
        </SvgFrame>
      )
    case 'texte':
      return (
        <SvgFrame className="h-6 w-6">
          <path d="M14 18h20M14 24h14M14 30h18" />
        </SvgFrame>
      )
    default:
      return null
  }
}
