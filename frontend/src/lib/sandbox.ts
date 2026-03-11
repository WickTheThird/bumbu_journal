/**
 * Sandboxed code execution using iframes
 * User code runs in complete isolation from the IDE
 */

export interface ExecutionResult {
  success: boolean
  output: string
  error?: string
  duration: number
}

const SANDBOX_TIMEOUT = 10_000 // 10 seconds max execution

/**
 * Create a sandboxed iframe for code execution
 */
function createSandbox(): HTMLIFrameElement {
  const iframe = document.createElement('iframe')
  iframe.sandbox.add('allow-scripts') // Only scripts, no same-origin
  iframe.style.display = 'none'
  document.body.appendChild(iframe)
  return iframe
}

/**
 * Execute JavaScript code in a sandboxed iframe
 */
export async function executeJavaScript(code: string): Promise<ExecutionResult> {
  const startTime = performance.now()
  
  return new Promise((resolve) => {
    const iframe = createSandbox()
    let settled = false
    
    const cleanup = () => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe)
      }
    }
    
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true
        cleanup()
        resolve({
          success: false,
          output: '',
          error: 'Execution timed out (10s limit)',
          duration: SANDBOX_TIMEOUT,
        })
      }
    }, SANDBOX_TIMEOUT)
    
    // Listen for messages from the sandbox
    const handleMessage = (event: MessageEvent) => {
      if (event.source === iframe.contentWindow && !settled) {
        settled = true
        clearTimeout(timeout)
        cleanup()
        window.removeEventListener('message', handleMessage)
        
        const duration = performance.now() - startTime
        
        if (event.data.type === 'result') {
          resolve({
            success: true,
            output: event.data.output || '',
            duration,
          })
        } else if (event.data.type === 'error') {
          resolve({
            success: false,
            output: event.data.output || '',
            error: event.data.error,
            duration,
          })
        }
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    // Inject the code into the sandbox
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body>
      <script>
        const output = [];
        const originalLog = console.log;
        console.log = (...args) => {
          output.push(args.map(a => 
            typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
          ).join(' '));
        };
        console.error = console.log;
        console.warn = console.log;
        
        try {
          ${code}
          parent.postMessage({ type: 'result', output: output.join('\\n') }, '*');
        } catch (e) {
          parent.postMessage({ 
            type: 'error', 
            error: e.message || String(e),
            output: output.join('\\n')
          }, '*');
        }
      </script>
      </body>
      </html>
    `
    
    iframe.srcdoc = html
  })
}

/**
 * Execute Python code using Pyodide (WebAssembly)
 * Loads Pyodide on first use
 */
let pyodidePromise: Promise<unknown> | null = null

async function loadPyodide(): Promise<unknown> {
  if (pyodidePromise) return pyodidePromise
  
  pyodidePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
    script.onload = async () => {
      try {
        // @ts-expect-error - Pyodide is loaded globally
        const pyodide = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
        })
        resolve(pyodide)
      } catch (e) {
        reject(e)
      }
    }
    script.onerror = () => reject(new Error('Failed to load Pyodide'))
    document.head.appendChild(script)
  })
  
  return pyodidePromise
}

export async function executePython(code: string): Promise<ExecutionResult> {
  const startTime = performance.now()
  
  try {
    const pyodide = await loadPyodide() as {
      runPythonAsync: (code: string) => Promise<unknown>
      runPython: (code: string) => unknown
      setStdout: (options: { batched: (text: string) => void }) => void
    }
    
    const output: string[] = []
    
    // Capture stdout
    pyodide.setStdout({
      batched: (text: string) => output.push(text),
    })
    
    // Run the code
    const result = await pyodide.runPythonAsync(code)
    
    const duration = performance.now() - startTime
    
    // Include return value if present
    let finalOutput = output.join('')
    if (result !== undefined && result !== null) {
      finalOutput += (finalOutput ? '\n' : '') + String(result)
    }
    
    return {
      success: true,
      output: finalOutput,
      duration,
    }
  } catch (e) {
    const duration = performance.now() - startTime
    return {
      success: false,
      output: '',
      error: e instanceof Error ? e.message : String(e),
      duration,
    }
  }
}

/**
 * Execute code based on language
 */
export async function execute(code: string, language: string): Promise<ExecutionResult> {
  switch (language) {
    case 'javascript':
    case 'typescript': // TypeScript runs as JS in browser
      return executeJavaScript(code)
    case 'python':
      return executePython(code)
    default:
      return {
        success: false,
        output: '',
        error: `Language "${language}" is not supported for execution`,
        duration: 0,
      }
  }
}
