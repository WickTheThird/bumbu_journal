import { Workspace } from '../types/workspace'

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  workspace: Workspace
}

export const templates: Template[] = [
  {
    id: 'canvas-game',
    name: 'Bouncing Ball Game',
    description: 'Interactive canvas animation with physics',
    icon: 'canvas',
    workspace: {
      version: 1,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html>
<head>
  <title>Bouncing Balls</title>
  <style>
    body { margin: 0; background: #1a1a2e; overflow: hidden; }
    canvas { display: block; }
    #score { position: fixed; top: 20px; left: 20px; color: #fff; font: 20px monospace; }
  </style>
</head>
<body>
  <div id="score">Click to add balls!</div>
  <canvas id="canvas"></canvas>
  <script src="game.js"></script>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'game.js',
          content: `// Bouncing Balls with Physics
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const balls = [];
const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#a29bfe'];

class Ball {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 30 + 10;
    this.dx = (Math.random() - 0.5) * 8;
    this.dy = (Math.random() - 0.5) * 8;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.gravity = 0.2;
    this.friction = 0.99;
    this.bounce = 0.8;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    
    // Add glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  update() {
    // Gravity
    this.dy += this.gravity;
    
    // Friction
    this.dx *= this.friction;
    this.dy *= this.friction;

    // Bounce off walls
    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
      this.dx = -this.dx * this.bounce;
      this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
    }
    if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
      this.dy = -this.dy * this.bounce;
      this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
    }

    this.x += this.dx;
    this.y += this.dy;
    this.draw();
  }
}

// Add initial balls
for (let i = 0; i < 5; i++) {
  balls.push(new Ball(Math.random() * canvas.width, Math.random() * canvas.height / 2));
}

// Click to add balls
canvas.addEventListener('click', (e) => {
  balls.push(new Ball(e.clientX, e.clientY));
  document.getElementById('score').textContent = \`Balls: \${balls.length}\`;
});

function animate() {
  ctx.fillStyle = 'rgba(26, 26, 46, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  balls.forEach(ball => ball.update());
  requestAnimationFrame(animate);
}

animate();`,
          language: 'javascript',
        },
      ],
      activeFile: 'game.js',
      settings: { theme: 'dark', fontSize: 14, tabSize: 2, wordWrap: true, minimap: true, lineNumbers: true },
    },
  },
  {
    id: 'python-algo',
    name: 'Algorithm Visualizer',
    description: 'Sorting algorithms with step-by-step output',
    icon: 'chart',
    workspace: {
      version: 1,
      files: [
        {
          name: 'sort_viz.py',
          content: `# Sorting Algorithm Visualizer
# Watch algorithms work step by step!

import time

def visualize(arr, highlight=None, label=""):
    """Print array with visual bars"""
    max_val = max(arr) if arr else 1
    print(f"\\n{label}")
    for i, val in enumerate(arr):
        bar = "█" * (val * 40 // max_val)
        marker = " ◄" if highlight and i in highlight else ""
        print(f"{val:3d} |{bar}{marker}")
    print("-" * 50)

def bubble_sort(arr):
    """Bubble Sort - O(n²)"""
    arr = arr.copy()
    n = len(arr)
    print("\\n🫧 BUBBLE SORT")
    print("Repeatedly swap adjacent elements if wrong order")
    
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                visualize(arr, {j, j+1}, f"Swapped {arr[j+1]} ↔ {arr[j]}")
    return arr

def quick_sort(arr, depth=0):
    """Quick Sort - O(n log n) average"""
    if len(arr) <= 1:
        return arr
    
    if depth == 0:
        print("\\n⚡ QUICK SORT")
        print("Pick pivot, partition around it, recurse")
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    indent = "  " * depth
    print(f"{indent}Pivot={pivot}: [{left}] [{middle}] [{right}]")
    
    return quick_sort(left, depth+1) + middle + quick_sort(right, depth+1)

# Demo
data = [64, 34, 25, 12, 22, 11, 90, 45]
print("Original array:")
visualize(data, label="Starting array")

print("\\n" + "="*50)
sorted_bubble = bubble_sort(data.copy())

print("\\n" + "="*50)
sorted_quick = quick_sort(data.copy())
visualize(sorted_quick, label="Quick Sort Result")
`,
          language: 'python',
        },
      ],
      activeFile: 'sort_viz.py',
      settings: { theme: 'dark', fontSize: 14, tabSize: 4, wordWrap: true, minimap: true, lineNumbers: true },
    },
  },
  {
    id: 'js-particles',
    name: 'Particle System',
    description: 'Beautiful particle animation with mouse interaction',
    icon: 'particle',
    workspace: {
      version: 1,
      files: [
        {
          name: 'index.html',
          content: `<!DOCTYPE html>
<html>
<head>
  <title>Particle System</title>
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
          content: `// Particle System - Move your mouse!
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
const particles = [];
const particleCount = 100;

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
    this.color = \`hsl(\${Math.random() * 60 + 200}, 100%, 50%)\`;
  }

  update() {
    // Move toward mouse
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 200) {
      const force = (200 - distance) / 200;
      this.speedX += dx / distance * force * 0.5;
      this.speedY += dy / distance * force * 0.5;
    }

    // Apply velocity with damping
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedX *= 0.98;
    this.speedY *= 0.98;

    // Wrap around edges
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

// Connect nearby particles with lines
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

// Initialize
for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

canvas.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  connectParticles();
  
  requestAnimationFrame(animate);
}

animate();
console.log('Move your mouse to attract particles!');`,
          language: 'javascript',
        },
      ],
      activeFile: 'particles.js',
      settings: { theme: 'dark', fontSize: 14, tabSize: 2, wordWrap: true, minimap: true, lineNumbers: true },
    },
  },
  {
    id: 'python-api',
    name: 'REST API Pattern',
    description: 'Modern Python API structure with type hints',
    icon: 'api',
    workspace: {
      version: 1,
      files: [
        {
          name: 'api.py',
          content: `# Modern Python REST API Pattern
# Clean architecture with type hints

from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class Status(Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"

@dataclass
class User:
    id: int
    email: str
    name: str
    created_at: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "created_at": self.created_at.isoformat()
        }

@dataclass  
class Task:
    id: int
    title: str
    user_id: int
    status: Status = Status.PENDING
    description: Optional[str] = None

class TaskRepository:
    """In-memory repository for demo"""
    def __init__(self):
        self._tasks: dict[int, Task] = {}
        self._counter = 0
    
    def create(self, title: str, user_id: int, description: str = None) -> Task:
        self._counter += 1
        task = Task(
            id=self._counter,
            title=title,
            user_id=user_id,
            description=description
        )
        self._tasks[task.id] = task
        return task
    
    def find_by_user(self, user_id: int) -> List[Task]:
        return [t for t in self._tasks.values() if t.user_id == user_id]
    
    def update_status(self, task_id: int, status: Status) -> Optional[Task]:
        if task := self._tasks.get(task_id):
            task.status = status
            return task
        return None

# Demo
print("🔌 REST API Pattern Demo\\n")

repo = TaskRepository()
user = User(id=1, email="dev@hashide.com", name="Developer")

print(f"User: {user.to_dict()}\\n")

# Create tasks
tasks = [
    repo.create("Build API", user.id, "Design REST endpoints"),
    repo.create("Write tests", user.id),
    repo.create("Deploy", user.id, "Push to production"),
]

print("Created tasks:")
for task in tasks:
    print(f"  [{task.status.value}] {task.title}")

# Update status
repo.update_status(1, Status.COMPLETED)
repo.update_status(2, Status.ACTIVE)

print("\\nAfter updates:")
for task in repo.find_by_user(user.id):
    emoji = {"pending": "⏳", "active": "🔄", "completed": "✅"}
    print(f"  {emoji[task.status.value]} {task.title}")
`,
          language: 'python',
        },
      ],
      activeFile: 'api.py',
      settings: { theme: 'dark', fontSize: 14, tabSize: 4, wordWrap: true, minimap: true, lineNumbers: true },
    },
  },
  {
    id: 'web-portfolio',
    name: 'Portfolio Template',
    description: 'Minimal portfolio with smooth animations',
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
      <p>
        I'm a developer passionate about creating elegant solutions 
        to complex problems. With expertise in React, Node.js, and 
        Python, I build scalable applications that users love.
      </p>
    </section>

    <section id="work" class="section">
      <h2>Work</h2>
      <div class="projects">
        <div class="project-card">
          <h3>Project Alpha</h3>
          <p>A real-time collaboration platform</p>
          <div class="tags">
            <span>React</span><span>Socket.io</span><span>Node</span>
          </div>
        </div>
        <div class="project-card">
          <h3>Project Beta</h3>
          <p>ML-powered analytics dashboard</p>
          <div class="tags">
            <span>Python</span><span>TensorFlow</span><span>D3.js</span>
          </div>
        </div>
      </div>
    </section>

    <section id="contact" class="section">
      <h2>Get in Touch</h2>
      <p>Have a project in mind? Let's talk.</p>
      <a href="mailto:hello@johndoe.dev" class="btn">Say Hello</a>
    </section>
  </main>

  <footer>
    <p>© 2024 John Doe. Built with ☕</p>
  </footer>
</body>
</html>`,
          language: 'html',
        },
        {
          name: 'style.css',
          content: `/* Minimal Portfolio Styles */
:root {
  --bg: #0a0a0a;
  --text: #ffffff;
  --accent: #7c3aed;
  --muted: #888;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', system-ui, sans-serif;
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
  align-items: center;
  backdrop-filter: blur(10px);
  z-index: 100;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
}

.nav-links a {
  color: var(--muted);
  text-decoration: none;
  margin-left: 2rem;
  transition: color 0.3s;
}

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

.subtitle {
  font-size: 1.5rem;
  color: var(--accent);
  margin: 0.5rem 0;
}

.tagline {
  font-size: 1.2rem;
  color: var(--muted);
}

.section {
  padding: 6rem 0;
  max-width: 800px;
}

.section h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--accent);
}

.projects { display: grid; gap: 1.5rem; }

.project-card {
  padding: 2rem;
  border: 1px solid #222;
  border-radius: 1rem;
  transition: all 0.3s;
}

.project-card:hover {
  border-color: var(--accent);
  transform: translateY(-5px);
}

.project-card h3 { margin-bottom: 0.5rem; }
.project-card p { color: var(--muted); }

.tags {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.tags span {
  padding: 0.25rem 0.75rem;
  background: #1a1a1a;
  border-radius: 2rem;
  font-size: 0.8rem;
  color: var(--muted);
}

.btn {
  display: inline-block;
  padding: 1rem 2rem;
  background: var(--accent);
  color: var(--text);
  text-decoration: none;
  border-radius: 0.5rem;
  margin-top: 1rem;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(124, 58, 237, 0.3);
}

footer {
  padding: 2rem 5%;
  text-align: center;
  color: var(--muted);
  border-top: 1px solid #222;
}`,
          language: 'css',
        },
      ],
      activeFile: 'index.html',
      settings: { theme: 'dark', fontSize: 14, tabSize: 2, wordWrap: true, minimap: true, lineNumbers: true },
    },
  },
  {
    id: 'python-game',
    name: 'ASCII Game',
    description: 'Text-based dungeon crawler',
    icon: 'game',
    workspace: {
      version: 1,
      files: [
        {
          name: 'dungeon.py',
          content: `# ASCII Dungeon Crawler
# A mini text-based adventure!

import random

class Player:
    def __init__(self, name):
        self.name = name
        self.hp = 100
        self.attack = 15
        self.gold = 0
        self.level = 1
        
    def __str__(self):
        return f"⚔️ {self.name} | ❤️ {self.hp} | 💰 {self.gold} | Lv.{self.level}"

class Monster:
    TYPES = [
        ("🐀 Rat", 20, 5, 10),
        ("🦇 Bat", 30, 8, 15),
        ("💀 Skeleton", 50, 12, 25),
        ("🐉 Dragon", 100, 20, 100),
    ]
    
    def __init__(self, level):
        idx = min(level - 1, len(self.TYPES) - 1)
        name, hp, atk, gold = self.TYPES[idx]
        self.name = name
        self.hp = hp + level * 5
        self.attack = atk + level
        self.gold = gold + level * 5

def battle(player, monster):
    print(f"\\n⚔️ BATTLE: {player.name} vs {monster.name}!")
    print("=" * 40)
    
    while player.hp > 0 and monster.hp > 0:
        # Player attacks
        dmg = random.randint(player.attack - 5, player.attack + 5)
        monster.hp -= dmg
        print(f"You deal {dmg} damage! {monster.name}: {max(0, monster.hp)} HP")
        
        if monster.hp <= 0:
            print(f"\\n🎉 Victory! Gained {monster.gold} gold!")
            player.gold += monster.gold
            player.level += 1
            player.hp = min(100, player.hp + 20)
            return True
            
        # Monster attacks
        dmg = random.randint(monster.attack - 3, monster.attack + 3)
        player.hp -= dmg
        print(f"{monster.name} deals {dmg} damage! You: {max(0, player.hp)} HP")
        
    print("\\n💀 Game Over!")
    return False

def explore(player):
    events = [
        ("🏺 Found a health potion!", lambda p: setattr(p, 'hp', min(100, p.hp + 30))),
        ("💎 Discovered treasure!", lambda p: setattr(p, 'gold', p.gold + 50)),
        ("🗡️ Found a better weapon!", lambda p: setattr(p, 'attack', p.attack + 5)),
        ("👹 Monster appears!", None),
    ]
    
    event = random.choice(events)
    print(f"\\n{event[0]}")
    
    if event[1]:
        event[1](player)
    else:
        monster = Monster(player.level)
        battle(player, monster)

# Game Loop
print("=" * 40)
print("   🏰 ASCII DUNGEON CRAWLER 🏰")
print("=" * 40)

player = Player("Hero")
print(f"\\nWelcome, {player.name}!")

for turn in range(1, 6):
    print(f"\\n--- Turn {turn} ---")
    print(player)
    explore(player)
    
    if player.hp <= 0:
        break

print("\\n" + "=" * 40)
print(f"FINAL SCORE: {player.gold} gold, Level {player.level}")
print("=" * 40)
`,
          language: 'python',
        },
      ],
      activeFile: 'dungeon.py',
      settings: { theme: 'dark', fontSize: 14, tabSize: 4, wordWrap: true, minimap: true, lineNumbers: true },
    },
  },
  {
    id: 'blank',
    name: 'Blank Workspace',
    description: 'Start from scratch',
    icon: 'file',
    workspace: {
      version: 1,
      files: [
        {
          name: 'main.py',
          content: '# Start coding here\n',
          language: 'python',
        },
      ],
      activeFile: 'main.py',
      settings: { theme: 'dark', fontSize: 14, tabSize: 2, wordWrap: true, minimap: true, lineNumbers: true },
    },
  },
]
