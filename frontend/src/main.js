import './style.css'

const WICK_LOGO = `<span class="logo-main">██╗    ██╗ ██╗  ██████╗ ██╗  ██╗
██║    ██║ ██║ ██╔════╝ ██║ ██╔╝
██║ █╗ ██║ ██║ ██║      █████╔╝ 
██║███╗██║ ██║ ██║      ██╔═██╗ 
╚███╔███╔╝ ██║ ╚██████╗ ██║  ██╗
 ╚══╝╚══╝  ╚═╝  ╚═════╝ ╚═╝  ╚═╝</span>
<span class="drip">  ║│        │    ║║         │ ║</span>
<span class="drip">  ║│        │    ║║         │ ║</span>
<span class="drip">  │         │     ║           │</span>
<span class="drip">  │         │     ║           │</span>
<span class="drip">            ╵     ╵            </span>`

// Profile data
const PROFILE = {
  name: 'Filip Bumbu',
  alias: 'WickTheThird',
  title: 'Full Stack Developer & Freelancer',
  location: 'Ireland 🇮🇪',
  email: 'contact@filipbumbu.dev',
  github: 'https://github.com/WickTheThird',
  linkedin: 'https://www.linkedin.com/in/filip-bumbu-410741262/',
  status: 'Available for hire ✓'
}

// Projects - will be fetched from GitHub
let projects = []

const SKILLS = [
  { category: 'Languages', items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++'] },
  { category: 'Frontend', items: ['React', 'Vue', 'Tailwind', 'HTML/CSS'] },
  { category: 'Backend', items: ['FastAPI', 'Node.js', 'Express', 'Django'] },
  { category: 'Database', items: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'] },
  { category: 'DevOps', items: ['Docker', 'Jenkins', 'Kubernetes', 'AWS'] },
  { category: 'Monitoring', items: ['Grafana', 'Prometheus', 'Datadog'] },
  { category: 'Tools', items: ['Git', 'Linux', 'Kafka', 'RabbitMQ'] }
]

// Commands
const commands = {
  help: () => {
    return `
<span class="cyan">Available Commands:</span>

  <span class="green">about</span>          Who am I? My story and profile
  <span class="green">skills</span>         Technical skills & expertise
  <span class="green">proj</span>           List my GitHub projects
  <span class="green">open</span> <span class="dim">[name]</span>   Open a project (e.g., open bumbu_journal)
  <span class="green">contact</span>        Ways to reach me
  <span class="green">social</span>         Social media links
  <span class="green">hire</span>           Freelance availability & rates
  <span class="green">whoami</span>         Quick intro
  <span class="green">clear</span>          Clear the terminal
  <span class="green">help</span>           Show this message

<span class="dim">Tip: Click on any link to open it!</span>
`
  },

  about: () => {
    return `
<span class="cyan">┌─────────────────────────────────────────────────────────┐</span>
<span class="cyan">│</span>  <span class="green">About Me</span>                                              <span class="cyan">│</span>
<span class="cyan">└─────────────────────────────────────────────────────────┘</span>

  Hey! I'm <span class="green">${PROFILE.name}</span>, aka <span class="cyan">${PROFILE.alias}</span>.

  I'm a passionate <span class="yellow">${PROFILE.title}</span> based in ${PROFILE.location}.
  
  I love building things that live on the internet — whether 
  that's websites, applications, or anything in between.
  
  When I'm not coding, you'll find me exploring new technologies,
  contributing to open source, or hunting for the perfect cup 
  of coffee ☕

  <span class="dim">Currently:</span> <span class="green">${PROFILE.status}</span>

<span class="dim">  Type 'skills' to see my tech stack, or 'contact' to reach out!</span>
`
  },

  whoami: () => {
    return `
<span class="green">${PROFILE.name}</span> <span class="dim">(@${PROFILE.alias})</span>
${PROFILE.title}
📍 ${PROFILE.location}
<span class="green">${PROFILE.status}</span>
`
  },

  skills: () => {
    let output = `
<span class="cyan">┌─────────────────────────────────────────────────────────┐</span>
<span class="cyan">│</span>  <span class="green">Technical Skills</span>                                      <span class="cyan">│</span>
<span class="cyan">└─────────────────────────────────────────────────────────┘</span>
`
    SKILLS.forEach(skill => {
      output += `
  <span class="yellow">${skill.category}</span>
  <span class="dim">└─</span> ${skill.items.map(i => `<span class="white">${i}</span>`).join(' • ')}
`
    })
    output += `
<span class="dim">  ...and always learning more!</span>
`
    return output
  },

  proj: async () => {
    if (projects.length === 0) {
      addOutput('<span class="dim">Fetching projects from GitHub...</span>')
      try {
        const res = await fetch('https://api.github.com/users/WickTheThird/repos?sort=updated&per_page=10')
        projects = await res.json()
      } catch (e) {
        return '<span class="red">Error fetching projects. Try again later.</span>'
      }
    }
    
    let output = `
<span class="cyan">┌─────────────────────────────────────────────────────────┐</span>
<span class="cyan">│</span>  <span class="green">GitHub Projects</span>                                       <span class="cyan">│</span>
<span class="cyan">└─────────────────────────────────────────────────────────┘</span>
`
    projects.forEach((p, i) => {
      const stars = p.stargazers_count > 0 ? ` ⭐ ${p.stargazers_count}` : ''
      const lang = p.language ? `<span class="yellow">[${p.language}]</span>` : ''
      output += `
  <span class="green">${String(i + 1).padStart(2, '0')}.</span> <a href="${p.html_url}" target="_blank" class="project-link">${p.name}</a> ${lang}${stars}
      <span class="dim">${p.description || 'No description'}</span>
`
    })
    output += `
<span class="dim">  Type 'open [name]' to visit a project</span>
`
    return output
  },

  ls: () => commands.proj(),

  open: (args) => {
    const name = args.join(' ').toLowerCase()
    if (!name) {
      return '<span class="yellow">Usage: open [project-name]</span>'
    }
    const project = projects.find(p => p.name.toLowerCase().includes(name))
    if (project) {
      window.open(project.html_url, '_blank')
      return `<span class="green">Opening ${project.name}...</span>`
    }
    // Try direct GitHub URL
    window.open(`https://github.com/WickTheThird/${name}`, '_blank')
    return `<span class="green">Opening github.com/WickTheThird/${name}...</span>`
  },

  contact: () => {
    return `
<span class="cyan">┌─────────────────────────────────────────────────────────┐</span>
<span class="cyan">│</span>  <span class="green">Get In Touch</span>                                          <span class="cyan">│</span>
<span class="cyan">└─────────────────────────────────────────────────────────┘</span>

  <span class="yellow">📧 Email</span>
     <a href="mailto:${PROFILE.email}" class="link">${PROFILE.email}</a>

  <span class="yellow">💼 LinkedIn</span>
     <a href="${PROFILE.linkedin}" target="_blank" class="link">linkedin.com/in/filip-bumbu</a>

  <span class="yellow">🐙 GitHub</span>
     <a href="${PROFILE.github}" target="_blank" class="link">github.com/WickTheThird</a>

<span class="dim">  I typically respond within 24 hours!</span>
`
  },

  social: () => {
    return `
<span class="cyan">Social Links</span>

  <span class="white">GitHub</span>     <a href="${PROFILE.github}" target="_blank" class="link">github.com/WickTheThird</a>
  <span class="white">LinkedIn</span>   <a href="${PROFILE.linkedin}" target="_blank" class="link">linkedin.com/in/filip-bumbu</a>

<span class="dim">  Click any link to open!</span>
`
  },

  hire: () => {
    return `
<span class="cyan">┌─────────────────────────────────────────────────────────┐</span>
<span class="cyan">│</span>  <span class="green">🚀 Hire Me</span>                                            <span class="cyan">│</span>
<span class="cyan">└─────────────────────────────────────────────────────────┘</span>

  <span class="green">Status:</span> ${PROFILE.status}

  <span class="yellow">What I Can Do For You:</span>
  
  • Full-stack web development
  • Custom web applications
  • API design & development
  • Database architecture
  • Code review & consulting
  • Bug fixes & maintenance

  <span class="yellow">Let's Work Together:</span>
  
  📧 <a href="mailto:${PROFILE.email}" class="link">${PROFILE.email}</a>
  💼 <a href="${PROFILE.linkedin}" target="_blank" class="link">Connect on LinkedIn</a>

<span class="dim">  Serious inquiries only. Let's build something great!</span>
`
  },

  clear: () => {
    output.innerHTML = ''
    return null
  },

  github: () => {
    window.open(PROFILE.github, '_blank')
    return '<span class="green">Opening GitHub profile...</span>'
  },

  linkedin: () => {
    window.open(PROFILE.linkedin, '_blank')
    return '<span class="green">Opening LinkedIn profile...</span>'
  },

  echo: (args) => args.join(' '),
  
  date: () => new Date().toLocaleString(),
  
  pwd: () => '/home/wick',
  
  neofetch: () => {
    return `
<span class="cyan">${PROFILE.alias}</span>@<span class="cyan">portfolio</span>
──────────────────────
<span class="yellow">OS:</span> WickOS v3.0
<span class="yellow">Host:</span> GitHub Pages
<span class="yellow">Shell:</span> wick-terminal
<span class="yellow">Theme:</span> Neon Graffiti
<span class="yellow">Status:</span> <span class="green">${PROFILE.status}</span>
`
  }
}

// Welcome message
const welcomeLines = [
  '',
  '<span class="ascii-logo">' + WICK_LOGO + '</span>',
  '',
  '<span class="dim">────────────────────────────────────────────────────────────</span>',
  '',
  `  <span class="green">WICK TERMINAL</span> <span class="dim">v3.0.0</span>  <span class="yellow">│</span>  <span class="white">${PROFILE.name}</span>  <span class="yellow">│</span>  <span class="dim">${PROFILE.title}</span>`,
  '',
  `  <span class="green">${PROFILE.status}</span>`,
  '',
  '<span class="dim">────────────────────────────────────────────────────────────</span>',
  '',
  '  <span class="yellow">⚡</span> Type <span class="green">help</span> to see available commands',
  '  <span class="yellow">⚡</span> Type <span class="green">about</span> to learn more about me',
  '  <span class="yellow">⚡</span> Type <span class="green">proj</span> to see my work',
  '',
]

// DOM setup
document.querySelector('#app').innerHTML = `
  <div class="terminal-container">
    <div class="scanlines"></div>
    
    <div class="terminal-window">
      <div class="terminal-header">
        <div class="terminal-buttons">
          <span class="btn-close"></span>
          <span class="btn-minimize"></span>
          <span class="btn-maximize"></span>
        </div>
        <div class="terminal-title">wick@portfolio ~ </div>
        <div class="terminal-status">
          <span class="status-dot"></span>
          <span>online</span>
        </div>
      </div>
      
      <div class="terminal-body" id="terminal">
        <div class="output" id="output"></div>
        
        <div class="input-line">
          <span class="prompt">wick@portfolio:~$</span>
          <input type="text" class="command-input" id="commandInput" autofocus spellcheck="false" autocomplete="off" />
        </div>
      </div>
    </div>
  </div>
`

const output = document.getElementById('output')
const input = document.getElementById('commandInput')
const terminal = document.getElementById('terminal')

// Helper to add output
function addOutput(html) {
  const line = document.createElement('div')
  line.className = 'output-line'
  line.innerHTML = html
  output.appendChild(line)
  terminal.scrollTop = terminal.scrollHeight
}

// Type welcome message
let lineIndex = 0
function typeWelcome() {
  if (lineIndex < welcomeLines.length) {
    addOutput(welcomeLines[lineIndex])
    lineIndex++
    setTimeout(typeWelcome, 25)
  }
}
typeWelcome()

// Command history
const history = []
let historyIndex = -1

// Handle input
input.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    const cmdLine = input.value.trim()
    if (cmdLine) {
      history.unshift(cmdLine)
      historyIndex = -1
      
      // Echo command
      addOutput(`<span class="prompt">wick@portfolio:~$</span> ${cmdLine}`)
      
      // Parse command
      const [cmd, ...args] = cmdLine.toLowerCase().split(' ')
      
      if (commands[cmd]) {
        const result = await commands[cmd](args)
        if (result) addOutput(result)
      } else {
        addOutput(`<span class="red">Command not found: ${cmd}</span>
<span class="dim">Type 'help' for available commands</span>`)
      }
    }
    input.value = ''
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (historyIndex < history.length - 1) {
      historyIndex++
      input.value = history[historyIndex]
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (historyIndex > 0) {
      historyIndex--
      input.value = history[historyIndex]
    } else {
      historyIndex = -1
      input.value = ''
    }
  } else if (e.key === 'Tab') {
    e.preventDefault()
    const partial = input.value.toLowerCase()
    const match = Object.keys(commands).find(c => c.startsWith(partial))
    if (match) input.value = match
  }
})

// Keep focus
terminal.addEventListener('click', () => input.focus())
document.addEventListener('keydown', (e) => {
  if (!e.ctrlKey && !e.metaKey && !e.altKey) {
    input.focus()
  }
})
