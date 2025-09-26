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
              const timeSinceCreation = now - shapeCreatedAt
              
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

    // Override draw shape creation to make them red when pointer tool is active
    const originalCreateShapes = editor.createShapes
    
    editor.createShapes = (shapes) => {
      const newShapes = shapes.map(shape => {
        // Check if we're in pointer mode and this is a draw shape
        if (shape.type === 'draw' && (window as any).isPointerMode) {
          return {
            ...shape,
            props: {
              ...shape.props,
              color: 'white', // White stroke
              // Add glow effect properties
              size: 'l', // Large size for better glow visibility
            },
            // Add custom class for CSS targeting
            meta: {
              ...shape.meta,
              isPointerDrawing: true,
              pointerCreatedAt: Date.now(), // Store creation timestamp
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
                        editor.deleteShape(shape.id)
                        processedShapes.delete(shape.id) // Clean up tracking
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
      // Restore original method
      editor.createShapes = originalCreateShapes
    }
  }, [editor])

  return null
}

export default RedDrawOverride
