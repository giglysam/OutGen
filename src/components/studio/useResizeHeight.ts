import { useCallback, useEffect, useRef, useState } from 'react'

export function useResizeHeight(initial: number, min: number, max: number) {
  const [height, setHeight] = useState(initial)
  const dragging = useRef(false)
  const startY = useRef(0)
  const startH = useRef(0)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true
      startY.current = e.clientY
      startH.current = height
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [height],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      const delta = startY.current - e.clientY
      setHeight(Math.min(max, Math.max(min, startH.current + delta)))
    },
    [min, max],
  )

  const onPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  useEffect(() => {
    const stop = () => {
      dragging.current = false
    }
    window.addEventListener('pointerup', stop)
    return () => window.removeEventListener('pointerup', stop)
  }, [])

  return { height, setHeight, onPointerDown, onPointerMove, onPointerUp }
}
