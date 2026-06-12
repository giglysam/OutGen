/** Shrink images before cloud save (avoids 400 / payload limits). */
export async function compressImageUrl(
  src: string,
  maxWidth = 480,
  quality = 0.72,
): Promise<string> {
  if (!src.startsWith('blob:') && !src.startsWith('data:')) {
    return src
  }

  try {
    const res = await fetch(src)
    const blob = await res.blob()
    const bitmap = await createImageBitmap(blob)
    const scale = Math.min(1, maxWidth / bitmap.width)
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return src
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()

    return canvas.toDataURL('image/jpeg', quality)
  } catch {
    return src
  }
}
