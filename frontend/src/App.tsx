import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import IDE from './pages/IDE'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/ide" element={<IDE />} />
    </Routes>
  )
}

export default App
