'use client'

import { Tldraw, TldrawUiMenuItem, useEditor, useValue } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import Toolbar from '@/components/Toolbar'

export default function Home() {


  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">
      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <Tldraw
          persistenceKey="laserpointer-canvas"
          hideUi
          className="w-full h-full"
          onMount={(editor) => {
            // Set initial tool
            editor.setCurrentTool('select')
            
            // Configure editor settings
            editor.updateInstanceState({
              isDebugMode: false,
              isGridMode: false,
            })
          }}
        >
          <Toolbar />
        </Tldraw>
      </div>
    </div>
  )
}