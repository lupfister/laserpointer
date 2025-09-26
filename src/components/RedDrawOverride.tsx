'use client'

import { useEditor, useValue } from '@tldraw/tldraw'
import { useEffect } from 'react'

const RedDrawOverride: React.FC = () => {
  const editor = useEditor()

  useEffect(() => {
    if (!editor) return

    // Track shapes that are already being processed to avoid duplicates
    const processedShapes = new Set()

    // Apply glow effect to existing pointer drawings on page load
    const applyGlowToExistingShapes = () => {
      const allShapes = editor.getCurrentPageShapes()
      allShapes.forEach(shape => {
        if (shape.type === 'draw' && shape.meta?.isPointerDrawing && !processedShapes.has(shape.id)) {
          processedShapes.add(shape.id)
          
          const shapeElement = document.querySelector(`[data-shape-id="${shape.id}"]`)
          if (shapeElement) {
            const svg = shapeElement.querySelector('svg')
            if (svg) {
              // White stroke with red glow effect
              svg.style.filter = 'drop-shadow(0 0 8px rgba(255, 0, 0, 0.8)) drop-shadow(0 0 16px rgba(255, 0, 0, 0.6)) drop-shadow(0 0 24px rgba(255, 0, 0, 0.4))'
              svg.style.stroke = '#ffffff'
              svg.style.strokeWidth = '4px'
              svg.style.strokeLinecap = 'round'
              svg.style.strokeLinejoin = 'round'
              svg.style.opacity = '0.9'
              svg.style.transition = 'opacity 2s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
              
              // Check if this shape should already be faded out based on creation time
              const shapeCreatedAt = shape.meta?.pointerCreatedAt || Date.now()
              const now = Date.now()
              const timeSinceCreation = now - (shapeCreatedAt as number)
              
              if (timeSinceCreation > 3000) {
                // Shape is older than 3 seconds, fade it out immediately
                svg.style.opacity = '0'
                svg.style.filter = 'drop-shadow(0 0 8px rgba(255, 0, 0, 0)) drop-shadow(0 0 16px rgba(255, 0, 0, 0)) drop-shadow(0 0 24px rgba(255, 0, 0, 0))'
                
                // Delete the shape after fade transition completes
                setTimeout(() => {
                  console.log(`Deleting old shape ${shape.id}`)
                  editor.deleteShape(shape.id)
                  processedShapes.delete(shape.id)
                }, 2000)
              } else {
                // Schedule fade out for remaining time
                const remainingTime = Math.max(0, 3000 - timeSinceCreation)
                console.log(`Scheduling fade for existing shape ${shape.id} in ${remainingTime}ms`)
                setTimeout(() => {
                  console.log(`Fading out existing shape ${shape.id}`)
                  svg.style.opacity = '0'
                  svg.style.filter = 'drop-shadow(0 0 8px rgba(255, 0, 0, 0)) drop-shadow(0 0 16px rgba(255, 0, 0, 0)) drop-shadow(0 0 24px rgba(255, 0, 0, 0))'
                  
                  // Delete the shape after fade transition completes
                  setTimeout(() => {
                    console.log(`Deleting existing shape ${shape.id}`)
                    editor.deleteShape(shape.id)
                    processedShapes.delete(shape.id)
                  }, 2000)
                }, remainingTime)
              }
            }
          }
        }
      })
    }

    // Apply glow to existing shapes immediately
    setTimeout(applyGlowToExistingShapes, 100)

    // Add CSS to force all draw shapes to render outside frame boundaries
    const addFrameClippingOverride = () => {
      const style = document.createElement('style')
      style.textContent = `
        /* Force all draw shapes to render outside frame boundaries */
        [data-shape-type="draw"] {
          position: absolute !important;
          z-index: 9999 !important;
          overflow: visible !important;
          clip-path: none !important;
        }
        
        /* Ensure draw shapes inside frames are not clipped */
        .tl-frame [data-shape-type="draw"] {
          position: absolute !important;
          z-index: 9999 !important;
          overflow: visible !important;
          clip-path: none !important;
          transform: translateZ(0) !important;
        }
        
        /* Force SVG elements inside draw shapes to be visible */
        [data-shape-type="draw"] svg {
          overflow: visible !important;
          clip-path: none !important;
        }
        
        /* Override any frame clipping masks for draw shapes */
        .tl-frame [data-shape-type="draw"] svg {
          overflow: visible !important;
          clip-path: none !important;
        }
        
        /* Ensure draw shapes are rendered at the root level visually */
        [data-shape-type="draw"] {
          isolation: isolate !important;
          contain: none !important;
        }
      `
      document.head.appendChild(style)
      
      return () => {
        if (document.head.contains(style)) {
          document.head.removeChild(style)
        }
      }
    }

    const removeStyle = addFrameClippingOverride()

    // Use tldraw's side effects API to prevent frame parenting as a backup
    const unregisterBeforeChangeHandler = editor.sideEffects.registerBeforeChangeHandler('shape', (prev, next) => {
      // Check if the shape is a draw shape and its parent is a frame
      if (next.type === 'draw' && next.parentId) {
        const parentShape = editor.getShape(next.parentId)
        if (parentShape && parentShape.type === 'frame') {
          console.log(`Preventing draw shape ${next.id} from being parented to frame ${next.parentId}`)
          // Set the parentId to the pageId to place the shape at the root level
          return { ...next, parentId: editor.getCurrentPageId() }
        }
      }
      return next
    })

    // Override the createShapes method to add pointer drawing properties
    const originalCreateShapes = editor.createShapes
    
    editor.createShapes = (shapes) => {
      const newShapes = shapes.map(shape => {
        // If we're in pointer mode and this is a draw shape, add special properties
        if (shape.type === 'draw' && (window as any).isPointerMode) {
          return {
            ...shape,
            props: {
              ...shape.props,
              color: 'white', // White stroke
              size: 'l', // Large size for better glow visibility
            },
            meta: {
              ...shape.meta,
              isPointerDrawing: true,
              pointerCreatedAt: Date.now(),
            },
          }
        }
        return shape
      })
      
      const result = originalCreateShapes.call(editor, newShapes)
      
      // Add glow effect to pointer drawings after creation
      if ((window as any).isPointerMode) {
        setTimeout(() => {
          newShapes.forEach(shape => {
            if (shape.type === 'draw' && !processedShapes.has(shape.id)) {
              processedShapes.add(shape.id)
              
              const shapeElement = document.querySelector(`[data-shape-id="${shape.id}"]`)
              if (shapeElement) {
                const svg = shapeElement.querySelector('svg')
                if (svg) {
                  // White stroke with red glow effect
                  svg.style.filter = 'drop-shadow(0 0 8px rgba(255, 0, 0, 0.8)) drop-shadow(0 0 16px rgba(255, 0, 0, 0.6)) drop-shadow(0 0 24px rgba(255, 0, 0, 0.4))'
                  svg.style.stroke = '#ffffff'
                  svg.style.strokeWidth = '4px'
                  svg.style.strokeLinecap = 'round'
                  svg.style.strokeLinejoin = 'round'
                  svg.style.opacity = '0.9'
                  svg.style.transition = 'opacity 2s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                  
                  // Start fade out after 3 seconds
                  console.log(`Scheduling fade for new shape ${shape.id} in 3 seconds`)
                  const fadeTimeout = setTimeout(() => {
                    console.log(`Fading out new shape ${shape.id}`)
                    svg.style.opacity = '0'
                    svg.style.filter = 'drop-shadow(0 0 8px rgba(255, 0, 0, 0)) drop-shadow(0 0 16px rgba(255, 0, 0, 0)) drop-shadow(0 0 24px rgba(255, 0, 0, 0))'
                    
                    // Delete the shape after fade transition completes
                    const deleteTimeout = setTimeout(() => {
                      console.log(`Deleting new shape ${shape.id}`)
                      try {
                        if (shape.id) {
                          editor.deleteShape(shape.id)
                          processedShapes.delete(shape.id) // Clean up tracking
                        }
                      } catch (error) {
                        console.log(`Shape ${shape.id} already deleted`)
                      }
                    }, 2000) // Wait for 2-second fade transition to complete
                  }, 3000) // 3 seconds
                }
              }
            }
          })
        }, 100) // Small delay to ensure DOM is updated
      }
      
      return result
    }

    return () => {
      // Clean up
      unregisterBeforeChangeHandler()
      editor.createShapes = originalCreateShapes
      removeStyle()
    }
  }, [editor])

  return null
}

export default RedDrawOverride