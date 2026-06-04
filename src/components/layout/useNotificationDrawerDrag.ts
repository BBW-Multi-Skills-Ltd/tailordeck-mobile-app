import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

type NotificationDrawerDragOptions = {
  onClose: () => void
}

export function useNotificationDrawerDrag({ onClose }: NotificationDrawerDragOptions) {
  const [dragOffset, setDragOffset] = useState(0)
  const dragStartYRef = useRef<number | null>(null)
  const dragPointerIdRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    function handleWindowPointerMove(event: PointerEvent): void {
      if (!isDraggingRef.current) return
      if (dragPointerIdRef.current !== null && event.pointerId !== dragPointerIdRef.current) return
      if (dragStartYRef.current === null) return
      setDragOffset(Math.max(0, Math.min(260, event.clientY - dragStartYRef.current)))
    }

    function handleWindowPointerUp(event: PointerEvent): void {
      if (!isDraggingRef.current) return
      if (dragPointerIdRef.current !== null && event.pointerId !== dragPointerIdRef.current) return
      if (dragStartYRef.current === null) return
      const deltaY = event.clientY - dragStartYRef.current
      resetDrag()
      if (deltaY > 70) onClose()
      else setDragOffset(0)
    }

    function handleWindowPointerCancel(): void {
      if (!isDraggingRef.current) return
      resetDrag()
      setDragOffset(0)
    }

    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', handleWindowPointerUp)
    window.addEventListener('pointercancel', handleWindowPointerCancel)
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', handleWindowPointerUp)
      window.removeEventListener('pointercancel', handleWindowPointerCancel)
    }
  }, [onClose])

  function resetDrag(): void {
    dragStartYRef.current = null
    dragPointerIdRef.current = null
    isDraggingRef.current = false
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>): void {
    event.preventDefault()
    if (typeof event.currentTarget.setPointerCapture === 'function') event.currentTarget.setPointerCapture(event.pointerId)
    dragStartYRef.current = event.clientY
    dragPointerIdRef.current = event.pointerId
    isDraggingRef.current = true
  }

  function cancelDrag(): void {
    resetDrag()
    setDragOffset(0)
  }

  return {
    cancelDrag,
    dragOffset,
    handlePointerDown,
    isDragging: isDraggingRef.current,
    resetDrag,
    setDragOffset,
  }
}
