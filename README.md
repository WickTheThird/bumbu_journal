# HashIDE

A browser-based code editor where your entire workspace is stored in the URL hash. Write Python, JavaScript, and HTML. Share code by sharing a link.

**Live:** https://bumbuindustries.com

## Features

- URL-based workspace storage (no backend required)
- Python execution via Pyodide with multi-file import support
- Monaco Editor (VS Code's editor)
- Multi-file projects
- Sandboxed code execution
- Mobile-friendly

## Tech Stack

- React + TypeScript
- Vite
- Monaco Editor
- Pyodide (Python in WebAssembly)
- Tailwind CSS
- LZ-String (compression)

## Development

```bash
cd frontend
npm install
npm run dev
```

## Build

```bash
npm run build
```

## License

MIT License - Filip Bumbu
