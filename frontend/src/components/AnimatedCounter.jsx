import { useEffect, useRef } from 'react'
import { animate, useInView } from 'framer-motion'

/**
 * AnimatedCounter — smoothly animates from 0 to `value` when it enters view.
 */
export default function AnimatedCounter({ value = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  useEffect(() => {
    if (!isInView || value === undefined || value === null) return
    const controls = animate(0, value, {
      duration: 0.7,
      ease: 'easeOut',
      onUpdate(latest) {
        if (ref.current) ref.current.textContent = Math.round(latest).toString()
      },
    })
    return () => controls.stop()
  }, [isInView, value])

  return <span ref={ref}>{value ?? 0}</span>
}
