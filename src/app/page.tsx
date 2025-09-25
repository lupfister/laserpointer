'use client'

import { Tldraw, TldrawUiMenuItem, useEditor, useValue } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'
import Toolbar from '@/components/Toolbar'
import CustomFrame from '@/components/CustomFrame'

export default function Home() {


  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#F2F2F2' }}>
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
            
            // Default styles will be handled by CSS
            
            // Configure tools
            editor.setCurrentTool('select')

            // Hide any license / production banners or watermarks injected by tldraw
            const hideLicenseNodes = () => {
              const root: HTMLElement | null = document.body
              if (!root) return

              const shouldHide = (el: Element) => {
                const text = (el as HTMLElement).innerText || ''
                const aria = (el as HTMLElement).getAttribute('aria-label') || ''
                const role = (el as HTMLElement).getAttribute('role') || ''
                return /license|watermark|production/i.test(text) || /license|production/i.test(aria) || /license|alert|status/i.test(role)
              }

              const candidates = root.querySelectorAll(
                [
                  '[class*="license"]',
                  '[class*="watermark"]',
                  '.tlui-watermark',
                  '.tlui-license',
                  '.tlui-license-banner',
                  '.tlui-debug-warning',
                  '[data-tl-license]',
                  '[data-license]',
                  '[aria-label*="license" i]',
                  '[aria-label*="production" i]'
                ].join(', ')
              )

              candidates.forEach((el) => {
                const target = shouldHide(el) ? (el as HTMLElement) : (el.parentElement as HTMLElement | null)
                if (target) {
                  target.style.setProperty('display', 'none', 'important')
                  target.style.setProperty('visibility', 'hidden', 'important')
                  target.style.setProperty('pointer-events', 'none', 'important')
                }
              })

              // Fallback: scan for any tlui nodes containing trigger phrases
              const tluiNodes = root.querySelectorAll('[class*="tlui"], [data-testid], [data-tl]')
              tluiNodes.forEach((el) => {
                if (shouldHide(el)) {
                  (el as HTMLElement).style.setProperty('display', 'none', 'important')
                }
              })
            }

            // Run immediately and keep watching for re-insertions
            hideLicenseNodes()
            const observer = new MutationObserver(() => hideLicenseNodes())
            observer.observe(document.body, { childList: true, subtree: true })

            // Clean up on unmount
            return () => {
              observer.disconnect()
            }
          }}
        >
          <Toolbar />
          <CustomFrame />
        </Tldraw>
      </div>
    </div>
  )
}