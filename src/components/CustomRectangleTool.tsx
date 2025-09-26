'use client'

import {
  StateNode,
  TLEventHandlers,
  TLInterruptEvent,
  TLKeyboardEvent,
  TLPointerEvent,
  TLShapeId,
  Vec,
  getDefaultColorTheme,
  createShapeId,
} from '@tldraw/tldraw'
import { CustomRectangleShape } from './CustomRectangleShape'

export class CustomRectangleTool extends StateNode {
  static override id = 'customRectangle'

  private startPoint = new Vec(0, 0)
  private currentShapeId: TLShapeId | null = null
  private isSpacePressed = false

  override onEnter = () => {
    this.editor.setCursor({ type: 'cross', rotation: 0 })
  }

  override onExit = () => {
    this.editor.setCursor({ type: 'default', rotation: 0 })
  }

  override onPointerDown: TLEventHandlers['onPointerDown'] = (info) => {
    if (info.button !== 0) return

    this.startPoint = this.editor.screenToPage({ x: info.point.x, y: info.point.y })
    
    // Create the initial rectangle shape
    this.currentShapeId = createShapeId()
    
    this.editor.createShapes([
      {
        id: this.currentShapeId,
        type: 'customRectangle',
        x: this.startPoint.x,
        y: this.startPoint.y,
        props: {
          w: 0,
          h: 0,
        },
      },
    ])

    // Don't switch to select tool yet - stay in rectangle tool for dragging
  }

  override onPointerMove: TLEventHandlers['onPointerMove'] = (info) => {
    if (!this.currentShapeId) return

    const currentPoint = this.editor.screenToPage({ x: info.point.x, y: info.point.y })
    const delta = currentPoint.sub(this.startPoint)
    
    if (this.isSpacePressed) {
      // When space is pressed, move the rectangle instead of resizing
      this.editor.updateShape({
        id: this.currentShapeId,
        type: 'customRectangle',
        x: this.startPoint.x + delta.x,
        y: this.startPoint.y + delta.y,
      })
    } else {
      // Normal resize behavior - maintain click down point as origin
      // Calculate position and size based on drag direction
      let newX = this.startPoint.x
      let newY = this.startPoint.y
      let newW = Math.abs(delta.x)
      let newH = Math.abs(delta.y)
      
      // Adjust position based on drag direction to maintain origin
      if (delta.x < 0) {
        // Dragging left - move origin left
        newX = this.startPoint.x + delta.x
      }
      if (delta.y < 0) {
        // Dragging up - move origin up
        newY = this.startPoint.y + delta.y
      }
      
      this.editor.updateShape({
        id: this.currentShapeId,
        type: 'customRectangle',
        x: newX,
        y: newY,
        props: {
          w: newW,
          h: newH,
        },
      })
    }
  }

  override onPointerUp: TLEventHandlers['onPointerUp'] = (info) => {
    if (!this.currentShapeId) return

    // If the rectangle is too small, remove it
    const shape = this.editor.getShape(this.currentShapeId) as CustomRectangleShape | undefined
    if (shape && shape.type === 'customRectangle' && (shape.props.w < 5 || shape.props.h < 5)) {
      this.editor.deleteShape(this.currentShapeId)
    } else {
      // Rectangle is valid, switch back to select tool
      this.editor.setCurrentTool('select')
    }

    this.currentShapeId = null
  }

  override onKeyDown: TLEventHandlers['onKeyDown'] = (info) => {
    if (info.key === 'Escape') {
      if (this.currentShapeId) {
        this.editor.deleteShape(this.currentShapeId)
        this.currentShapeId = null
      }
      this.editor.setCurrentTool('select')
    } else if (info.key === ' ') {
      // Space bar pressed - enable position shifting mode
      this.isSpacePressed = true
    }
  }

  override onKeyUp: TLEventHandlers['onKeyUp'] = (info) => {
    if (info.key === ' ') {
      // Space bar released - disable position shifting mode
      this.isSpacePressed = false
    }
  }

  override onInterrupt: TLInterruptEvent = () => {
    if (this.currentShapeId) {
      this.editor.deleteShape(this.currentShapeId)
      this.currentShapeId = null
    }
    this.isSpacePressed = false
  }
}
