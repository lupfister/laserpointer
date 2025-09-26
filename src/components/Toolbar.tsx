'use client'

import { useEditor, useValue } from '@tldraw/tldraw'
import { ChevronDown } from 'lucide-react'
import { useCallback, useState, useEffect } from 'react'

interface ToolbarProps {
  className?: string
}

const Toolbar: React.FC<ToolbarProps> = ({
  className = '',
}) => {
  const editor = useEditor()
  const [currentTool, setCurrentTool] = useState('select')
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100) // Small delay to ensure smooth animation
    
    return () => clearTimeout(timer)
  }, [])

  // Cleanup pointer mode on unmount
  useEffect(() => {
    return () => {
      ;(window as any).isPointerMode = false
    }
  }, [])

  useEffect(() => {
    if (!editor) return
    
    const updateCurrentTool = () => {
      const tool = editor.getCurrentTool()?.id || 'select'
      
      // If we're using the custom rectangle tool, keep rectangle selected
      if (tool === 'customRectangle') {
        setCurrentTool('rectangle')
      } else if (tool === 'draw' && (window as any).isPointerMode) {
        // If we're using draw tool but in pointer mode, keep pointer selected
        setCurrentTool('pointer')
      } else {
        // For other tools, update normally
        setCurrentTool(tool)
      }
    }
    
    updateCurrentTool()
    
    const unsubscribe = editor.store.listen(updateCurrentTool)
    return unsubscribe
  }, [editor])

  // Separate effect to handle rectangle completion
  useEffect(() => {
    if (!editor) return

    const handlePointerUp = () => {
      if (currentTool === 'rectangle') {
        // Rectangle creation completed, switch back to select
        setTimeout(() => {
          setCurrentTool('select')
          editor.setCurrentTool('select')
        }, 100)
      }
    }

    // Listen for pointer up events on the editor's container
    const container = editor.getContainer()
    container.addEventListener('pointerup', handlePointerUp)
    
    return () => {
      container.removeEventListener('pointerup', handlePointerUp)
    }
  }, [editor, currentTool])

  const handleSelectTool = useCallback((tool: string) => {
    if (!editor) return
    
    if (tool === 'rectangle') {
      // For rectangle, use the custom rectangle tool
      editor.setCurrentTool('customRectangle')
      // Set the current tool state to rectangle for UI purposes
      setCurrentTool('rectangle')
    } else if (tool === 'frame') {
      // For frame tool
      editor.setCurrentTool('frame')
      setCurrentTool(tool)
    } else if (tool === 'pointer') {
      // For pointer tool, use the draw tool but with red color
      ;(window as any).isPointerMode = true
      editor.setCurrentTool('draw')
      setCurrentTool('pointer')
    } else {
      // Reset pointer mode for all other tools
      ;(window as any).isPointerMode = false
      editor.setCurrentTool(tool)
      setCurrentTool(tool)
    }
  }, [editor])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!editor) return
      
      // Prevent shortcuts when typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }
      
      switch (event.key.toLowerCase()) {
        case 'r':
          event.preventDefault()
          handleSelectTool('rectangle')
          break
        case 'v':
          event.preventDefault()
          handleSelectTool('select')
          break
        case 'f':
          event.preventDefault()
          handleSelectTool('frame')
          break
        case 'd':
          event.preventDefault()
          handleSelectTool('draw')
          break
        case 't':
          event.preventDefault()
          handleSelectTool('text')
          break
        case 'p':
          event.preventDefault()
          handleSelectTool('pointer')
          break
        case 'delete':
        case 'backspace':
          event.preventDefault()
          // Delete selected shapes
          const selectedShapes = editor.getSelectedShapes()
          if (selectedShapes.length > 0) {
            editor.deleteShapes(selectedShapes.map(shape => shape.id))
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [editor, handleSelectTool])

  const isActive = useCallback((tool: string) => currentTool === tool, [currentTool])

  const baseItemClasses = 'rounded cursor-pointer focus:outline-none'

  return (
    <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-700 ease-out ${
      isVisible 
        ? 'translate-y-0 opacity-100' 
        : 'translate-y-full opacity-0'
    } ${className}`}>
      <div
        className="bg-[#2c2c2c] relative rounded-[12px] px-2 py-2 inline-flex items-center overflow-hidden"
        role="toolbar"
        aria-label="Canvas tools"
      >
        {/* Tools cluster */}
        <div className="flex items-center gap-2">
          <div className="flex gap-[2px] items-center">
            <button
              className={`${baseItemClasses} size-[32px] ${isActive('select') ? 'bg-[#0C8CE9]' : 'hover:bg-[#434343]'}`}
              aria-label="Select (V)"
              title="Select (V)"
              onClick={() => handleSelectTool('select')}
            >
              <img src="/move.svg" alt="Select" className="w-8 h-8 mx-auto -mt-[1.5px]" />
            </button>
            <button className={`${baseItemClasses} h-[32px] w-[13px] flex items-center justify-center hover:bg-[#434343]`} aria-label="Select options">
              <ChevronDown className="w-[11px] h-[11px] text-white" />
            </button>
          </div>

          <div className="flex items-center">
            <button
              className={`${baseItemClasses} size-[32px] ${isActive('frame') ? 'bg-[#0C8CE9]' : 'hover:bg-[#434343]'}`}
              aria-label="Frame (F)"
              title="Frame (F)"
              onClick={() => handleSelectTool('frame')}
            >
              <img src="/frame.svg" alt="Frame" className="w-6 h-6 mx-auto" />
            </button>
            <button className={`${baseItemClasses} h-[32px] w-[13px] flex items-center justify-center hover:bg-[#434343]`} aria-label="Frame options">
              <ChevronDown className="w-[11px] h-[11px] text-white" />
            </button>
          </div>

          <div className="flex items-center">
            <button
              className={`${baseItemClasses} size-[32px] ${isActive('rectangle') ? 'bg-[#0C8CE9]' : 'hover:bg-[#434343]'}`}
              aria-label="Rectangle (R)"
              title="Rectangle (R)"
              onClick={() => handleSelectTool('rectangle')}
            >
              <img src="/rectangle.svg" alt="Rectangle" className="w-6 h-6 mx-auto" />
            </button>
            <button className={`${baseItemClasses} h-[32px] w-[13px] flex items-center justify-center hover:bg-[#434343]`} aria-label="Shape options">
              <ChevronDown className="w-[11px] h-[11px] text-white" />
            </button>
          </div>

          <div className="flex items-center">
            <button
              className={`${baseItemClasses} size-[32px] ${isActive('draw') ? 'bg-[#0C8CE9]' : 'hover:bg-[#434343]'}`}
              aria-label="Draw (D)"
              title="Draw (D)"
              onClick={() => handleSelectTool('draw')}
            >
              <img src="/pen.svg" alt="Draw" className="w-6 h-6 mx-auto" />
            </button>
            <button className={`${baseItemClasses} h-[32px] w-[13px] flex items-center justify-center hover:bg-[#434343]`} aria-label="Pen options">
              <ChevronDown className="w-[11px] h-[11px] text-white" />
            </button>
          </div>

          <button
            className={`${baseItemClasses} size-[32px] ${isActive('text') ? 'bg-[#0C8CE9]' : 'hover:bg-[#434343]'}`}
            aria-label="Text (T)"
            title="Text (T)"
            onClick={() => handleSelectTool('text')}
          >
            <img src="/text.svg" alt="Text" className="w-6 h-6 mx-auto" />
          </button>

          <div className="flex items-center">
            <button
              className={`${baseItemClasses} size-[32px] ${isActive('pointer') ? 'bg-[#0C8CE9]' : 'hover:bg-[#434343]'}`}
              aria-label="Pointer (P)"
              title="Pointer (P)"
              onClick={() => handleSelectTool('pointer')}
            >
              <img src="/pointer.svg" alt="Pointer" className="w-6 h-6 mx-auto" />
            </button>
            <button className={`${baseItemClasses} h-[32px] w-[13px] flex items-center justify-center hover:bg-[#434343]`} aria-label="Pointer options">
              <ChevronDown className="w-[11px] h-[11px] text-white" />
            </button>
          </div>

          <button
            className={`${baseItemClasses} size-[32px] bg-[#2C2C2C] hover:bg-[#434343]`}
            aria-label="Actions"
            title="Actions"
          >
            <img src="/actions.svg" alt="Actions" className="w-6 h-6 mx-auto" />
          </button>
        </div>

        {/* Divider */}
        <div className="flex flex-row items-stretch self-stretch mx-2">
          <div className="w-[1px] bg-[#444444] -my-2" />
        </div>

        {/* Mode select (visual) */}
        <div className="bg-[#444444] flex gap-[5px] items-center px-[4px] py-[3px] rounded-[4px]">
          <button className={`${baseItemClasses} size-[25px] hover:bg-[#434343]`} aria-label="Draw mode">
            <img src="/draw.svg" alt="Draw mode" className="w-6 h-6 mx-auto" />
          </button>
          <button className={`${baseItemClasses} size-[25px] bg-[#2C2C2C] hover:bg-[#434343]`} aria-label="Design mode">
            <img src="/design.svg" alt="Design mode" className="w-6 h-6 mx-auto" />
          </button>
           <button className={`${baseItemClasses} size-[25px] hover:bg-[#434343]`} aria-label="Dev mode">
             <img src="/dev.svg" alt="Dev mode" className="w-6 h-6 mx-auto" />
           </button>
        </div>

        {/* Outer border / shadow overlay */}
        <div
          aria-hidden="true"
          className="absolute border border-[#434343] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25),0px_4px_6px_3px_rgba(0,0,0,0.25)] overflow-hidden"
        />

      </div>
    </div>
  )
}

export default Toolbar
