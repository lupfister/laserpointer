'use client'

import {
  BaseBoxShapeUtil,
  DefaultColorStyle,
  getDefaultColorTheme,
  Rectangle2d,
  T,
  TLBaseShape,
  TLDefaultColorStyle,
} from '@tldraw/tldraw'

// Define the shape type
export type CustomRectangleShape = TLBaseShape<
  'customRectangle',
  {
    w: number
    h: number
  }
>

// Define the shape props
export const customRectangleShapeProps = {
  w: T.number,
  h: T.number,
}

// Create the shape utility class
export class CustomRectangleShapeUtil extends BaseBoxShapeUtil<CustomRectangleShape> {
  static override type = 'customRectangle' as const

  getDefaultProps(): CustomRectangleShape['props'] {
    return {
      w: 100,
      h: 100,
    }
  }

  getGeometry(shape: CustomRectangleShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  component(shape: CustomRectangleShape) {
    // Use a simple gray color for now to avoid theme issues
    const color = '#D9D9D9'

    return (
      <div
        style={{
          width: shape.props.w,
          height: shape.props.h,
          backgroundColor: color,
          border: 'none',
          borderRadius: 0,
          position: 'absolute',
          left: 0,
          top: 0,
        }}
      />
    )
  }

  indicator(shape: CustomRectangleShape) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={0}
        ry={0}
        fill="none"
        stroke="none"
      />
    )
  }

  override canResize = () => true
  override canBind = () => true
  override canEdit = () => true
}
