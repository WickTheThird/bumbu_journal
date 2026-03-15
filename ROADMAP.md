# HashIDE Product Plan

## North Star
*"The fastest way to build and share working web apps from your browser"*

**Core magic:** Entire projects live inside a URL

---

## ✅ Phase 0: Foundation (COMPLETE)

| Feature | Status |
|---------|--------|
| Monaco editor | ✅ Done |
| Multi-file workspace | ✅ Done |
| Split panes (drag to split, nested) | ✅ Done |
| Tab system (drag reorder) | ✅ Done |
| File explorer (create/delete/rename) | ✅ Done |
| URL hash encoding (project in URL) | ✅ Done |
| Dark/light theme | ✅ Done |
| Settings panel | ✅ Done |
| Keyboard shortcuts | ✅ Done |
| Command palette | ✅ Done |
| Search panel | ✅ Done |
| HTML preview | ✅ Done |
| Markdown preview | ✅ Done |
| Terminal/execution (JS + Python) | ✅ Done |
| Import (upload files, GitHub clone) | ✅ Done |
| Export (zip download) | ✅ Done |
| History/snapshots | ✅ Done |
| Local Git (commits, diff, history) | ✅ Done |
| GitHub push + PR workflow | ✅ Done |
| Mobile responsive | ✅ Done |
| Pyodide background preload | ✅ Done |

**Outcome:** Fully functional HTML/CSS/JS/Python IDE in browser ✓

---

## 🔄 Phase 1: Framework Support (NEXT)

| Task | Status | Why |
|------|--------|-----|
| esbuild-wasm bundling | ⏳ Todo | Compile JSX/TSX in browser |
| esm.sh integration | ⏳ Todo | Load npm deps from CDN |
| IndexedDB dep caching | ⏳ Todo | Don't re-download React every reload |
| `.jsx`/`.tsx` detection | ⏳ Todo | Simple, reliable |
| Templates/starters | ⏳ Todo | Reduce blank-editor friction |

**Outcome:** `hashide.dev/#[compressed-react-app]` works

---

## ⏳ Phase 2: Cloud Storage + Accounts (Pro Tier)

### Architecture
```
FREE TIER (unchanged)
├── hashide.dev/#[long-compressed-hash]
├── No backend required
├── No account needed
├── Limited by URL length (~5-10 files)
└── Works offline

PRO TIER ($5/mo)
├── hashide.dev/p/V1StGXR8_Z5jdHi6B-myT
├── GitHub OAuth required
├── Stored in Cloudflare R2
├── Unlimited files
├── Access control (private projects)
└── 22-char IDs (128-bit entropy, unguessable)
```

### Tasks

| Task | Status | Why |
|------|--------|-----|
| GitHub OAuth | ⏳ Todo | Identity + access control |
| Cloudflare R2 bucket | ⏳ Todo | Store project hashes (10GB free) |
| Worker API: save/load | ⏳ Todo | `POST /api/save`, `GET /api/load/:id` |
| Short URLs | ⏳ Todo | `hashide.dev/p/{22-char-id}` |
| "Save to Cloud" button | ⏳ Todo | Pro feature, triggers save flow |
| Project ownership | ⏳ Todo | Link projects to GitHub user |
| Private projects | ⏳ Todo | Only owner can access |
| Project dashboard | ⏳ Todo | "My Projects" page |

**Outcome:** Pro users get unlimited storage + short URLs

---

## ⏳ Phase 3: Hosting + Embed + AI

| Task | Status | Why |
|------|--------|-----|
| Static hosting | ⏳ Todo | `username.hashide.dev/project-name` |
| Embed mode | ⏳ Todo | `hashide.dev/embed/xyz` for iframes |
| "Open in HashIDE" button | ⏳ Todo | Viral distribution |
| AI assistant | ⏳ Todo | Monetization + differentiation |
| Single HTML export | ⏳ Todo | HN-worthy "wow" feature |

**Outcome:** Product spreads through content

---

## ⏳ Phase 4: Monetization

| Free | Pro ($5/mo) |
|------|-------------|
| URL-only projects (~5-10 files) | Cloud storage (unlimited) |
| Public sharing only | Private projects |
| Basic embeds | Short custom URLs |
| Templates | Static hosting |
| Community support | Priority support |

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite + Tailwind |
| Editor | Monaco |
| Bundling | esbuild-wasm |
| Python | Pyodide |
| Auth | GitHub OAuth |
| Storage | Cloudflare R2 |
| API | Cloudflare Workers |
| Hosting | GitHub Pages (current), Cloudflare Pages (future) |

---

## Current Status

| Phase | Status |
|-------|--------|
| Phase 0: Foundation | ✅ COMPLETE |
| Phase 1: Framework Support | 🔄 Ready to start |
| Phase 2: Cloud Storage | ⏳ Planned |
| Phase 3: Hosting + Embed + AI | ⏳ Planned |
| Phase 4: Monetization | ⏳ Planned |

**Next action:** Phase 1 - esbuild-wasm + React support

---

*Last updated: March 15, 2026*
