'use client'

import { useEditor, useValue, TLShapeId } from '@tldraw/tldraw'
import { useEffect } from 'react'

// Quirky frame labels
const quirkyLabels = [
  'Boundless Space',
  'Blank Canvas',
  'Empty Expanse',
  'Open Field',
  'Clean Slate',
  'Fresh Start',
  'Infinite Plane',
  'Untitled Space',
  'New Horizon',
  'Blank Page',
  'Empty Stage',
  'Open Canvas',
  'Clear View',
  'Blank Sheet',
  'Fresh Canvas',
  'Open Space',
  'Empty Room',
  'New Page',
  'Clean Canvas',
  'Blank Slate'
]

let frameCounter = 0

const CustomFrame: React.FC = () => {
  const editor = useEditor()

  useEffect(() => {
    if (!editor) return

    // Override frame creation to add quirky labels and remove outlines
    const originalCreateShapes = editor.createShapes
    
    editor.createShapes = (shapes) => {
      const newShapes = shapes.map(shape => {
        if (shape.type === 'frame') {
          const label = quirkyLabels[frameCounter % quirkyLabels.length]
          frameCounter++
          
          return {
            ...shape,
            props: {
              ...shape.props,
              name: label,
              // Use white color for frames
              color: 'white',
            },
          }
        }
        return shape
      })
      
      return originalCreateShapes.call(editor, newShapes)
    }

    return () => {
      // Restore original method
      editor.createShapes = originalCreateShapes
    }
  }, [editor])

  // Make frame interiors capture pointer interactions by pre-selecting the frame
  useEffect(() => {
    if (!editor) return

    const container = editor.getContainer()

    const handlePointerDownCapture = (event: PointerEvent) => {
      // Left-button only for drag/select semantics
      if (event.button !== 0) return

      // Only influence behavior in select tool
      if (editor.getCurrentToolId() !== 'select') return

      // Convert screen to page space
      const pagePoint = editor.screenToPage({ x: event.clientX, y: event.clientY })

      // Find any frame whose bounds contain the point; prefer the last matched (rough topmost)
      const frames = editor.getCurrentPageShapes().filter((shape) => shape.type === 'frame')

      let matchedFrameId: TLShapeId | null = null

      for (const frame of frames) {
        const b = editor.getShapePageBounds(frame.id)
        if (!b) continue
        const inside = pagePoint.x >= b.minX && pagePoint.x <= b.maxX && pagePoint.y >= b.minY && pagePoint.y <= b.maxY
        if (inside) {
          matchedFrameId = frame.id
        }
      }

      if (matchedFrameId) {
        // Only act if the frame appears to be the top-most shape at this point
        const topShape = (editor as any).getShapeAtPoint?.(pagePoint)
        if (topShape && topShape.id !== matchedFrameId) return
        if (topShape && topShape.type !== 'frame') return

        // Determine whether any frame edge is visible in the viewport. If the
        // viewport is fully inside the frame, no edges are visible and the
        // frame should not capture selection/drag.
        const b = editor.getShapePageBounds(matchedFrameId)
        if (b) {
          // Prefer dedicated API for viewport bounds in page space if available
          const vp = (editor as any).getViewportPageBounds?.() || null
          const viewport = vp
            ? { minX: vp.minX, minY: vp.minY, maxX: vp.maxX, maxY: vp.maxY }
            : (() => {
                const tl = editor.screenToPage({ x: 0, y: 0 })
                const br = editor.screenToPage({ x: container.clientWidth, y: container.clientHeight })
                return {
                  minX: Math.min(tl.x, br.x),
                  minY: Math.min(tl.y, br.y),
                  maxX: Math.max(tl.x, br.x),
                  maxY: Math.max(tl.y, br.y),
                }
              })()

          const viewportFullyInsideFrame =
            viewport.minX > b.minX &&
            viewport.maxX < b.maxX &&
            viewport.minY > b.minY &&
            viewport.maxY < b.maxY

          if (viewportFullyInsideFrame) {
            // When zoomed inside a frame (no edges visible), do nothing: allow
            // clicks to interact with interior content, not the frame.
            return
          }

          {
            // At least one edge is visible — allow selection/drag of the frame
            editor.setSelectedShapes([matchedFrameId])
            editor.setCurrentTool('select')
          }
        }
        // Do NOT stop propagation; let tldraw process the pointer for dragging
      }
    }

    container.addEventListener('pointerdown', handlePointerDownCapture, { capture: true })

    return () => {
      container.removeEventListener('pointerdown', handlePointerDownCapture, { capture: true } as any)
    }
  }, [editor])

  // Sync hovered / selected state to DOM attributes on frame wrappers for CSS targeting
  useEffect(() => {
    if (!editor) return

    const container = editor.getContainer()

    const updateDomState = () => {
      // Clear previous flags
      const allFrameEls = container.querySelectorAll('.tl-shape[data-shape-type="frame"]')
      allFrameEls.forEach((el) => {
        ;(el as HTMLElement).removeAttribute('data-lp-hover')
        ;(el as HTMLElement).removeAttribute('data-lp-selected')
      })

      // Hovered frame
      const hoveredId = (editor as any).getHoveredShapeId?.()
      if (hoveredId) {
        const hoveredEl = container.querySelector(`[data-shape-id="${hoveredId}"]`)
        if (
          hoveredEl &&
          (hoveredEl as HTMLElement).getAttribute('data-shape-type') === 'frame'
        ) {
          ;(hoveredEl as HTMLElement).setAttribute('data-lp-hover', 'true')
        }
      }

      // Selected frames
      const selectedIds = editor.getSelectedShapeIds()
      for (const id of selectedIds) {
        const selEl = container.querySelector(`[data-shape-id="${id}"]`)
        if (selEl && (selEl as HTMLElement).getAttribute('data-shape-type') === 'frame') {
          ;(selEl as HTMLElement).setAttribute('data-lp-selected', 'true')
        }
      }
    }

    // Listen to store changes (selection, hover, etc.)
    const unsubscribe = editor.store.listen(updateDomState)

    // Also respond to pointer moves for immediate hover updates
    const handlePointerMove = () => updateDomState()
    const handlePointerLeave = () => updateDomState()
    container.addEventListener('pointermove', handlePointerMove, { capture: true })
    container.addEventListener('pointerleave', handlePointerLeave, { capture: true })

    // Initial sync
    updateDomState()

    return () => {
      unsubscribe()
      container.removeEventListener('pointermove', handlePointerMove, { capture: true } as any)
      container.removeEventListener('pointerleave', handlePointerLeave, { capture: true } as any)
    }
  }, [editor])

  return null
}

export default CustomFrame
