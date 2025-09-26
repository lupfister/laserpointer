'use client'

import {
  StateNode,
  TLEventHandlers,
  TLInterruptEvent,
  TLKeyboardEvent,
  TLPointerEvent,
  TLShapeId,
  Vec,
  createShapeId,
} from '@tldraw/tldraw'

export class CustomDrawTool extends StateNode {
  static override id = 'customDraw'

  private startPoint = new Vec(0, 0)
  private currentShapeId: TLShapeId | null = null
  private isDrawing = false

  override onEnter = () => {
    this.editor.setCursor({ type: 'cross', rotation: 0 })
  }

  override onExit = () => {
    this.editor.setCursor({ type: 'default', rotation: 0 })
  }

  override onPointerDown: TLEventHandlers['onPointerDown'] = (info) => {
    if (info.button !== 0) return

    this.startPoint = this.editor.screenToPage({ x: info.point.x, y: info.point.y })
    this.isDrawing = true
    
    // Create the initial draw shape with proper structure
    this.currentShapeId = createShapeId()
    
    // Create shape at origin (0,0) with absolute coordinates in points
    this.editor.createShapes([
      {
        id: this.currentShapeId,
        type: 'draw',
        x: 0,
        y: 0,
        parentId: undefined, // Explicitly set to undefined
        props: {
          color: (window as any).isPointerMode ? 'white' : 'black',
          size: 'l',
          segments: [
            {
              type: 'free',
              points: [
                { x: this.startPoint.x, y: this.startPoint.y },
                { x: this.startPoint.x, y: this.startPoint.y }
              ]
            }
          ],
          isComplete: false,
          isClosed: false,
        },
        meta: {
          isPointerDrawing: (window as any).isPointerMode || false,
          pointerCreatedAt: Date.now(),
        },
      },
    ])
  }

  override onPointerMove: TLEventHandlers['onPointerMove'] = (info) => {
    if (!this.currentShapeId || !this.isDrawing) return

    const currentPoint = this.editor.screenToPage({ x: info.point.x, y: info.point.y })
    
    // Update the draw shape with new points
    const shape = this.editor.getShape(this.currentShapeId)
    if (shape && shape.type === 'draw') {
      const segments = shape.props.segments || []
      const lastSegment = segments[segments.length - 1]
      
      if (lastSegment) {
        // Add point to the last segment using absolute coordinates
        const updatedSegment = {
          ...lastSegment,
          points: [
            ...lastSegment.points,
            { x: currentPoint.x, y: currentPoint.y }
          ]
        }
        
        this.editor.updateShape({
          id: this.currentShapeId,
          type: 'draw',
          parentId: undefined, // Keep parentId undefined
          props: {
            ...shape.props,
            segments: [...segments.slice(0, -1), updatedSegment],
          },
        })
      }
    }
  }

  override onPointerUp: TLEventHandlers['onPointerUp'] = (info) => {
    if (!this.currentShapeId || !this.isDrawing) return

    // Complete the drawing
    this.editor.updateShape({
      id: this.currentShapeId,
      type: 'draw',
      parentId: undefined, // Ensure parentId remains undefined
      props: {
        isComplete: true,
        isClosed: false,
      },
    })

    this.currentShapeId = null
    this.isDrawing = false
    
    // Don't switch back to select tool - stay in draw tool for continuous drawing
  }

  override onKeyDown: TLEventHandlers['onKeyDown'] = (info) => {
    if (info.key === 'Escape') {
      if (this.currentShapeId) {
        this.editor.deleteShape(this.currentShapeId)
        this.currentShapeId = null
      }
      this.isDrawing = false
      this.editor.setCurrentTool('select')
    }
  }

  override onInterrupt: TLInterruptEvent = () => {
    if (this.currentShapeId) {
      this.editor.deleteShape(this.currentShapeId)
      this.currentShapeId = null
    }
    this.isDrawing = false
  }
}