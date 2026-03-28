import { useContext } from 'react'
import { OutGenContext } from '../context/outgen-context'

export function useOutGen() {
  const ctx = useContext(OutGenContext)
  if (!ctx) throw new Error('useOutGen must be used within OutGenProvider')
  return ctx
}
