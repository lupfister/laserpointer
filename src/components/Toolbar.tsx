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

  useEffect(() => {
    if (!editor) return
    const updateCurrentTool = () => {
      const tool = editor.getCurrentTool()?.id || 'select'
      setCurrentTool(tool)
    }
    
    updateCurrentTool()
    
    const unsubscribe = editor.store.listen(updateCurrentTool)
    return unsubscribe
  }, [editor])

  const handleSelectTool = useCallback((tool: string) => {
    if (!editor) return
    editor.setCurrentTool(tool)
    setCurrentTool(tool)
  }, [editor])

  const isActive = useCallback((tool: string) => currentTool === tool, [currentTool])

  const baseItemClasses = 'rounded cursor-pointer hover:bg-[#434343] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#2c2c2c]'

  return (
    <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-50 ${className}`}>
      <div
        className="bg-[#2c2c2c] relative rounded-[12px] px-2 py-2 inline-flex items-center overflow-hidden"
        role="toolbar"
        aria-label="Canvas tools"
      >
        {/* Tools cluster */}
        <div className="flex items-center gap-2">
          <div className="flex gap-[2px] items-center">
            <button
              className={`${baseItemClasses} size-[32px] ${isActive('select') ? 'bg-[#0C8CE9]' : ''}`}
              aria-label="Select (V)"
              title="Select (V)"
              onClick={() => handleSelectTool('select')}
            >
              <img src="/move.svg" alt="Select" className="w-8 h-8 mx-auto -mt-0.5" />
            </button>
            <button className={`${baseItemClasses} h-[32px] w-[13px] flex items-center justify-center`} aria-label="Select options">
              <ChevronDown className="w-[11px] h-[11px] text-white" />
            </button>
          </div>

          <div className="flex items-center">
            <button
              className={`${baseItemClasses} size-[32px]`}
              aria-label="Frame (F)"
              title="Frame (F)"
              onClick={() => handleSelectTool('frame')}
            >
              <img src="/frame.svg" alt="Frame" className="w-6 h-6 mx-auto" />
            </button>
            <button className={`${baseItemClasses} h-[32px] w-[13px] flex items-center justify-center`} aria-label="Frame options">
              <ChevronDown className="w-[11px] h-[11px] text-white" />
            </button>
          </div>

          <div className="flex items-center">
            <button
              className={`${baseItemClasses} size-[32px]`}
              aria-label="Rectangle (R)"
              title="Rectangle (R)"
              onClick={() => handleSelectTool('rectangle')}
            >
              <img src="/rectangle.svg" alt="Rectangle" className="w-6 h-6 mx-auto" />
            </button>
            <button className={`${baseItemClasses} h-[32px] w-[13px] flex items-center justify-center`} aria-label="Shape options">
              <ChevronDown className="w-[11px] h-[11px] text-white" />
            </button>
          </div>

          <div className="flex items-center">
            <button
              className={`${baseItemClasses} size-[32px] ${isActive('draw') ? 'bg-[#434343]' : ''}`}
              aria-label="Draw (D)"
              title="Draw (D)"
              onClick={() => handleSelectTool('draw')}
            >
              <img src="/pen.svg" alt="Draw" className="w-6 h-6 mx-auto" />
            </button>
            <button className={`${baseItemClasses} h-[32px] w-[13px] flex items-center justify-center`} aria-label="Pen options">
              <ChevronDown className="w-[11px] h-[11px] text-white" />
            </button>
          </div>

          <button
            className={`${baseItemClasses} size-[32px]`}
            aria-label="Text (T)"
            title="Text (T)"
            onClick={() => handleSelectTool('text')}
          >
            <img src="/text.svg" alt="Text" className="w-6 h-6 mx-auto" />
          </button>

          <div className="flex items-center">
            <button
              className={`${baseItemClasses} size-[32px]`}
              aria-label="Comment"
              title="Comment"
            >
              <img src="/comment.svg" alt="Comment" className="w-6 h-6 mx-auto" />
            </button>
            <button className={`${baseItemClasses} h-[32px] w-[13px] flex items-center justify-center`} aria-label="Comment options">
              <ChevronDown className="w-[11px] h-[11px] text-white" />
            </button>
          </div>

          <button
            className={`${baseItemClasses} size-[32px] bg-[#2C2C2C]`}
            aria-label="Actions"
            title="Actions"
          >
            <img src="/actions.svg" alt="Actions" className="w-6 h-6 mx-auto" />
          </button>
        </div>

        {/* Divider */}
        <div className="flex flex-row items-stretch self-stretch mx-2">
          <div className="w-[1px] bg-[#444444]" />
        </div>

        {/* Mode select (visual) */}
        <div className="bg-[#444444] flex gap-[5px] items-center px-[4px] py-[3px] rounded-[4px]">
          <button className={`${baseItemClasses} size-[25px]`} aria-label="Draw mode">
            <img src="/draw.svg" alt="Draw mode" className="w-6 h-6 mx-auto" />
          </button>
          <button className={`${baseItemClasses} size-[25px] bg-[#2C2C2C]`} aria-label="Design mode">
            <img src="/design.svg" alt="Design mode" className="w-6 h-6 mx-auto" />
          </button>
           <button className={`${baseItemClasses} size-[25px]`} aria-label="Dev mode">
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
