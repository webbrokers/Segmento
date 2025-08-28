import { useEffect, useRef } from 'react'

export function useGameLoop(callback, isRunning = true) {
  const raf = useRef(null)
  const last = useRef(performance.now())

  useEffect(() => {
    if (!isRunning) return
    const tick = (t) => {
      const dt = (t - last.current) / 1000
      last.current = t
      callback(dt, t)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [callback, isRunning])
}
