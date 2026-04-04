import { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Landing from './pages/Landing'
import IDE from './pages/IDE'
import Embed from './pages/Embed'
import ProjectPage from './pages/ProjectPage'
import UserProfile from './pages/UserProfile'
import Pricing from './pages/Pricing'
import Explore from './pages/Explore'

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
      <Route path="/p/:id" element={<ProjectPage />} />
      <Route path="/u/:username" element={<UserProfile />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/explore" element={<Explore />} />
    </Routes>
  )
}

export default App
