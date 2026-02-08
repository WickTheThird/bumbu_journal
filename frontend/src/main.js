import './style.css'

const WICK_LOGO = `
 █     █░ ██▓ ▄████▄   ██ ▄█▀
▓█░ █ ░█░▓██▒▒██▀ ▀█   ██▄█▒ 
▒█░ █ ░█ ▒██▒▒▓█    ▄ ▓███▄░ 
░█░ █ ░█ ░██░▒▓▓▄ ▄██▒▓██ █▄ 
░░██▒██▓ ░██░▒ ▓███▀ ░▒██▒ █▄
░ ▓░▒ ▒  ░▓  ░ ░▒ ▒  ░▒ ▒▒ ▓▒
  ▒ ░ ░   ▒ ░  ░  ▒   ░ ░▒ ▒░
  ░   ░   ▒ ░░        ░ ░░ ░ 
    ░     ░  ░ ░      ░  ░   
             ░               
`

const welcomeLines = [
  '',
  '<span class="cyan">' + WICK_LOGO + '</span>',
  '',
  '<span class="dim">────────────────────────────────────────────────────────────</span>',
  '',
  '  <span class="green">WICK TERMINAL</span> <span class="dim">v3.0.0</span> <span class="yellow">64 bit</span> <span class="dim">| Educational Mode</span>',
  '',
  '  <span class="dim">Port:</span> <span class="white">6379</span>',
  '  <span class="dim">PID:</span> <span class="white">42069</span>',
  '  <span class="dim">Mode:</span> <span class="green">standalone</span>',
  '',
  '  <span class="dim">Documentation:</span> <span class="cyan">https://github.com/WickTheThird</span>',
  '',
  '<span class="dim">────────────────────────────────────────────────────────────</span>',
  '',
  '  <span class="yellow">⚡</span> Type <span class="green">help</span> to see available commands',
  '  <span class="yellow">⚡</span> Type <span class="green">about</span> to learn more',
  '  <span class="yellow">⚡</span> Type <span class="green">clear</span> to reset the terminal',
  '',
]

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
        <div class="terminal-title">wick@terminal ~ </div>
        <div class="terminal-status">
          <span class="status-dot"></span>
          <span>connected</span>
        </div>
      </div>
      
      <div class="terminal-body" id="terminal">
        <div class="output" id="output"></div>
        
        <div class="input-line">
          <span class="prompt">wick&gt;</span>
          <input type="text" class="command-input" id="commandInput" autofocus spellcheck="false" />
        </div>
      </div>
    </div>
  </div>
`

const output = document.getElementById('output')
const input = document.getElementById('commandInput')
const terminal = document.getElementById('terminal')

// Type out welcome message
let lineIndex = 0
function typeWelcome() {
  if (lineIndex < welcomeLines.length) {
    const line = document.createElement('div')
    line.className = 'output-line'
    line.innerHTML = welcomeLines[lineIndex]
    output.appendChild(line)
    lineIndex++
    terminal.scrollTop = terminal.scrollHeight
    setTimeout(typeWelcome, 30)
  }
}

typeWelcome()

// Handle input (no commands yet, just echo)
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const cmd = input.value.trim()
    if (cmd) {
      // Echo the command
      const cmdLine = document.createElement('div')
      cmdLine.className = 'output-line'
      cmdLine.innerHTML = `<span class="prompt">wick&gt;</span> ${cmd}`
      output.appendChild(cmdLine)
      
      // Response placeholder
      const response = document.createElement('div')
      response.className = 'output-line dim'
      response.textContent = '(commands coming soon...)'
      output.appendChild(response)
      
      terminal.scrollTop = terminal.scrollHeight
    }
    input.value = ''
  }
})

// Keep focus on input
terminal.addEventListener('click', () => input.focus())
