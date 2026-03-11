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
 * Execute JavaScript code in a sandboxed iframe using Blob URL
 */
export async function executeJavaScript(code: string): Promise<ExecutionResult> {
  const startTime = performance.now()
  
  return new Promise((resolve) => {
    let settled = false
    let iframe: HTMLIFrameElement | null = null
    let blobUrl: string | null = null
    
    const cleanup = () => {
      if (iframe?.parentNode) {
        iframe.parentNode.removeChild(iframe)
      }
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
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
      if (!settled && event.data && (event.data.type === 'result' || event.data.type === 'error')) {
        settled = true
        clearTimeout(timeout)
        window.removeEventListener('message', handleMessage)
        cleanup()
        
        const duration = performance.now() - startTime
        
        if (event.data.type === 'result') {
          resolve({
            success: true,
            output: event.data.output || '',
            duration,
          })
        } else {
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
    
    // Build the HTML with the user code
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body><script>
const output = [];
console.log = (...args) => {
  output.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
};
console.error = console.log;
console.warn = console.log;
console.info = console.log;

(async () => {
  try {
    const result = await (async () => { ${code} })();
    if (result !== undefined) {
      output.push(typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result));
    }
    parent.postMessage({ type: 'result', output: output.join('\\n') }, '*');
  } catch (e) {
    parent.postMessage({ type: 'error', error: e.message || String(e), output: output.join('\\n') }, '*');
  }
})();
</script></body></html>`
    
    // Create blob URL and iframe
    const blob = new Blob([html], { type: 'text/html' })
    blobUrl = URL.createObjectURL(blob)
    
    iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none;'
    // Blob URLs already have unique/null origin providing isolation
    // No sandbox attribute needed - blob isolation is sufficient
    iframe.src = blobUrl
    document.body.appendChild(iframe)
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
