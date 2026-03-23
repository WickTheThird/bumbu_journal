import { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Landing from './pages/Landing'
import IDE from './pages/IDE'
import Embed from './pages/Embed'

function App() {
  const navigate = useNavigate()
  
  // Handle GitHub Pages SPA redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    if (redirect) {
      // Clean up the URL and navigate
      window.history.replaceState(null, '', '/')
      navigate(redirect, { replace: true })
    }
  }, [navigate])
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/ide" element={<IDE />} />
      <Route path="/embed" element={<Embed />} />
    </Routes>
  )
}

export default App
