import { Workspace } from '../types/workspace'

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  workspace: Workspace
}

const defaultSettings = { theme: 'dark' as const, fontSize: 14, tabSize: 2, wordWrap: true, minimap: true, lineNumbers: true }

export const templates: Template[] = [
  {
    id: 'react-counter',
    name: 'React Counter',
    description: 'Interactive counter with hooks',
    icon: 'react',
    workspace: {
      version: 1,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "react-counter",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}`,
          language: 'json',
        },
        {
          name: 'vite.config.ts',
          content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})`,
          language: 'typescript',
        },
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Counter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
          language: 'html',
        },
        {
          name: 'src/main.tsx',
          content: `import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)`,
          language: 'typescript',
        },
        {
          name: 'src/App.tsx',
          content: `import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'system-ui, sans-serif',
      color: 'white',
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        React Counter
      </h1>
      
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '2rem 3rem',
        borderRadius: '1rem',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '4rem', margin: '0 0 1rem' }}>{count}</p>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setCount(c => c - 1)} style={btnStyle('#ff6b6b')}>-</button>
          <button onClick={() => setCount(0)} style={btnStyle('#4ecdc4')}>Reset</button>
          <button onClick={() => setCount(c => c + 1)} style={btnStyle('#45b7d1')}>+</button>
        </div>
      </div>
    </div>
  )
}

const btnStyle = (bg: string) => ({
  padding: '0.75rem 1.5rem',
  fontSize: '1.25rem',
  border: 'none',
  borderRadius: '0.5rem',
  background: bg,
  color: 'white',
  cursor: 'pointer',
})`,
          language: 'typescript',
        },
      ],
      activeFile: 'src/App.tsx',
      settings: defaultSettings,
    },
  },
  {
    id: 'react-todo',
    name: 'React Todo',
    description: 'Todo list with TypeScript',
    icon: 'react',
    workspace: {
      version: 1,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "react-todo",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}`,
          language: 'json',
        },
        {
          name: 'vite.config.ts',
          content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
          language: 'typescript',
        },
        {
          name: 'src/main.tsx',
          content: `import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)`,
          language: 'typescript',
        },
        {
          name: 'src/App.tsx',
          content: `import { useState } from 'react'

interface Todo {
  id: number
  text: string
  completed: boolean
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn React', completed: true },
    { id: 2, text: 'Build with HashIDE', completed: false },
  ])
  const [input, setInput] = useState('')

  const addTodo = () => {
    if (!input.trim()) return
    setTodos([...todos, { id: Date.now(), text: input, completed: false }])
    setInput('')
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '2rem', fontFamily: 'system-ui' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Todo App</h1>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          placeholder="Add a task..."
          style={{ flex: 1, padding: '0.75rem', fontSize: '1rem', border: '2px solid #e2e8f0', borderRadius: '0.5rem' }}
        />
        <button onClick={addTodo} style={{ padding: '0.75rem 1.5rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
          Add
        </button>
      </div>
      
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', marginBottom: '0.5rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
            <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
            <span style={{ flex: 1, textDecoration: todo.completed ? 'line-through' : 'none', color: todo.completed ? '#94a3b8' : 'inherit' }}>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.25rem' }}>x</button>
          </li>
        ))}
      </ul>
      
      <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>
        {todos.filter(t => !t.completed).length} tasks remaining
      </p>
    </div>
  )
}`,
          language: 'typescript',
        },
      ],
      activeFile: 'src/App.tsx',
      settings: defaultSettings,
    },
  },
  {
    id: 'react-framer',
    name: 'React + Framer Motion',
    description: 'Animations with framer-motion',
    icon: 'react',
    workspace: {
      version: 1,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "react-framer",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.16.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}`,
          language: 'json',
        },
        {
          name: 'vite.config.ts',
          content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
          language: 'typescript',
        },
        {
          name: 'src/main.tsx',
          content: `import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)`,
          language: 'typescript',
        },
        {
          name: 'src/App.tsx',
          content: `import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function App() {
  const [items, setItems] = useState([1, 2, 3])
  const [selected, setSelected] = useState<number | null>(null)

  const addItem = () => setItems([...items, Date.now()])
  const removeItem = (id: number) => setItems(items.filter(i => i !== id))

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '2rem', fontFamily: 'system-ui' }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '2rem' }}>
        Framer Motion Demo
      </h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addItem}
          style={{
            padding: '1rem 2rem',
            background: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Add Card
        </motion.button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        <AnimatePresence>
          {items.map((id) => (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              whileHover={{ y: -5 }}
              onClick={() => setSelected(selected === id ? null : id)}
              style={{
                width: selected === id ? '200px' : '150px',
                height: selected === id ? '200px' : '150px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <motion.button
                whileHover={{ scale: 1.2 }}
                onClick={(e) => { e.stopPropagation(); removeItem(id) }}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                x
              </motion.button>
              <span style={{ color: 'white', fontSize: '1.5rem' }}>
                {selected === id ? 'Selected!' : 'Click me'}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}`,
          language: 'typescript',
        },
      ],
      activeFile: 'src/App.tsx',
      settings: defaultSettings,
    },
  },
  {
    id: 'particles',
    name: 'Particle System',
    description: 'Canvas animation with mouse interaction',
    icon: 'particle',
    workspace: {
      version: 1,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html>
<head>
  <title>Particles</title>
  <style>
    * { margin: 0; padding: 0; }
    body { background: #000; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script src="particles.js"></script>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'particles.js',
          content: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
const particles = [];

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
    this.color = \`hsl(\${Math.random() * 60 + 200}, 100%, 50%)\`;
  }

  update() {
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 200) {
      const force = (200 - distance) / 200;
      this.speedX += dx / distance * force * 0.5;
      this.speedY += dy / distance * force * 0.5;
    }

    this.x += this.speedX;
    this.y += this.speedY;
    this.speedX *= 0.98;
    this.speedY *= 0.98;

    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

function connectParticles() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        ctx.strokeStyle = \`rgba(100, 200, 255, \${1 - distance / 100})\`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

for (let i = 0; i < 100; i++) {
  particles.push(new Particle());
}

canvas.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach(p => { p.update(); p.draw(); });
  connectParticles();
  
  requestAnimationFrame(animate);
}

animate();`,
          language: 'javascript',
        },
      ],
      activeFile: 'particles.js',
      settings: defaultSettings,
    },
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Minimal portfolio with CSS animations',
    icon: 'portfolio',
    workspace: {
      version: 1,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav>
    <div class="logo">JD</div>
    <div class="nav-links">
      <a href="#about">About</a>
      <a href="#work">Work</a>
      <a href="#contact">Contact</a>
    </div>
  </nav>

  <main>
    <section class="hero">
      <h1>John Doe</h1>
      <p class="subtitle">Full Stack Developer</p>
      <p class="tagline">I build things for the web</p>
    </section>

    <section id="about" class="section">
      <h2>About</h2>
      <p>Developer passionate about creating elegant solutions. Expertise in React, Node.js, and Python.</p>
    </section>

    <section id="work" class="section">
      <h2>Work</h2>
      <div class="projects">
        <div class="project-card">
          <h3>Project Alpha</h3>
          <p>Real-time collaboration platform</p>
          <div class="tags"><span>React</span><span>Socket.io</span></div>
        </div>
        <div class="project-card">
          <h3>Project Beta</h3>
          <p>ML-powered analytics dashboard</p>
          <div class="tags"><span>Python</span><span>TensorFlow</span></div>
        </div>
      </div>
    </section>

    <section id="contact" class="section">
      <h2>Contact</h2>
      <a href="mailto:hello@johndoe.dev" class="btn">Say Hello</a>
    </section>
  </main>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `:root {
  --bg: #0a0a0a;
  --text: #ffffff;
  --accent: #7c3aed;
  --muted: #888;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

nav {
  position: fixed;
  top: 0;
  width: 100%;
  padding: 1.5rem 5%;
  display: flex;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  z-index: 100;
}

.logo { font-size: 1.5rem; font-weight: 700; color: var(--accent); }
.nav-links a { color: var(--muted); text-decoration: none; margin-left: 2rem; transition: color 0.3s; }
.nav-links a:hover { color: var(--text); }

main { padding: 0 5%; }

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero h1 {
  font-size: clamp(3rem, 10vw, 6rem);
  font-weight: 800;
  background: linear-gradient(135deg, var(--text), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle { font-size: 1.5rem; color: var(--accent); }
.tagline { color: var(--muted); }

.section { padding: 6rem 0; max-width: 800px; }
.section h2 { font-size: 2rem; margin-bottom: 1.5rem; color: var(--accent); }

.projects { display: grid; gap: 1.5rem; }
.project-card {
  padding: 2rem;
  border: 1px solid #222;
  border-radius: 1rem;
  transition: all 0.3s;
}
.project-card:hover { border-color: var(--accent); transform: translateY(-5px); }
.project-card p { color: var(--muted); }
.tags { margin-top: 1rem; display: flex; gap: 0.5rem; }
.tags span { padding: 0.25rem 0.75rem; background: #1a1a1a; border-radius: 2rem; font-size: 0.8rem; }

.btn {
  display: inline-block;
  padding: 1rem 2rem;
  background: var(--accent);
  color: var(--text);
  text-decoration: none;
  border-radius: 0.5rem;
  transition: transform 0.3s;
}
.btn:hover { transform: translateY(-2px); }`,
          language: 'css',
        },
      ],
      activeFile: 'index.html',
      settings: defaultSettings,
    },
  },
  {
    id: 'blank-react',
    name: 'Blank React',
    description: 'Empty React + Vite project',
    icon: 'react',
    workspace: {
      version: 1,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "my-react-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}`,
          language: 'json',
        },
        {
          name: 'vite.config.ts',
          content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,
          language: 'typescript',
        },
        {
          name: 'src/main.tsx',
          content: `import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)`,
          language: 'typescript',
        },
        {
          name: 'src/App.tsx',
          content: `export default function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Hello World</h1>
      <p>Edit src/App.tsx to get started</p>
    </div>
  )
}`,
          language: 'typescript',
        },
      ],
      activeFile: 'src/App.tsx',
      settings: defaultSettings,
    },
  },
  {
    id: 'blank-html',
    name: 'Blank HTML',
    description: 'Empty HTML/CSS/JS project',
    icon: 'file',
    workspace: {
      version: 1,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello World</h1>
  <script src="main.js"></script>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `body {
  font-family: system-ui, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}`,
          language: 'css',
        },
        {
          name: 'main.js',
          content: `console.log('Hello from HashIDE!');`,
          language: 'javascript',
        },
      ],
      activeFile: 'index.html',
      settings: defaultSettings,
    },
  },
]
