import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import App from './App'
import './index.css'

// @ts-expect-error - Vite worker imports
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
// @ts-expect-error - Vite worker imports
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
// @ts-expect-error - Vite worker imports
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
// @ts-expect-error - Vite worker imports
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
// @ts-expect-error - Vite worker imports
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker()
    if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
    if (label === 'typescript' || label === 'javascript') return new tsWorker()
    return new editorWorker()
  }
}

loader.config({ monaco })

const originalConsoleError = console.error
console.error = (...args) => {
  const msg = args[0]?.toString?.() || ''
  if (msg.includes('DisposableStore') || msg.includes('Canceled')) {
    return
  }
  originalConsoleError.apply(console, args)
}

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason?.toString?.() || ''
  if (reason.includes('Canceled') || reason.includes('disposed')) {
    event.preventDefault()
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
