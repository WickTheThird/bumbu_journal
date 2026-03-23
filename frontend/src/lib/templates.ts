import { Workspace } from '../types/workspace'

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  workspace: Workspace
}

const defaultSettings = { theme: 'dark' as const, fontSize: 14, tabSize: 2, wordWrap: true, minimap: true, lineNumbers: true }

export const TEMPLATES: Template[] = [
  {
    id: 'react-counter',
    name: 'React Counter',
    description: 'Interactive counter with hooks',
    icon: 'react',
    workspace: {
      version: 2,
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
      version: 2,
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
    { id: 2, text: 'Build with HashIDEA', completed: false },
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
      version: 2,
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
      version: 2,
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
      version: 2,
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
      version: 2,
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
      version: 2,
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
          content: `console.log('Hello from HashIDEA!');`,
          language: 'javascript',
        },
      ],
      activeFile: 'index.html',
      settings: defaultSettings,
    },
  },
  {
    id: 'pricing-page',
    name: 'Pricing Page',
    description: 'SaaS pricing layout with tiers',
    icon: 'portfolio',
    workspace: {
      version: 2,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pricing</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="hero">
    <h1>Simple, transparent pricing</h1>
    <p>Choose a plan that scales with your team.</p>
  </header>
  <section class="grid">
    <article class="card">
      <h2>Starter</h2>
      <p class="price">$12<span>/mo</span></p>
      <ul>
        <li>1 workspace</li>
        <li>Basic analytics</li>
        <li>Email support</li>
      </ul>
      <button>Get Starter</button>
    </article>
    <article class="card featured">
      <h2>Pro</h2>
      <p class="price">$29<span>/mo</span></p>
      <ul>
        <li>Unlimited projects</li>
        <li>Team collaboration</li>
        <li>Priority support</li>
      </ul>
      <button>Get Pro</button>
    </article>
    <article class="card">
      <h2>Enterprise</h2>
      <p class="price">$79<span>/mo</span></p>
      <ul>
        <li>Custom workflows</li>
        <li>Dedicated success</li>
        <li>SOC2 reports</li>
      </ul>
      <button>Contact sales</button>
    </article>
  </section>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #0b0b12;
  color: #f3f4f6;
}
.hero {
  padding: 4rem 2rem 2rem;
  text-align: center;
}
.hero p { color: #9ca3af; }
.grid {
  max-width: 1100px;
  margin: 0 auto 4rem;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}
.card {
  background: #141423;
  border: 1px solid #27273d;
  border-radius: 1rem;
  padding: 2rem;
  display: grid;
  gap: 1rem;
}
.card.featured {
  border-color: #7c3aed;
  box-shadow: 0 20px 40px rgba(124, 58, 237, 0.25);
}
.price { font-size: 2.5rem; margin: 0; }
.price span { font-size: 1rem; color: #9ca3af; }
ul { margin: 0; padding-left: 1.2rem; color: #cbd5f5; }
button {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 999px;
  background: #7c3aed;
  color: white;
  font-weight: 600;
  cursor: pointer;
}
.card:not(.featured) button { background: #1f1f33; }
`,
          language: 'css',
        },
      ],
      activeFile: 'index.html',
      settings: defaultSettings,
    },
  },
  {
    id: 'saas-landing',
    name: 'SaaS Landing',
    description: 'Hero, features, and CTA sections',
    icon: 'portfolio',
    workspace: {
      version: 2,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nova</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <nav>
    <div class="logo">Nova</div>
    <div class="links">
      <a href="#features">Features</a>
      <a href="#story">Story</a>
      <button>Get started</button>
    </div>
  </nav>
  <header class="hero">
    <h1>Ship ideas faster with Nova.</h1>
    <p>All-in-one workspace for strategy, execution, and customer insights.</p>
    <div class="cta">
      <button class="primary">Start free</button>
      <button class="ghost">Book demo</button>
    </div>
  </header>
  <section id="features" class="features">
    <article>
      <h3>Realtime collaboration</h3>
      <p>Comment, edit, and ship together in a single canvas.</p>
    </article>
    <article>
      <h3>Roadmaps</h3>
      <p>Convert feedback into milestones with drag-and-drop planning.</p>
    </article>
    <article>
      <h3>Insights</h3>
      <p>Turn usage data into clear next steps for your team.</p>
    </article>
  </section>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
  background: #f8fafc;
  color: #0f172a;
}
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 3rem;
}
.logo { font-weight: 700; font-size: 1.25rem; }
.links { display: flex; gap: 1.5rem; align-items: center; }
.links a { text-decoration: none; color: #475569; }
button {
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
}
.hero {
  padding: 4rem 3rem 3rem;
  max-width: 900px;
}
.hero p { color: #64748b; font-size: 1.1rem; }
.primary { background: #0f172a; color: white; }
.ghost { background: transparent; border: 1px solid #cbd5f5; }
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  padding: 0 3rem 4rem;
}
.features article {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}
`,
          language: 'css',
        },
      ],
      activeFile: 'index.html',
      settings: defaultSettings,
    },
  },
  {
    id: 'markdown-docs',
    name: 'Markdown Docs',
    description: 'Docs layout in Markdown',
    icon: 'file',
    workspace: {
      version: 2,
      files: [
        {
          name: 'README.md',
          content: `# Product Docs

Welcome to the Nova API. Use this guide to get started.

## Quick start

1. Create an API key
2. Send your first request
3. Track responses in the dashboard

## Example

\`\`\`bash
curl https://api.nova.dev/v1/status \\
  -H "Authorization: Bearer <token>"
\`\`\`

## Next steps

- Explore endpoints in the reference
- Join the community
- Read the changelog
`,
          language: 'markdown',
        },
      ],
      activeFile: 'README.md',
      settings: defaultSettings,
    },
  },
  {
    id: 'glass-login',
    name: 'Glass Login',
    description: 'Glassmorphism login card',
    icon: 'portfolio',
    workspace: {
      version: 2,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="backdrop"></div>
  <form class="card">
    <h1>Welcome back</h1>
    <label>Email</label>
    <input placeholder="you@company.com" />
    <label>Password</label>
    <input type="password" placeholder="••••••••" />
    <button>Sign in</button>
  </form>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `* { box-sizing: border-box; }
body {
  margin: 0;
  height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: linear-gradient(135deg, #0ea5e9, #6366f1, #f472b6);
}
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.25);
  backdrop-filter: blur(10px);
}
.card {
  position: relative;
  z-index: 1;
  width: 320px;
  padding: 2rem;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: grid;
  gap: 0.75rem;
  color: white;
}
input {
  border: none;
  border-radius: 0.75rem;
  padding: 0.7rem 0.8rem;
}
button {
  margin-top: 0.5rem;
  border: none;
  border-radius: 999px;
  padding: 0.75rem;
  background: white;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
}
`,
          language: 'css',
        },
      ],
      activeFile: 'index.html',
      settings: defaultSettings,
    },
  },
  {
    id: 'dashboard-ui',
    name: 'Analytics Dashboard',
    description: 'Cards and charts layout',
    icon: 'chart',
    workspace: {
      version: 2,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dashboard</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <aside>
    <h2>Pulse</h2>
    <nav>
      <a class="active">Overview</a>
      <a>Reports</a>
      <a>Alerts</a>
      <a>Settings</a>
    </nav>
  </aside>
  <main>
    <header>
      <div>
        <h1>Overview</h1>
        <p>Performance last 30 days</p>
      </div>
      <button>Export</button>
    </header>
    <section class="grid">
      <div class="card"><h3>Revenue</h3><p>$128,420</p><span>+12%</span></div>
      <div class="card"><h3>Active Users</h3><p>28,910</p><span>+4%</span></div>
      <div class="card"><h3>Conversion</h3><p>3.9%</p><span>-0.8%</span></div>
      <div class="card"><h3>Churn</h3><p>1.2%</p><span>+0.2%</span></div>
    </section>
    <section class="chart">
      <h3>Weekly signups</h3>
      <div class="bars">
        <span style="height:40%"></span>
        <span style="height:62%"></span>
        <span style="height:48%"></span>
        <span style="height:80%"></span>
        <span style="height:55%"></span>
        <span style="height:70%"></span>
      </div>
    </section>
  </main>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `* { box-sizing: border-box; }
body {
  margin: 0;
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
  font-family: system-ui, sans-serif;
  background: #f1f5f9;
  color: #0f172a;
}
aside {
  background: #0f172a;
  color: white;
  padding: 2rem 1.5rem;
}
aside a { display: block; padding: 0.6rem 0; color: #94a3b8; }
aside a.active { color: #fff; font-weight: 600; }
main { padding: 2rem; }
header { display: flex; justify-content: space-between; align-items: center; }
header p { color: #64748b; }
button {
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1rem;
  background: #0f172a;
  color: white;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}
.card {
  background: white;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}
.card span { color: #10b981; }
.chart {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
}
.bars {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.8rem;
  height: 160px;
  align-items: end;
}
.bars span { background: #6366f1; border-radius: 0.6rem 0.6rem 0 0; }
`,
          language: 'css',
        },
      ],
      activeFile: 'index.html',
      settings: defaultSettings,
    },
  },
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Simple calculator UI and logic',
    icon: 'file',
    workspace: {
      version: 2,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Calculator</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="calc">
    <input id="display" readonly value="0" />
    <div class="keys">
      <button data-action="clear">C</button>
      <button data-action="sign">±</button>
      <button data-action="percent">%</button>
      <button data-action="op" data-value="/">÷</button>
      <button data-value="7">7</button>
      <button data-value="8">8</button>
      <button data-value="9">9</button>
      <button data-action="op" data-value="*">×</button>
      <button data-value="4">4</button>
      <button data-value="5">5</button>
      <button data-value="6">6</button>
      <button data-action="op" data-value="-">−</button>
      <button data-value="1">1</button>
      <button data-value="2">2</button>
      <button data-value="3">3</button>
      <button data-action="op" data-value="+">+</button>
      <button data-value="0" class="wide">0</button>
      <button data-action="dot">.</button>
      <button data-action="equals" class="accent">=</button>
    </div>
  </div>
  <script src="main.js"></script>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `* { box-sizing: border-box; }
body {
  margin: 0;
  height: 100vh;
  display: grid;
  place-items: center;
  background: #0f172a;
  font-family: system-ui, sans-serif;
}
.calc {
  width: 320px;
  background: #111827;
  padding: 1.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}
input {
  width: 100%;
  font-size: 2.2rem;
  padding: 0.8rem;
  border-radius: 0.75rem;
  border: none;
  background: #0f172a;
  color: white;
  text-align: right;
}
.keys {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
  margin-top: 1rem;
}
button {
  padding: 0.9rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 0.9rem;
  background: #1f2937;
  color: white;
  cursor: pointer;
}
button.accent { background: #7c3aed; }
button.wide { grid-column: span 2; }
`,
          language: 'css',
        },
        {
          name: 'main.js',
          content: `const display = document.getElementById('display')
let current = '0'
let operator = null
let previous = null

const update = () => (display.value = current)

const compute = () => {
  if (previous === null || operator === null) return
  const a = parseFloat(previous)
  const b = parseFloat(current)
  if (Number.isNaN(a) || Number.isNaN(b)) return
  const ops = { '+': a + b, '-': a - b, '*': a * b, '/': b === 0 ? 0 : a / b }
  current = String(ops[operator])
  operator = null
  previous = null
}

document.querySelectorAll('button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action
    const value = btn.dataset.value
    if (!action && value) {
      current = current === '0' ? value : current + value
      return update()
    }
    if (action === 'dot') {
      if (!current.includes('.')) current += '.'
      return update()
    }
    if (action === 'clear') {
      current = '0'
      operator = null
      previous = null
      return update()
    }
    if (action === 'sign') {
      current = String(parseFloat(current) * -1)
      return update()
    }
    if (action === 'percent') {
      current = String(parseFloat(current) / 100)
      return update()
    }
    if (action === 'op') {
      if (operator) compute()
      operator = value
      previous = current
      current = '0'
      return update()
    }
    if (action === 'equals') {
      compute()
      return update()
    }
  })
})
update()
`,
          language: 'javascript',
        },
      ],
      activeFile: 'main.js',
      settings: defaultSettings,
    },
  },
  {
    id: 'kanban-board',
    name: 'Kanban Board',
    description: 'Drag-free kanban columns',
    icon: 'file',
    workspace: {
      version: 2,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kanban</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header>
    <h1>Launch Plan</h1>
    <button>Add card</button>
  </header>
  <section class="board">
    <div>
      <h2>Backlog</h2>
      <div class="card">Draft onboarding</div>
      <div class="card">Design landing page</div>
    </div>
    <div>
      <h2>In progress</h2>
      <div class="card">Implement auth</div>
      <div class="card">Write docs</div>
    </div>
    <div>
      <h2>Done</h2>
      <div class="card">Setup repo</div>
    </div>
  </section>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: #f8fafc;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
}
header button {
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 999px;
  background: #38bdf8;
  color: #0f172a;
  font-weight: 600;
}
.board {
  display: grid;
  gap: 1.5rem;
  padding: 0 2rem 2rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.board > div {
  background: #111827;
  border-radius: 1rem;
  padding: 1rem;
}
.card {
  background: #1e293b;
  padding: 0.8rem;
  border-radius: 0.75rem;
  margin-top: 0.75rem;
}
`,
          language: 'css',
        },
      ],
      activeFile: 'index.html',
      settings: defaultSettings,
    },
  },
  {
    id: 'weather-widget',
    name: 'Weather Widget',
    description: 'Fetch-based weather card',
    icon: 'api',
    workspace: {
      version: 2,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Weather</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="card">
    <h1>Berlin</h1>
    <p id="temp">--°</p>
    <p id="status">Loading...</p>
  </div>
  <script src="main.js"></script>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `body {
  margin: 0;
  height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: #f8fafc;
}
.card {
  padding: 2rem 3rem;
  border-radius: 2rem;
  background: linear-gradient(135deg, #38bdf8, #6366f1);
  text-align: center;
}
#temp { font-size: 3rem; margin: 0.5rem 0; }
`,
          language: 'css',
        },
        {
          name: 'main.js',
          content: `const temp = document.getElementById('temp')
const status = document.getElementById('status')

fetch('https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true')
  .then(res => res.json())
  .then(data => {
    const weather = data.current_weather
    temp.textContent = Math.round(weather.temperature) + '°'
    status.textContent = 'Wind ' + Math.round(weather.windspeed) + ' km/h'
  })
  .catch(() => {
    status.textContent = 'Failed to load'
  })
`,
          language: 'javascript',
        },
      ],
      activeFile: 'main.js',
      settings: defaultSettings,
    },
  },
  {
    id: 'css-animations',
    name: 'CSS Buttons',
    description: 'Animated button styles',
    icon: 'file',
    workspace: {
      version: 2,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Buttons</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <button class="pulse">Launch</button>
  <button class="outline">Secondary</button>
  <button class="glow">Neon</button>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `body {
  margin: 0;
  height: 100vh;
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  background: #0b0b12;
  font-family: system-ui, sans-serif;
}
button {
  padding: 0.8rem 1.6rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  color: white;
  font-weight: 600;
}
.pulse {
  background: #6366f1;
  box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.6);
  animation: pulse 2s infinite;
}
.outline {
  background: transparent;
  border: 1px solid #94a3b8;
}
.glow {
  background: #ec4899;
  box-shadow: 0 0 16px rgba(236, 72, 153, 0.8);
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.6); }
  70% { box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
}
`,
          language: 'css',
        },
      ],
      activeFile: 'style.css',
      settings: defaultSettings,
    },
  },
  {
    id: 'blog-layout',
    name: 'Blog Layout',
    description: 'Article + sidebar layout',
    icon: 'portfolio',
    workspace: {
      version: 2,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blog</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main>
    <article>
      <h1>Designing calmer dashboards</h1>
      <p class="meta">April 2 · 6 min read</p>
      <p>Great dashboards reduce anxiety and improve clarity. Start with fewer metrics and a clear visual hierarchy.</p>
      <blockquote>Simple beats busy. Focus on what moves the needle.</blockquote>
      <p>Use generous spacing, quiet backgrounds, and intentional typography.</p>
    </article>
    <aside>
      <h2>Top stories</h2>
      <ul>
        <li>Launch checklists that work</li>
        <li>How to run roadmap reviews</li>
        <li>Design systems in 2 weeks</li>
      </ul>
    </aside>
  </main>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `body {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
  background: #f8fafc;
  color: #0f172a;
}
main {
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}
article {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 12px 20px rgba(15, 23, 42, 0.08);
}
.meta { color: #64748b; font-size: 0.9rem; }
blockquote {
  margin: 1.5rem 0;
  padding-left: 1rem;
  border-left: 3px solid #6366f1;
  color: #475569;
}
aside {
  background: #0f172a;
  color: white;
  padding: 1.5rem;
  border-radius: 1rem;
  height: fit-content;
}
`,
          language: 'css',
        },
      ],
      activeFile: 'index.html',
      settings: defaultSettings,
    },
  },
  {
    id: 'product-hero',
    name: 'Product Hero',
    description: 'Hero section with stats',
    icon: 'portfolio',
    workspace: {
      version: 2,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pulse</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <section class="hero">
    <div>
      <h1>Powerful workflows for creative teams.</h1>
      <p>Bring strategy, production, and feedback into one calm workspace.</p>
      <button>Start free trial</button>
    </div>
    <div class="stats">
      <div><strong>98%</strong><span>on-time delivery</span></div>
      <div><strong>4.9</strong><span>avg rating</span></div>
      <div><strong>120k</strong><span>weekly views</span></div>
    </div>
  </section>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #0b0b12;
  color: #f9fafb;
}
.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
  padding: 4rem 3rem;
}
button {
  margin-top: 1rem;
  background: #38bdf8;
  border: none;
  padding: 0.8rem 1.6rem;
  border-radius: 999px;
  font-weight: 600;
}
.stats {
  display: grid;
  gap: 1rem;
  background: #141423;
  padding: 2rem;
  border-radius: 1.5rem;
}
.stats div { display: grid; gap: 0.3rem; }
.stats span { color: #94a3b8; }
`,
          language: 'css',
        },
      ],
      activeFile: 'index.html',
      settings: defaultSettings,
    },
  },
  {
    id: 'music-player',
    name: 'Music Player',
    description: 'Compact player UI',
    icon: 'file',
    workspace: {
      version: 2,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Player</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="player">
    <img src="https://images.unsplash.com/photo-1485579149621-3123dd979885?auto=format&fit=crop&w=300&q=80" alt="Album" />
    <div>
      <h2>Neon Nights</h2>
      <p>Skyline</p>
      <input type="range" value="35" />
      <div class="controls">
        <button>◀</button>
        <button class="play">▶</button>
        <button>▶▶</button>
      </div>
    </div>
  </div>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `body {
  margin: 0;
  height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #0b0b12;
  color: white;
}
.player {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1.5rem;
  background: #141423;
  padding: 1.5rem;
  border-radius: 1.5rem;
  width: min(520px, 90vw);
}
img { width: 120px; height: 120px; border-radius: 1rem; object-fit: cover; }
input { width: 100%; }
.controls { display: flex; gap: 0.5rem; margin-top: 0.8rem; }
button {
  border: none;
  border-radius: 999px;
  padding: 0.5rem 0.9rem;
  background: #1f2937;
  color: white;
  cursor: pointer;
}
.play { background: #7c3aed; }
`,
          language: 'css',
        },
      ],
      activeFile: 'index.html',
      settings: defaultSettings,
    },
  },
  {
    id: 'react-notes',
    name: 'React Notes',
    description: 'Notes app with tags',
    icon: 'react',
    workspace: {
      version: 2,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "react-notes",
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
          name: 'src/main.tsx',
          content: `import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)` ,
          language: 'typescript',
        },
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Notes</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'src/App.tsx',
          content: `import { useMemo, useState } from 'react'

const seed = [
  { id: 1, text: 'Draft onboarding flow', tag: 'product' },
  { id: 2, text: 'Follow up with design team', tag: 'team' },
]

export default function App() {
  const [notes, setNotes] = useState(seed)
  const [text, setText] = useState('')
  const [tag, setTag] = useState('product')

  const tags = useMemo(() => Array.from(new Set(notes.map(n => n.tag))), [notes])

  const addNote = () => {
    if (!text.trim()) return
    setNotes([{ id: Date.now(), text, tag }, ...notes])
    setText('')
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <h1>Notes</h1>
      <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a note"
          style={{ flex: 1, padding: '0.6rem', borderRadius: 8, border: '1px solid #e2e8f0' }}
        />
        <select value={tag} onChange={(e) => setTag(e.target.value)}>
          {['product', 'team', 'ideas'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button onClick={addNote} style={{ padding: '0.6rem 1rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8 }}>Add</button>
      </div>
      <div style={{ display: 'grid', gap: '0.8rem' }}>
        {notes.map(note => (
          <div key={note.id} style={{ border: '1px solid #e2e8f0', padding: '0.8rem', borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>{note.tag}</div>
            <div>{note.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
`,
          language: 'typescript',
        },
      ],
      activeFile: 'src/App.tsx',
      settings: defaultSettings,
    },
  },
  {
    id: 'react-stopwatch',
    name: 'React Stopwatch',
    description: 'Timer with laps',
    icon: 'react',
    workspace: {
      version: 2,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "react-stopwatch",
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
          name: 'src/main.tsx',
          content: `import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)` ,
          language: 'typescript',
        },
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Stopwatch</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'src/App.tsx',
          content: `import { useEffect, useState } from 'react'

export default function App() {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [laps, setLaps] = useState<number[]>([])

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setElapsed((t) => t + 10), 10)
    return () => clearInterval(timer)
  }, [running])

  const reset = () => {
    setElapsed(0)
    setLaps([])
    setRunning(false)
  }

  const lap = () => {
    if (!running) return
    setLaps([elapsed, ...laps])
  }

  const format = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const centis = Math.floor((ms % 1000) / 10)
    return minutes + ':' + seconds.toString().padStart(2, '0') + '.' + centis.toString().padStart(2, '0')
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: '2rem', maxWidth: 560, margin: '0 auto' }}>
      <h1>Stopwatch</h1>
      <div style={{ fontSize: '2.5rem', margin: '1rem 0' }}>{format(elapsed)}</div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={() => setRunning(!running)} style={{ padding: '0.6rem 1rem' }}>{running ? 'Pause' : 'Start'}</button>
        <button onClick={lap} style={{ padding: '0.6rem 1rem' }}>Lap</button>
        <button onClick={reset} style={{ padding: '0.6rem 1rem' }}>Reset</button>
      </div>
      <div style={{ marginTop: '1.5rem', color: '#64748b' }}>
        {laps.map((l, i) => (
          <div key={i}>Lap {laps.length - i}: {format(l)}</div>
        ))}
      </div>
    </div>
  )
}
`,
          language: 'typescript',
        },
      ],
      activeFile: 'src/App.tsx',
      settings: defaultSettings,
    },
  },
]

