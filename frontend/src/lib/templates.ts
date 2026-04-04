import { Workspace } from '../types/workspace'

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  category: 'react' | 'preact' | 'vue' | 'svelte' | 'solid' | 'interactive' | 'layout' | 'data' | 'python' | 'typescript' | 'starter'
  featured?: boolean
  workspace: Workspace
}

const defaultSettings = { theme: 'dark' as const, fontSize: 14, tabSize: 2, wordWrap: true, minimap: true, lineNumbers: true }

export const TEMPLATES: Template[] = [
  {
    id: 'react-counter',
    name: 'React Counter',
    description: 'Stateful counter using React hooks',
    icon: 'react',
    category: 'react',
    featured: true,
    workspace: {
      version: 2,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "react-counter",
  "private": true,
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
          language: 'json',
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
    description: 'Task manager with add, complete, and filter',
    icon: 'react',
    category: 'react',
    featured: true,
    workspace: {
      version: 2,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "react-todo",
  "private": true,
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
          language: 'json',
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
    description: 'Spring animations with Framer Motion',
    icon: 'animation',
    category: 'react',
    workspace: {
      version: 2,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "react-framer",
  "private": true,
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.16.0"
  }
}`,
          language: 'json',
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
    description: 'Mouse-reactive particle system on canvas',
    icon: 'particle',
    category: 'interactive',
    featured: true,
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
    description: 'Developer portfolio with projects grid',
    icon: 'portfolio',
    category: 'layout',
    featured: true,
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
    description: 'Clean React + TypeScript starter',
    icon: 'react',
    category: 'starter',
    featured: true,
    workspace: {
      version: 2,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "my-react-app",
  "private": true,
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
          language: 'json',
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
    description: 'Minimal HTML/CSS/JS boilerplate',
    icon: 'file',
    category: 'starter',
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
    description: 'Three-tier pricing table with toggle',
    icon: 'portfolio',
    category: 'layout',
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
    description: 'Landing page with hero, features, and CTA',
    icon: 'portfolio',
    category: 'layout',
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
    description: 'Markdown documentation template',
    icon: 'file',
    category: 'layout',
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
    description: 'Frosted glass login form with blur effects',
    icon: 'portfolio',
    category: 'layout',
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
    description: 'Analytics dashboard with metric cards',
    icon: 'chart',
    category: 'data',
    featured: true,
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
    description: 'Four-function calculator with keyboard input',
    icon: 'file',
    category: 'interactive',
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
    description: 'Three-column task board with add and remove',
    icon: 'file',
    category: 'interactive',
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
    description: 'Weather card with API fetch pattern',
    icon: 'weather',
    category: 'data',
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
    description: 'Hover and click animation showcase',
    icon: 'animation',
    category: 'layout',
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
    description: 'Blog post layout with sidebar navigation',
    icon: 'portfolio',
    category: 'layout',
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
    description: 'Product hero with statistics bar',
    icon: 'portfolio',
    category: 'layout',
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
    description: 'Audio player interface with controls',
    icon: 'file',
    category: 'interactive',
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
    description: 'Tagged notes with search and filter',
    icon: 'react',
    category: 'react',
    workspace: {
      version: 2,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "react-notes",
  "private": true,
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
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
    description: 'Stopwatch with lap tracking',
    icon: 'timer',
    category: 'react',
    workspace: {
      version: 2,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "react-stopwatch",
  "private": true,
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
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
  {
    id: 'python-basics',
    name: 'Python Basics',
    description: 'Functions, classes, and data structures',
    icon: 'file',
    category: 'python',
    featured: true,
    workspace: {
      version: 2,
      files: [
        {
          name: 'main.py',
          content: `"""
Python Basics - Functions, Classes, and Data Structures
========================================================
A guided tour of core Python patterns with clear output.
"""

from utils import format_table

# ---------------------------------------------------------------------------
# 1. Functions & f-string formatting
# ---------------------------------------------------------------------------

def greet(name: str, greeting: str = "Hello") -> str:
    """Return a personalised greeting using an f-string."""
    return f"{greeting}, {name}! Welcome to Python."

# Call our greeting function
print(greet("Alice"))
print(greet("Bob", greeting="Hey"))
print()

# ---------------------------------------------------------------------------
# 2. A simple Task class
# ---------------------------------------------------------------------------

class Task:
    """Represents a to-do item with a title, priority, and done flag."""

    def __init__(self, title: str, priority: int = 3):
        self.title = title
        self.priority = priority  # 1 = highest, 5 = lowest
        self.done = False

    def complete(self) -> None:
        """Mark the task as done."""
        self.done = True

    def __repr__(self) -> str:
        status = "done" if self.done else "pending"
        return f"Task({self.title!r}, priority={self.priority}, {status})"

# Create a handful of tasks
tasks = [
    Task("Write unit tests", priority=1),
    Task("Update README", priority=2),
    Task("Refactor auth module", priority=2),
    Task("Add dark mode", priority=3),
    Task("Fix typo on homepage", priority=4),
]

# Mark a couple as done
tasks[0].complete()
tasks[4].complete()

print("All tasks:")
for t in tasks:
    print(f"  {t}")
print()

# ---------------------------------------------------------------------------
# 3. List comprehensions
# ---------------------------------------------------------------------------

# Filter to only pending tasks, sorted by priority
pending = sorted(
    [t for t in tasks if not t.done],
    key=lambda t: t.priority,
)
print("Pending tasks (by priority):")
for t in pending:
    print(f"  [{t.priority}] {t.title}")
print()

# ---------------------------------------------------------------------------
# 4. Dictionary operations
# ---------------------------------------------------------------------------

# Group tasks by their status
groups: dict[str, list[str]] = {"done": [], "pending": []}
for t in tasks:
    key = "done" if t.done else "pending"
    groups[key].append(t.title)

print("Grouped by status:")
for status, titles in groups.items():
    print(f"  {status}: {', '.join(titles)}")
print()

# ---------------------------------------------------------------------------
# 5. Using our utility - format_table
# ---------------------------------------------------------------------------

headers = ["Task", "Priority", "Status"]
rows = [
    [t.title, str(t.priority), "done" if t.done else "pending"]
    for t in tasks
]

print("Task summary table:")
format_table(headers, rows)
`,
          language: 'python',
        },
        {
          name: 'utils.py',
          content: `"""
utils.py - Small helper utilities
"""


def format_table(headers: list[str], rows: list[list[str]]) -> None:
    """Print a nicely formatted ASCII table.

    Args:
        headers: Column header strings.
        rows:    A list of rows, each row being a list of cell strings.

    Example output:
        +------------------+----------+--------+
        | Task             | Priority | Status |
        +------------------+----------+--------+
        | Write unit tests | 1        | done   |
        | Update README    | 2        | pending|
        +------------------+----------+--------+
    """
    # Determine the max width for each column
    all_rows = [headers] + rows
    col_widths = [
        max(len(str(cell)) for cell in col)
        for col in zip(*all_rows)
    ]

    def make_separator() -> str:
        return "+" + "+".join("-" * (w + 2) for w in col_widths) + "+"

    def make_row(cells: list[str]) -> str:
        padded = [
            " " + str(cell).ljust(w) + " "
            for cell, w in zip(cells, col_widths)
        ]
        return "|" + "|".join(padded) + "|"

    sep = make_separator()
    print(sep)
    print(make_row(headers))
    print(sep)
    for row in rows:
        print(make_row(row))
    print(sep)
`,
          language: 'python',
        },
      ],
      activeFile: 'main.py',
      settings: defaultSettings,
    },
  },
  {
    id: 'python-data',
    name: 'Python Data',
    description: 'Statistics and data processing',
    icon: 'chart',
    category: 'python',
    workspace: {
      version: 2,
      files: [
        {
          name: 'main.py',
          content: `"""
Python Data - Statistics & Data Processing
============================================
Analyse a sample dataset of student scores using only the standard library.
"""

import statistics
import json
from collections import Counter

# ---------------------------------------------------------------------------
# Sample dataset - each dict represents one student's test result
# ---------------------------------------------------------------------------

students = [
    {"name": "Alice",   "score": 92, "grade": "A"},
    {"name": "Bob",     "score": 78, "grade": "B"},
    {"name": "Charlie", "score": 85, "grade": "B"},
    {"name": "Diana",   "score": 96, "grade": "A"},
    {"name": "Eve",     "score": 73, "grade": "C"},
    {"name": "Frank",   "score": 88, "grade": "B"},
    {"name": "Grace",   "score": 91, "grade": "A"},
    {"name": "Hank",    "score": 67, "grade": "D"},
    {"name": "Ivy",     "score": 82, "grade": "B"},
    {"name": "Jack",    "score": 95, "grade": "A"},
    {"name": "Karen",   "score": 74, "grade": "C"},
    {"name": "Leo",     "score": 88, "grade": "B"},
]

scores = [s["score"] for s in students]

# ---------------------------------------------------------------------------
# 1. Descriptive statistics
# ---------------------------------------------------------------------------

print("=" * 50)
print("  STUDENT SCORE ANALYSIS")
print("=" * 50)
print()

print(f"  Students enrolled : {len(students)}")
print(f"  Mean score        : {statistics.mean(scores):.1f}")
print(f"  Median score      : {statistics.median(scores):.1f}")
print(f"  Mode score        : {statistics.mode(scores)}")
print(f"  Std deviation     : {statistics.stdev(scores):.2f}")
print(f"  Highest score     : {max(scores)}")
print(f"  Lowest score      : {min(scores)}")
print(f"  Range             : {max(scores) - min(scores)}")
print()

# ---------------------------------------------------------------------------
# 2. Grade distribution using Counter
# ---------------------------------------------------------------------------

grade_counts = Counter(s["grade"] for s in students)

print("-" * 50)
print("  GRADE DISTRIBUTION")
print("-" * 50)
print()

for grade in sorted(grade_counts):
    count = grade_counts[grade]
    bar = "#" * (count * 3)
    pct = count / len(students) * 100
    print(f"  Grade {grade} : {bar} {count} ({pct:.0f}%)")
print()

# ---------------------------------------------------------------------------
# 3. Students grouped by grade
# ---------------------------------------------------------------------------

print("-" * 50)
print("  STUDENTS BY GRADE")
print("-" * 50)
print()

groups: dict[str, list[str]] = {}
for s in students:
    groups.setdefault(s["grade"], []).append(s["name"])

for grade in sorted(groups):
    names = ", ".join(groups[grade])
    avg = statistics.mean(
        s["score"] for s in students if s["grade"] == grade
    )
    print(f"  {grade}: {names}")
    print(f"     Average: {avg:.1f}")
    print()

# ---------------------------------------------------------------------------
# 4. Top performers
# ---------------------------------------------------------------------------

print("-" * 50)
print("  TOP 5 PERFORMERS")
print("-" * 50)
print()

ranked = sorted(students, key=lambda s: s["score"], reverse=True)
for i, s in enumerate(ranked[:5], start=1):
    print(f"  {i}. {s['name']:<10} {s['score']}  ({s['grade']})")
print()

# ---------------------------------------------------------------------------
# 5. Serialise results to JSON (common data-processing pattern)
# ---------------------------------------------------------------------------

summary = {
    "total_students": len(students),
    "mean": round(statistics.mean(scores), 2),
    "median": statistics.median(scores),
    "grade_distribution": dict(grade_counts),
}

print("-" * 50)
print("  JSON SUMMARY")
print("-" * 50)
print()
print(json.dumps(summary, indent=2))
`,
          language: 'python',
        },
      ],
      activeFile: 'main.py',
      settings: defaultSettings,
    },
  },
  {
    id: 'snake-game',
    name: 'Snake Game',
    description: 'Classic snake with canvas controls',
    icon: 'game',
    category: 'interactive',
    featured: true,
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
  <title>Snake Game</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="wrapper">
    <div class="hud">
      <span id="score">Score: 0</span>
      <span id="high">Best: 0</span>
    </div>
    <canvas id="game" width="400" height="400"></canvas>
    <p id="message">Press any arrow key to start</p>
  </div>
  <script src="game.js"></script>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

* { box-sizing: border-box; margin: 0; }

body {
  height: 100vh;
  display: grid;
  place-items: center;
  background: #0b0b12;
  font-family: 'Press Start 2P', monospace;
  color: #e2e8f0;
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.hud {
  width: 400px;
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #94a3b8;
}

canvas {
  border: 2px solid #1e293b;
  border-radius: 8px;
  background: #111827;
}

#message {
  font-size: 0.65rem;
  color: #64748b;
  min-height: 1.4em;
  text-align: center;
}
`,
          language: 'css',
        },
        {
          name: 'game.js',
          content: `/**
 * Snake Game - Canvas Implementation
 * -----------------------------------
 * Arrow keys to move, eat food to grow, avoid walls and yourself.
 * Press Space to restart after game over.
 */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highEl = document.getElementById('high');
const messageEl = document.getElementById('message');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CELL = 20;                        // size of each grid cell in px
const COLS = canvas.width / CELL;       // 20
const ROWS = canvas.height / CELL;      // 20
const TICK_MS = 100;                    // ms between game ticks

// Colours
const BG        = '#111827';
const SNAKE_CLR = '#22d3ee';
const HEAD_CLR  = '#06b6d4';
const FOOD_CLR  = '#f43f5e';
const GRID_CLR  = '#1a2233';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let snake, dir, nextDir, food, score, highScore, running, gameOver, lastTick;

highScore = parseInt(localStorage.getItem('snake-high') || '0', 10);
highEl.textContent = 'Best: ' + highScore;

/** Initialise / reset the game state. */
function init() {
  const midY = Math.floor(ROWS / 2);
  snake = [
    { x: 5, y: midY },
    { x: 4, y: midY },
    { x: 3, y: midY },
  ];
  dir = { x: 1, y: 0 };
  nextDir = { ...dir };
  score = 0;
  running = false;
  gameOver = false;
  lastTick = 0;
  scoreEl.textContent = 'Score: 0';
  messageEl.textContent = 'Press any arrow key to start';
  placeFood();
  draw();
}

// ---------------------------------------------------------------------------
// Food placement
// ---------------------------------------------------------------------------

/** Place food on a random empty cell. */
function placeFood() {
  const occupied = new Set(snake.map(s => s.x + ',' + s.y));
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (occupied.has(pos.x + ',' + pos.y));
  food = pos;
}

// ---------------------------------------------------------------------------
// Input handling
// ---------------------------------------------------------------------------

const KEY_MAP = {
  ArrowUp:    { x:  0, y: -1 },
  ArrowDown:  { x:  0, y:  1 },
  ArrowLeft:  { x: -1, y:  0 },
  ArrowRight: { x:  1, y:  0 },
};

document.addEventListener('keydown', (e) => {
  // Restart on Space after game over
  if (e.code === 'Space' && gameOver) {
    init();
    return;
  }

  const newDir = KEY_MAP[e.key];
  if (!newDir) return;
  e.preventDefault();

  // Prevent reversing into yourself
  if (newDir.x === -dir.x && newDir.y === -dir.y) return;

  nextDir = newDir;

  // Start the game on first arrow press
  if (!running && !gameOver) {
    running = true;
    messageEl.textContent = '';
    lastTick = performance.now();
    requestAnimationFrame(loop);
  }
});

// ---------------------------------------------------------------------------
// Game loop
// ---------------------------------------------------------------------------

function loop(now) {
  if (!running) return;

  if (now - lastTick >= TICK_MS) {
    lastTick = now;
    update();
    draw();
  }

  if (running) {
    requestAnimationFrame(loop);
  }
}

/** Advance the game by one tick. */
function update() {
  dir = { ...nextDir };

  const head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y,
  };

  // Wall collision
  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    return endGame();
  }

  // Self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    return endGame();
  }

  snake.unshift(head);

  // Check food
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = 'Score: ' + score;
    placeFood();
  } else {
    snake.pop();   // remove tail unless we just ate
  }
}

function endGame() {
  running = false;
  gameOver = true;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snake-high', String(highScore));
    highEl.textContent = 'Best: ' + highScore;
  }
  messageEl.textContent = 'Game Over! Press Space to restart';
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function draw() {
  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid lines (subtle)
  ctx.strokeStyle = GRID_CLR;
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL, 0);
    ctx.lineTo(x * CELL, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL);
    ctx.lineTo(canvas.width, y * CELL);
    ctx.stroke();
  }

  // Food (pulsing glow)
  const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 200);
  ctx.shadowColor = FOOD_CLR;
  ctx.shadowBlur = 12 * pulse;
  ctx.fillStyle = FOOD_CLR;
  ctx.beginPath();
  ctx.arc(
    food.x * CELL + CELL / 2,
    food.y * CELL + CELL / 2,
    CELL / 2 - 2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;

  // Snake body
  snake.forEach((seg, i) => {
    const isHead = i === 0;
    ctx.fillStyle = isHead ? HEAD_CLR : SNAKE_CLR;
    const pad = isHead ? 1 : 2;
    ctx.beginPath();
    ctx.roundRect(
      seg.x * CELL + pad,
      seg.y * CELL + pad,
      CELL - pad * 2,
      CELL - pad * 2,
      4,
    );
    ctx.fill();
  });
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

init();
`,
          language: 'javascript',
        },
      ],
      activeFile: 'game.js',
      settings: defaultSettings,
    },
  },
  {
    id: 'typescript-utils',
    name: 'TypeScript Playground',
    description: 'Generics, types, and utility functions',
    icon: 'typescript',
    category: 'typescript',
    workspace: {
      version: 2,
      files: [
        {
          name: 'main.ts',
          content: `/**
 * TypeScript Playground - Generics, Types & Utility Functions
 * ============================================================
 * All code here is valid when types are stripped (no enums, no
 * parameter properties, no namespaces). Run it as plain JS too!
 */

// ---------------------------------------------------------------------------
// 1. Result<T, E> - a simple discriminated union for error handling
// ---------------------------------------------------------------------------

type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Parse a string to a positive integer, returning a Result. */
function parsePositiveInt(input: string): Result<number, string> {
  const n = Number(input);
  if (!Number.isInteger(n)) return err(\`"\${input}" is not an integer\`);
  if (n <= 0) return err(\`\${n} is not positive\`);
  return ok(n);
}

// Demonstrate Result usage
const tests = ["42", "-3", "hello", "7"];
console.log("=== Result<T, E> ===");
for (const t of tests) {
  const result = parsePositiveInt(t);
  if (result.ok) {
    console.log(\`  parsePositiveInt("\${t}") => \${result.value}\`);
  } else {
    console.log(\`  parsePositiveInt("\${t}") => ERROR: \${result.error}\`);
  }
}
console.log();

// ---------------------------------------------------------------------------
// 2. Generic Stack<T> class
// ---------------------------------------------------------------------------

class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  toArray(): T[] {
    return [...this.items];
  }
}

console.log("=== Stack<T> ===");
const numStack = new Stack<number>();
numStack.push(10);
numStack.push(20);
numStack.push(30);
console.log("  Stack contents:", numStack.toArray());
console.log("  Peek:", numStack.peek());
console.log("  Pop:", numStack.pop());
console.log("  After pop:", numStack.toArray());
console.log();

// ---------------------------------------------------------------------------
// 3. Union types & type guards
// ---------------------------------------------------------------------------

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return 0.5 * shape.base * shape.height;
  }
}

/** Type guard - narrows unknown to Shape. */
function isShape(value: unknown): value is Shape {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return v.kind === "circle" || v.kind === "rectangle" || v.kind === "triangle";
}

const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "rectangle", width: 4, height: 6 },
  { kind: "triangle", base: 3, height: 8 },
];

console.log("=== Union Types & Type Guards ===");
for (const s of shapes) {
  console.log(\`  \${s.kind} => area = \${area(s).toFixed(2)}\`);
}

// Demonstrate the type guard
const mystery: unknown = { kind: "circle", radius: 10 };
if (isShape(mystery)) {
  console.log(\`  Type guard passed: area = \${area(mystery).toFixed(2)}\`);
}
console.log();

// ---------------------------------------------------------------------------
// 4. Mapped types & utility types
// ---------------------------------------------------------------------------

interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

/** Make every property optional and readonly (like a patch DTO). */
type ReadonlyPartial<T> = {
  readonly [K in keyof T]?: T[K];
};

/** Pick only string-valued keys from a type. */
type StringKeys<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

// Demonstrate mapped types (compile-time only - show the shapes via objects)
const userPatch: ReadonlyPartial<User> = { name: "Alice" };
const userStrings: StringKeys<User> = { name: "Alice", email: "alice@example.com" };

console.log("=== Mapped Types ===");
console.log("  ReadonlyPartial<User> patch:", userPatch);
console.log("  StringKeys<User>:", userStrings);
console.log();

// ---------------------------------------------------------------------------
// 5. Generic utility functions
// ---------------------------------------------------------------------------

/** Group an array by a key-selector function. */
function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) result[key] = [];
    result[key].push(item);
  }
  return result;
}

/** Deduplicate an array, preserving order. */
function unique<T>(items: T[], keyFn: (item: T) => unknown = (x) => x): T[] {
  const seen = new Set<unknown>();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const people = [
  { name: "Alice", dept: "eng" },
  { name: "Bob", dept: "design" },
  { name: "Charlie", dept: "eng" },
  { name: "Diana", dept: "design" },
  { name: "Eve", dept: "eng" },
];

console.log("=== Generic Utilities ===");
console.log("  groupBy dept:", groupBy(people, (p) => p.dept));
console.log("  unique depts:", unique(people.map((p) => p.dept)));
`,
          language: 'typescript',
        },
      ],
      activeFile: 'main.ts',
      settings: defaultSettings,
    },
  },
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Multi-field form with live validation',
    icon: 'file',
    category: 'interactive',
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
  <title>Contact Form</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="card">
    <h1>Get in Touch</h1>
    <p class="subtitle">We'd love to hear from you. Fill out the form below.</p>

    <form id="contactForm" novalidate>
      <div class="field">
        <label for="name">Full Name</label>
        <input type="text" id="name" placeholder="Jane Doe" autocomplete="name" />
        <span class="error" id="nameError"></span>
      </div>

      <div class="field">
        <label for="email">Email Address</label>
        <input type="email" id="email" placeholder="jane@example.com" autocomplete="email" />
        <span class="error" id="emailError"></span>
      </div>

      <div class="field">
        <label for="subject">Subject</label>
        <select id="subject">
          <option value="">Choose a topic...</option>
          <option value="general">General inquiry</option>
          <option value="support">Technical support</option>
          <option value="billing">Billing question</option>
          <option value="feedback">Feedback</option>
        </select>
        <span class="error" id="subjectError"></span>
      </div>

      <div class="field">
        <label for="message">Message</label>
        <textarea id="message" rows="4" placeholder="Tell us what's on your mind..."></textarea>
        <span class="error" id="messageError"></span>
        <span class="char-count" id="charCount">0 / 500</span>
      </div>

      <button type="submit" id="submitBtn">Send Message</button>
    </form>

    <!-- Success overlay -->
    <div class="success-overlay" id="successOverlay">
      <div class="checkmark">&#10003;</div>
      <h2>Message Sent!</h2>
      <p>We'll get back to you within 24 hours.</p>
      <button id="resetBtn">Send Another</button>
    </div>
  </div>

  <script src="form.js"></script>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `* { box-sizing: border-box; margin: 0; }

body {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0b0b12;
  font-family: system-ui, -apple-system, sans-serif;
  color: #e2e8f0;
  padding: 2rem;
}

/* Card container */
.card {
  position: relative;
  width: min(480px, 100%);
  background: #111827;
  border-radius: 1.25rem;
  padding: 2.5rem;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1.75rem;
}

/* Form fields */
.field {
  margin-bottom: 1.25rem;
  position: relative;
}

label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

input, textarea, select {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 2px solid #1e293b;
  background: #0f172a;
  color: #f1f5f9;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

input:focus, textarea:focus, select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
}

/* Validation states */
input.valid, textarea.valid, select.valid {
  border-color: #22c55e;
}

input.invalid, textarea.invalid, select.invalid {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.error {
  display: block;
  font-size: 0.78rem;
  color: #ef4444;
  margin-top: 0.3rem;
  min-height: 1.2em;
  transition: opacity 0.2s;
}

.char-count {
  display: block;
  font-size: 0.75rem;
  color: #475569;
  text-align: right;
  margin-top: 0.25rem;
}

.char-count.warn {
  color: #f59e0b;
}

.char-count.over {
  color: #ef4444;
}

/* Select arrow */
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M1.5 5.5l6.5 6 6.5-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

select option {
  background: #0f172a;
  color: #f1f5f9;
}

/* Submit button */
button[type="submit"] {
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.2s;
  margin-top: 0.5rem;
}

button[type="submit"]:hover {
  transform: translateY(-1px);
}

button[type="submit"]:active {
  transform: translateY(0);
}

button[type="submit"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Success overlay */
.success-overlay {
  position: absolute;
  inset: 0;
  background: #111827;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s;
}

.success-overlay.visible {
  opacity: 1;
  pointer-events: auto;
}

.checkmark {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #22c55e;
  display: grid;
  place-items: center;
  font-size: 2rem;
  color: white;
  animation: pop 0.4s ease;
}

@keyframes pop {
  0% { transform: scale(0); }
  70% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.success-overlay h2 {
  font-size: 1.3rem;
}

.success-overlay p {
  color: #94a3b8;
  font-size: 0.9rem;
}

#resetBtn {
  margin-top: 0.75rem;
  padding: 0.6rem 1.5rem;
  border: 2px solid #6366f1;
  border-radius: 0.75rem;
  background: transparent;
  color: #6366f1;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

#resetBtn:hover {
  background: #6366f1;
  color: white;
}

/* Textarea resize */
textarea {
  resize: vertical;
  min-height: 100px;
}
`,
          language: 'css',
        },
        {
          name: 'form.js',
          content: `/**
 * Contact Form - Real-time Validation
 * ------------------------------------
 * Validates fields as the user types and on submit.
 * Simulates a network request before showing a success state.
 */

// ---------------------------------------------------------------------------
// DOM references
// ---------------------------------------------------------------------------
const form        = document.getElementById('contactForm');
const nameInput   = document.getElementById('name');
const emailInput  = document.getElementById('email');
const subjectSel  = document.getElementById('subject');
const messageArea = document.getElementById('message');
const charCount   = document.getElementById('charCount');
const submitBtn   = document.getElementById('submitBtn');
const successEl   = document.getElementById('successOverlay');
const resetBtn    = document.getElementById('resetBtn');

const MAX_MSG = 500;

// ---------------------------------------------------------------------------
// Validation rules
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/;

const validators = {
  name: (v) => {
    if (!v.trim()) return 'Name is required';
    if (v.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  },
  email: (v) => {
    if (!v.trim()) return 'Email is required';
    if (!EMAIL_RE.test(v)) return 'Please enter a valid email address';
    return '';
  },
  subject: (v) => {
    if (!v) return 'Please choose a subject';
    return '';
  },
  message: (v) => {
    if (!v.trim()) return 'Message is required';
    if (v.trim().length < 10) return 'Message must be at least 10 characters';
    if (v.length > MAX_MSG) return 'Message is too long';
    return '';
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Show or clear an error for a field. Returns true if valid. */
function validateField(input, name) {
  const errorEl = document.getElementById(name + 'Error');
  const msg = validators[name](input.value);
  errorEl.textContent = msg;

  input.classList.toggle('invalid', !!msg);
  input.classList.toggle('valid', !msg && input.value.length > 0);
  return !msg;
}

/** Check all fields and return true if the form is valid. */
function validateAll() {
  const a = validateField(nameInput, 'name');
  const b = validateField(emailInput, 'email');
  const c = validateField(subjectSel, 'subject');
  const d = validateField(messageArea, 'message');
  return a && b && c && d;
}

// ---------------------------------------------------------------------------
// Real-time validation (on input / change)
// ---------------------------------------------------------------------------

nameInput.addEventListener('input', () => validateField(nameInput, 'name'));
emailInput.addEventListener('input', () => validateField(emailInput, 'email'));
subjectSel.addEventListener('change', () => validateField(subjectSel, 'subject'));

messageArea.addEventListener('input', () => {
  validateField(messageArea, 'message');

  // Character counter
  const len = messageArea.value.length;
  charCount.textContent = len + ' / ' + MAX_MSG;
  charCount.classList.toggle('warn', len > MAX_MSG * 0.8 && len <= MAX_MSG);
  charCount.classList.toggle('over', len > MAX_MSG);
});

// ---------------------------------------------------------------------------
// Submit handler
// ---------------------------------------------------------------------------

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validateAll()) return;

  // Disable button and show loading state
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  // Simulate a network request (1.2 s delay)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Show success overlay
  successEl.classList.add('visible');
  submitBtn.disabled = false;
  submitBtn.textContent = 'Send Message';
});

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------

resetBtn.addEventListener('click', () => {
  form.reset();
  successEl.classList.remove('visible');

  // Clear validation classes
  [nameInput, emailInput, subjectSel, messageArea].forEach((el) => {
    el.classList.remove('valid', 'invalid');
  });
  document.querySelectorAll('.error').forEach((el) => (el.textContent = ''));
  charCount.textContent = '0 / ' + MAX_MSG;
  charCount.classList.remove('warn', 'over');
});
`,
          language: 'javascript',
        },
      ],
      activeFile: 'form.js',
      settings: defaultSettings,
    },
  },
  {
    id: 'react-quiz',
    name: 'React Quiz',
    description: 'Multi-step quiz with score tracking',
    icon: 'react',
    category: 'react',
    workspace: {
      version: 2,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "react-quiz",
  "private": true,
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`,
          language: 'json',
        },
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Web Dev Quiz</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`,
          language: 'html',
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

/**
 * React Quiz - Web Development Trivia
 * ====================================
 * 5 multiple-choice questions, progress bar, answer highlighting,
 * and a final score screen with restart.
 */

// ---------------------------------------------------------------------------
// Question data
// ---------------------------------------------------------------------------

interface Question {
  question: string
  options: string[]
  correct: number // index of the correct option
}

const QUESTIONS: Question[] = [
  {
    question: 'What does CSS stand for?',
    options: [
      'Creative Style Sheets',
      'Cascading Style Sheets',
      'Computer Style Sheets',
      'Colorful Style Sheets',
    ],
    correct: 1,
  },
  {
    question: 'Which hook is used for side effects in React?',
    options: ['useMemo', 'useRef', 'useEffect', 'useCallback'],
    correct: 2,
  },
  {
    question: 'What does the "DOM" stand for?',
    options: [
      'Document Object Model',
      'Digital Ordinance Map',
      'Document Oriented Markup',
      'Data Object Model',
    ],
    correct: 0,
  },
  {
    question: 'Which HTTP method is idempotent?',
    options: ['POST', 'PATCH', 'PUT', 'CONNECT'],
    correct: 2,
  },
  {
    question: 'What is the default position value in CSS?',
    options: ['relative', 'absolute', 'fixed', 'static'],
    correct: 3,
  },
]

// ---------------------------------------------------------------------------
// Styles (inline for portability)
// ---------------------------------------------------------------------------

const styles = {
  wrapper: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: '#0b0b12',
    color: '#e2e8f0',
    padding: '2rem',
  } as React.CSSProperties,
  card: {
    width: 'min(520px, 100%)',
    background: '#111827',
    borderRadius: '1.25rem',
    padding: '2rem 2.5rem',
    boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
  } as React.CSSProperties,
  progressTrack: {
    height: 6,
    borderRadius: 3,
    background: '#1e293b',
    marginBottom: '1.5rem',
    overflow: 'hidden',
  } as React.CSSProperties,
  progressBar: (pct: number) =>
    ({
      height: '100%',
      width: pct + '%',
      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
      borderRadius: 3,
      transition: 'width 0.4s ease',
    }) as React.CSSProperties,
  meta: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  question: {
    fontSize: '1.15rem',
    fontWeight: 600,
    marginBottom: '1.25rem',
    lineHeight: 1.4,
  } as React.CSSProperties,
  option: (state: 'idle' | 'correct' | 'wrong' | 'dimmed') => {
    const base: React.CSSProperties = {
      display: 'block',
      width: '100%',
      textAlign: 'left' as const,
      padding: '0.85rem 1rem',
      marginBottom: '0.6rem',
      borderRadius: '0.75rem',
      border: '2px solid #1e293b',
      background: '#0f172a',
      color: '#e2e8f0',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }
    if (state === 'correct') {
      base.border = '2px solid #22c55e'
      base.background = 'rgba(34,197,94,0.12)'
      base.color = '#4ade80'
    }
    if (state === 'wrong') {
      base.border = '2px solid #ef4444'
      base.background = 'rgba(239,68,68,0.12)'
      base.color = '#f87171'
    }
    if (state === 'dimmed') {
      base.opacity = 0.45
      base.cursor = 'default'
    }
    return base
  },
  nextBtn: {
    marginTop: '1rem',
    padding: '0.7rem 1.4rem',
    borderRadius: '0.75rem',
    border: 'none',
    background: '#6366f1',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'grid',
    placeItems: 'center',
    margin: '1rem auto',
  } as React.CSSProperties,
  scoreText: {
    fontSize: '2rem',
    fontWeight: 700,
  } as React.CSSProperties,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function App() {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const total = QUESTIONS.length
  const q = QUESTIONS[current]
  const answered = selected !== null

  /** Handle clicking an answer option. */
  function handleSelect(idx: number) {
    if (answered) return
    setSelected(idx)
    if (idx === q.correct) setScore((s) => s + 1)
  }

  /** Advance to the next question or show final score. */
  function handleNext() {
    if (current + 1 >= total) {
      setFinished(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  /** Restart the quiz from scratch. */
  function handleRestart() {
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  /** Get the visual state for an option button. */
  function optionState(idx: number): 'idle' | 'correct' | 'wrong' | 'dimmed' {
    if (!answered) return 'idle'
    if (idx === q.correct) return 'correct'
    if (idx === selected) return 'wrong'
    return 'dimmed'
  }

  // -------------------------------------------------------------------------
  // Final score screen
  // -------------------------------------------------------------------------
  if (finished) {
    const pct = Math.round((score / total) * 100)
    const message =
      pct === 100
        ? 'Perfect score!'
        : pct >= 60
          ? 'Great job!'
          : 'Keep learning!'

    return (
      <div style={styles.wrapper}>
        <div style={{ ...styles.card, textAlign: 'center' as const }}>
          <h2 style={{ marginBottom: '0.25rem' }}>Quiz Complete</h2>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>{message}</p>
          <div style={styles.scoreCircle}>
            <span style={styles.scoreText}>
              {score}/{total}
            </span>
          </div>
          <p style={{ color: '#64748b', margin: '1rem 0' }}>
            You scored {pct}%
          </p>
          <button style={styles.nextBtn} onClick={handleRestart}>
            Play Again
          </button>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Question screen
  // -------------------------------------------------------------------------
  const progress = ((current + (answered ? 1 : 0)) / total) * 100

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div style={styles.progressBar(progress)} />
        </div>

        {/* Meta */}
        <p style={styles.meta}>
          Question {current + 1} of {total}
        </p>

        {/* Question text */}
        <h2 style={styles.question}>{q.question}</h2>

        {/* Options */}
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            style={styles.option(optionState(idx))}
            onClick={() => handleSelect(idx)}
          >
            {opt}
          </button>
        ))}

        {/* Next / Finish button */}
        {answered && (
          <button style={styles.nextBtn} onClick={handleNext}>
            {current + 1 >= total ? 'See Results' : 'Next Question'}
          </button>
        )}
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
    id: 'bar-chart',
    name: 'Bar Chart',
    description: 'Interactive bar chart with pure CSS and JS',
    icon: 'chart',
    category: 'data',
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
  <title>Bar Chart</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="container">
    <header>
      <h1>Monthly Revenue</h1>
      <p class="subtitle">2025 fiscal year - click a bar to highlight</p>
    </header>

    <div class="chart-wrapper">
      <div class="y-axis" id="yAxis"></div>
      <div class="chart" id="chart"></div>
    </div>

    <div class="legend" id="legend"></div>

    <!-- Tooltip (positioned absolutely) -->
    <div class="tooltip" id="tooltip"></div>
  </div>

  <script src="chart.js"></script>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `* { box-sizing: border-box; margin: 0; }

body {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0b0b12;
  font-family: system-ui, -apple-system, sans-serif;
  color: #e2e8f0;
  padding: 2rem;
}

.container {
  width: min(680px, 100%);
  background: #111827;
  border-radius: 1.25rem;
  padding: 2rem 2.5rem 2rem;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  position: relative;
}

header { margin-bottom: 1.5rem; }
h1 { font-size: 1.3rem; }
.subtitle { color: #64748b; font-size: 0.85rem; margin-top: 0.25rem; }

/* Chart layout */
.chart-wrapper {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 0.25rem;
  height: 260px;
  margin-bottom: 1rem;
}

/* Y-axis labels */
.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding: 4px 8px 24px 0;
  font-size: 0.72rem;
  color: #475569;
}

/* Bar area */
.chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  border-bottom: 2px solid #1e293b;
  border-left: 2px solid #1e293b;
  padding: 0 6px;
  position: relative;
}

/* Individual bar column */
.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  cursor: pointer;
}

.bar {
  width: 100%;
  border-radius: 6px 6px 0 0;
  transition: height 0.6s cubic-bezier(0.22, 1, 0.36, 1),
              background 0.25s,
              box-shadow 0.25s;
  min-width: 20px;
  position: relative;
}

/* Default gradient */
.bar { background: linear-gradient(180deg, #818cf8, #6366f1); }

/* Highlighted state */
.bar.highlighted {
  background: linear-gradient(180deg, #c084fc, #8b5cf6);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
}

/* Dimmed when another bar is highlighted */
.bar.dimmed {
  opacity: 0.35;
}

/* Bar label (month) */
.bar-label {
  font-size: 0.7rem;
  color: #64748b;
  margin-top: 6px;
  text-align: center;
}

/* Legend */
.legend {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
  font-size: 0.78rem;
  color: #94a3b8;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

/* Tooltip */
.tooltip {
  position: absolute;
  pointer-events: none;
  background: #1e293b;
  color: #f1f5f9;
  font-size: 0.82rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.15s;
  white-space: nowrap;
  z-index: 10;
}

.tooltip.visible {
  opacity: 1;
}

.tooltip strong {
  color: #a5b4fc;
}
`,
          language: 'css',
        },
        {
          name: 'chart.js',
          content: `/**
 * Bar Chart - Interactive Revenue Visualisation
 * -----------------------------------------------
 * Renders animated bars from data, hover tooltips, click-to-highlight.
 */

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const DATA = [
  { month: 'Jan', value: 12400, color: '#818cf8' },
  { month: 'Feb', value: 15800, color: '#818cf8' },
  { month: 'Mar', value: 14200, color: '#818cf8' },
  { month: 'Apr', value: 18600, color: '#818cf8' },
  { month: 'May', value: 22100, color: '#818cf8' },
  { month: 'Jun', value: 19800, color: '#818cf8' },
  { month: 'Jul', value: 24500, color: '#a78bfa' },
  { month: 'Aug', value: 27300, color: '#a78bfa' },
  { month: 'Sep', value: 23100, color: '#a78bfa' },
  { month: 'Oct', value: 29800, color: '#c084fc' },
  { month: 'Nov', value: 31200, color: '#c084fc' },
  { month: 'Dec', value: 35000, color: '#c084fc' },
];

// ---------------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------------

const chartEl   = document.getElementById('chart');
const yAxisEl   = document.getElementById('yAxis');
const legendEl  = document.getElementById('legend');
const tooltipEl = document.getElementById('tooltip');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const maxVal = Math.max(...DATA.map((d) => d.value));

/** Round up to a nice ceiling for the Y axis. */
function niceCeiling(n) {
  const magnitude = Math.pow(10, Math.floor(Math.log10(n)));
  return Math.ceil(n / magnitude) * magnitude;
}

const ceiling = niceCeiling(maxVal);

function formatCurrency(n) {
  return '$' + n.toLocaleString('en-US');
}

// ---------------------------------------------------------------------------
// Y-axis labels
// ---------------------------------------------------------------------------

const Y_TICKS = 5;
for (let i = Y_TICKS; i >= 0; i--) {
  const label = document.createElement('span');
  const val = Math.round((ceiling / Y_TICKS) * i);
  label.textContent = val >= 1000 ? (val / 1000).toFixed(0) + 'k' : String(val);
  yAxisEl.appendChild(label);
}

// ---------------------------------------------------------------------------
// Render bars
// ---------------------------------------------------------------------------

let highlightedIndex = null;
const barEls = [];

DATA.forEach((d, i) => {
  const col = document.createElement('div');
  col.className = 'bar-col';

  const bar = document.createElement('div');
  bar.className = 'bar';
  bar.style.height = '0%'; // start at 0 for animation
  bar.style.background = 'linear-gradient(180deg, ' + d.color + ', #6366f1)';

  const label = document.createElement('span');
  label.className = 'bar-label';
  label.textContent = d.month;

  col.appendChild(bar);
  col.appendChild(label);
  chartEl.appendChild(col);
  barEls.push(bar);

  // --- Hover: show tooltip ---
  col.addEventListener('mouseenter', (e) => {
    tooltipEl.innerHTML =
      '<strong>' + d.month + '</strong><br>' + formatCurrency(d.value);
    tooltipEl.classList.add('visible');
  });

  col.addEventListener('mousemove', (e) => {
    const rect = document.querySelector('.container').getBoundingClientRect();
    tooltipEl.style.left = e.clientX - rect.left + 12 + 'px';
    tooltipEl.style.top = e.clientY - rect.top - 40 + 'px';
  });

  col.addEventListener('mouseleave', () => {
    tooltipEl.classList.remove('visible');
  });

  // --- Click: highlight / toggle ---
  col.addEventListener('click', () => {
    if (highlightedIndex === i) {
      // Un-highlight
      highlightedIndex = null;
      barEls.forEach((b) => {
        b.classList.remove('highlighted', 'dimmed');
      });
    } else {
      highlightedIndex = i;
      barEls.forEach((b, j) => {
        b.classList.toggle('highlighted', j === i);
        b.classList.toggle('dimmed', j !== i);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// Animated entrance - stagger the bars growing in
// ---------------------------------------------------------------------------

requestAnimationFrame(() => {
  barEls.forEach((bar, i) => {
    const pct = (DATA[i].value / ceiling) * 100;
    setTimeout(() => {
      bar.style.height = pct + '%';
    }, i * 60);
  });
});

// ---------------------------------------------------------------------------
// Legend (group by quarter based on colour)
// ---------------------------------------------------------------------------

const quarters = [
  { label: 'Q1-Q2', color: '#818cf8' },
  { label: 'Q3',    color: '#a78bfa' },
  { label: 'Q4',    color: '#c084fc' },
];

quarters.forEach((q) => {
  const item = document.createElement('div');
  item.className = 'legend-item';

  const dot = document.createElement('span');
  dot.className = 'legend-dot';
  dot.style.background = q.color;

  const text = document.createElement('span');
  text.textContent = q.label;

  item.appendChild(dot);
  item.appendChild(text);
  legendEl.appendChild(item);
});
`,
          language: 'javascript',
        },
      ],
      activeFile: 'chart.js',
      settings: defaultSettings,
    },
  },
  {
    id: 'preact-counter',
    name: 'Preact Counter',
    description: 'Lightweight counter with Preact signals',
    icon: 'react',
    category: 'preact',
    workspace: {
      version: 2,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "preact-counter",
  "private": true,
  "type": "module",
  "dependencies": {
    "preact": "^10.19.0"
  }
}`,
          language: 'json',
        },
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Preact Counter</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
          language: 'html',
        },
        {
          name: 'src/main.tsx',
          content: `import { render } from 'preact'
import App from './App'

render(<App />, document.getElementById('root')!)`,
          language: 'typescript',
        },
        {
          name: 'src/App.tsx',
          content: `import { useState } from 'preact/hooks'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0f',
      fontFamily: 'system-ui, sans-serif',
      color: 'white',
    }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#a78bfa' }}>
        Preact Counter
      </h1>
      <div style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        {count}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={() => setCount(count - 1)}
          style={{
            padding: '0.5rem 1.5rem',
            fontSize: '1.1rem',
            border: 'none',
            borderRadius: '0.5rem',
            background: '#8b5cf6',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          -
        </button>
        <button
          onClick={() => setCount(0)}
          style={{
            padding: '0.5rem 1.5rem',
            fontSize: '1.1rem',
            border: 'none',
            borderRadius: '0.5rem',
            background: '#8b5cf6',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
        <button
          onClick={() => setCount(count + 1)}
          style={{
            padding: '0.5rem 1.5rem',
            fontSize: '1.1rem',
            border: 'none',
            borderRadius: '0.5rem',
            background: '#8b5cf6',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          +
        </button>
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
    id: 'vue-counter',
    name: 'Vue Counter',
    description: 'Reactive counter with Vue 3 Composition API',
    icon: 'file',
    category: 'vue',
    workspace: {
      version: 2,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "vue-counter",
  "private": true,
  "type": "module",
  "dependencies": {
    "vue": "^3.4.0"
  }
}`,
          language: 'json',
        },
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue Counter</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>`,
          language: 'html',
        },
        {
          name: 'src/main.tsx',
          content: `import { createApp } from 'vue'
import App from './App'

createApp(App).mount('#app')`,
          language: 'typescript',
        },
        {
          name: 'src/App.tsx',
          content: `import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'App',
  setup() {
    const count = ref(0)

    const increment = () => { count.value++ }
    const decrement = () => { count.value-- }
    const reset = () => { count.value = 0 }

    return () => (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f',
        fontFamily: 'system-ui, sans-serif',
        color: 'white',
      }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#a78bfa' }}>
          Vue Counter
        </h1>
        <div style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '2rem' }}>
          {count.value}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={decrement}
            style={{
              padding: '0.5rem 1.5rem',
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: '0.5rem',
              background: '#8b5cf6',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            -
          </button>
          <button
            onClick={reset}
            style={{
              padding: '0.5rem 1.5rem',
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: '0.5rem',
              background: '#8b5cf6',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
          <button
            onClick={increment}
            style={{
              padding: '0.5rem 1.5rem',
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: '0.5rem',
              background: '#8b5cf6',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            +
          </button>
        </div>
      </div>
    )
  },
})`,
          language: 'typescript',
        },
      ],
      activeFile: 'src/App.tsx',
      settings: defaultSettings,
    },
  },
  {
    id: 'svelte-counter',
    name: 'Svelte Counter',
    description: 'Compiled counter with Svelte reactivity',
    icon: 'file',
    category: 'svelte',
    workspace: {
      version: 2,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "svelte-counter",
  "private": true,
  "type": "module",
  "dependencies": {
    "svelte": "^4.2.0"
  }
}`,
          language: 'json',
        },
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Svelte Counter</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
          language: 'html',
        },
        {
          name: 'src/main.js',
          content: `import App from './App.svelte'

const app = new App({ target: document.getElementById('root') })

export default app`,
          language: 'javascript',
        },
        {
          name: 'src/App.svelte',
          content: `<script>
  let count = 0
  function increment() { count += 1 }
  function decrement() { count -= 1 }
  function reset() { count = 0 }
</script>

<div class="container">
  <h1>Svelte Counter</h1>
  <div class="count">{count}</div>
  <div class="buttons">
    <button on:click={decrement}>-</button>
    <button on:click={reset}>Reset</button>
    <button on:click={increment}>+</button>
  </div>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #0a0a0f;
    color: white;
  }
  h1 {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    color: #a78bfa;
  }
  .count {
    font-size: 4rem;
    font-weight: bold;
    margin-bottom: 2rem;
  }
  .buttons {
    display: flex;
    gap: 0.75rem;
  }
  button {
    padding: 0.5rem 1.5rem;
    font-size: 1.1rem;
    border: none;
    border-radius: 0.5rem;
    background: #8b5cf6;
    color: white;
    cursor: pointer;
    transition: background 0.2s;
  }
  button:hover {
    background: #a78bfa;
  }
</style>`,
          language: 'html',
        },
      ],
      activeFile: 'src/App.svelte',
      settings: defaultSettings,
    },
  },
  {
    id: 'solid-counter',
    name: 'Solid Counter',
    description: 'Fine-grained reactive counter with Solid',
    icon: 'file',
    category: 'solid',
    workspace: {
      version: 2,
      files: [
        {
          name: 'package.json',
          content: `{
  "name": "solid-counter",
  "private": true,
  "type": "module",
  "dependencies": {
    "solid-js": "^1.8.0"
  }
}`,
          language: 'json',
        },
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Solid Counter</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
          language: 'html',
        },
        {
          name: 'src/main.tsx',
          content: `import { render } from 'solid-js/web'
import App from './App'

render(() => <App />, document.getElementById('root')!)`,
          language: 'typescript',
        },
        {
          name: 'src/App.tsx',
          content: `import { createSignal } from 'solid-js'

export default function App() {
  const [count, setCount] = createSignal(0)

  return (
    <div style={{
      'min-height': '100vh',
      display: 'flex',
      'flex-direction': 'column',
      'align-items': 'center',
      'justify-content': 'center',
      background: '#0a0a0f',
      'font-family': 'system-ui, sans-serif',
      color: 'white',
    }}>
      <h1 style={{ 'font-size': '1.5rem', 'margin-bottom': '2rem', color: '#a78bfa' }}>
        Solid Counter
      </h1>
      <div style={{ 'font-size': '4rem', 'font-weight': 'bold', 'margin-bottom': '2rem' }}>
        {count()}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={() => setCount(c => c - 1)}
          style={{
            padding: '0.5rem 1.5rem',
            'font-size': '1.1rem',
            border: 'none',
            'border-radius': '0.5rem',
            background: '#8b5cf6',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          -
        </button>
        <button
          onClick={() => setCount(0)}
          style={{
            padding: '0.5rem 1.5rem',
            'font-size': '1.1rem',
            border: 'none',
            'border-radius': '0.5rem',
            background: '#8b5cf6',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
        <button
          onClick={() => setCount(c => c + 1)}
          style={{
            padding: '0.5rem 1.5rem',
            'font-size': '1.1rem',
            border: 'none',
            'border-radius': '0.5rem',
            background: '#8b5cf6',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          +
        </button>
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
]
