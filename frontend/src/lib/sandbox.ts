/**
 * Sandboxed code execution using iframes and Pyodide
 * User code runs in complete isolation from the IDE
 */

export interface ExecutionResult {
  success: boolean
  output: string
  error?: string
  duration: number
}

export interface ProjectFile {
  name: string
  content: string
}

const SANDBOX_TIMEOUT = 30_000 // 30 seconds max execution (Pyodide can be slow)
const PROJECT_DIR = '/project'

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
          error: 'Execution timed out (30s limit)',
          duration: SANDBOX_TIMEOUT,
        })
      }
    }, SANDBOX_TIMEOUT)
    
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
            output: event.data.output || '(empty output)',
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
    
    const escapedCode = code.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body><script>
(function() {
  var output = [];
  var origLog = console.log;
  
  console.log = function() {
    var args = Array.prototype.slice.call(arguments);
    var line = args.map(function(a) { 
      return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); 
    }).join(' ');
    output.push(line);
  };
  console.error = console.log;
  console.warn = console.log;
  console.info = console.log;

  try {
    eval(\`${escapedCode}\`);
  } catch (e) {
    output.push('Error: ' + (e.message || e));
  }
  
  window.parent.postMessage({ type: 'result', output: output.join('\\n') }, '*');
})();
</script></body></html>`
    
    const blob = new Blob([html], { type: 'text/html' })
    blobUrl = URL.createObjectURL(blob)
    
    iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none;'
    iframe.src = blobUrl
    document.body.appendChild(iframe)
  })
}

/**
 * Pyodide instance and loading
 */
interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>
  runPython: (code: string) => unknown
  setStdout: (options: { batched: (text: string) => void }) => void
  setStderr: (options: { batched: (text: string) => void }) => void
  FS: {
    mkdir: (path: string) => void
    rmdir: (path: string) => void
    writeFile: (path: string, content: string) => void
    readdir: (path: string) => string[]
    unlink: (path: string) => void
    stat: (path: string) => { isDirectory: () => boolean }
  }
}

let pyodidePromise: Promise<PyodideInterface> | null = null

async function loadPyodide(): Promise<PyodideInterface> {
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
        resolve(pyodide as PyodideInterface)
      } catch (e) {
        reject(e)
      }
    }
    script.onerror = () => reject(new Error('Failed to load Pyodide'))
    document.head.appendChild(script)
  })
  
  return pyodidePromise
}

/**
 * Execute Python code with full project filesystem support
 */
export async function executePython(
  entryFile: string,
  files: ProjectFile[]
): Promise<ExecutionResult> {
  const startTime = performance.now()
  console.log('[Python] Starting execution with', files.length, 'files, entry:', entryFile)
  
  try {
    console.log('[Python] Loading Pyodide...')
    const pyodide = await loadPyodide()
    console.log('[Python] Pyodide loaded')
    
    const output: string[] = []
    
    // Capture stdout and stderr
    pyodide.setStdout({
      batched: (text: string) => {
        console.log('[Python] stdout:', text)
        output.push(text)
      },
    })
    pyodide.setStderr({
      batched: (text: string) => {
        console.log('[Python] stderr:', text)
        output.push(text)
      },
    })
    
    // Step 1: Create project directory if it doesn't exist
    try {
      pyodide.FS.mkdir(PROJECT_DIR)
    } catch {
      // Directory may already exist, that's fine
    }
    
    // Step 2: Clear old files from project directory (recursive)
    const clearDir = (dirPath: string) => {
      try {
        const entries = pyodide.FS.readdir(dirPath)
        for (const entry of entries) {
          if (entry !== '.' && entry !== '..') {
            const fullPath = `${dirPath}/${entry}`
            try {
              const stat = pyodide.FS.stat(fullPath)
              if (stat.isDirectory()) {
                clearDir(fullPath)
                pyodide.FS.rmdir(fullPath)
              } else {
                pyodide.FS.unlink(fullPath)
              }
            } catch {
              // Ignore errors
            }
          }
        }
      } catch {
        // Directory might not exist
      }
    }
    clearDir(PROJECT_DIR)
    
    // Step 3: Write all project files to virtual filesystem (with folder support)
    for (const file of files) {
      const filePath = `${PROJECT_DIR}/${file.name}`
      
      // Create parent directories if needed (e.g., "utils/helpers.py" needs "utils" folder)
      const parts = file.name.split('/')
      if (parts.length > 1) {
        let currentPath = PROJECT_DIR
        for (let i = 0; i < parts.length - 1; i++) {
          currentPath += '/' + parts[i]
          try {
            pyodide.FS.mkdir(currentPath)
            // Create __init__.py for Python package support
            const initPath = `${currentPath}/__init__.py`
            try {
              pyodide.FS.stat(initPath)
            } catch {
              pyodide.FS.writeFile(initPath, '# Auto-generated package init\n')
            }
          } catch {
            // Directory may already exist
          }
        }
      }
      
      console.log('[Python] Writing file:', filePath)
      pyodide.FS.writeFile(filePath, file.content)
    }
    
    // Step 4: Clear module cache and add project to sys.path
    await pyodide.runPythonAsync(`
import sys

# Clear any cached modules from previous runs
modules_to_remove = [key for key in sys.modules.keys() 
                     if not key.startswith('_') 
                     and key not in ('sys', 'builtins', 'importlib')]
for mod in modules_to_remove:
    if not mod.startswith(('pyodide', 'js', 'micropip', 'packaging')):
        try:
            del sys.modules[mod]
        except:
            pass

# Add project directory to path (at the beginning for priority)
if '${PROJECT_DIR}' not in sys.path:
    sys.path.insert(0, '${PROJECT_DIR}')

# Change to project directory
import os
os.chdir('${PROJECT_DIR}')
`)
    
    // Step 5: Execute the entry file using exec with proper globals
    const entryPath = `${PROJECT_DIR}/${entryFile}`
    console.log('[Python] Executing entry file:', entryPath)
    
    const result = await pyodide.runPythonAsync(`
with open('${entryPath}', 'r') as f:
    __code = f.read()
exec(__code, {'__name__': '__main__', '__file__': '${entryPath}'})
`)
    
    const duration = performance.now() - startTime
    
    let finalOutput = output.join('')
    if (result !== undefined && result !== null) {
      finalOutput += (finalOutput ? '\n' : '') + String(result)
    }
    
    console.log('[Python] Final output:', finalOutput)
    return {
      success: true,
      output: finalOutput || '(no output)',
      duration,
    }
  } catch (e) {
    console.error('[Python] Error:', e)
    const duration = performance.now() - startTime
    const errorMessage = e instanceof Error ? e.message : String(e)
    
    // Clean up the error message for better readability
    const cleanError = errorMessage
      .replace(/PythonError: Traceback \(most recent call last\):\n/, '')
      .replace(/File "<exec>", line \d+, in <module>\n/, '')
    
    return {
      success: false,
      output: '',
      error: cleanError,
      duration,
    }
  }
}

/**
 * Execute code based on language
 * For Python, pass all project files to enable imports
 */
export async function execute(
  code: string, 
  language: string,
  entryFile?: string,
  allFiles?: ProjectFile[]
): Promise<ExecutionResult> {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return executeJavaScript(code)
    case 'python':
      // If we have all files, use the full project execution
      if (allFiles && allFiles.length > 0 && entryFile) {
        return executePython(entryFile, allFiles)
      }
      // Fallback: single file execution
      return executePython('main.py', [{ name: 'main.py', content: code }])
    default:
      return {
        success: false,
        output: '',
        error: `Language "${language}" is not supported for execution`,
        duration: 0,
      }
  }
}
