import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Handle GitHub Pages SPA redirect
const params = new URLSearchParams(window.location.search)
const redirectPath = params.get('p')
if (redirectPath) {
  // Remove the ?p= param and navigate to the actual path
  const cleanPath = decodeURIComponent(redirectPath).replace('/docs', '') || '/'
  const hash = window.location.hash
  window.history.replaceState(null, '', cleanPath + hash)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/docs">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
