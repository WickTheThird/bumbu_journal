import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import IDE from './pages/IDE'
import Embed from './pages/Embed'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/ide" element={<IDE />} />
      <Route path="/embed" element={<Embed />} />
    </Routes>
  )
}

export default App
