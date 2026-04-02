# Copilot Instructions

## What this project is

A lightweight dev server for previewing LLM-generated React components (from Claude Artifacts, Gemini Canvas, etc.) in isolation. Drop a `.jsx` or `.tsx` file into `previews/` and it's instantly accessible via hot-reload at `/preview/<filename>`.

## Dev commands

```bash
npm run dev        # Start Vite dev server at http://localhost:5173
```

No build, test, or lint scripts exist. This is a dev-only tool.

## Architecture

**Entry point:** `main.jsx` → `router.jsx` → components in `previews/`

**Auto-discovery:** `router.jsx` uses `import.meta.glob("./previews/*.{jsx,tsx}", { eager: true })` to scan all preview files at startup. No registration required.

**Routing:**
- `/` — index page listing all discovered components as links
- `/preview/:name` — renders the default export of `previews/<name>.jsx` or `previews/<name>.tsx`

**Auto-imports (`vite.auto-imports.js`):** A custom Vite plugin that pre-processes files in `previews/` before parsing. It scans JSX tags and automatically injects:
- `import React from "react"` if missing
- `import { Icon1, Icon2, ... } from "lucide-react"` for any PascalCase JSX tags found that look like Lucide icons

This means preview components copied from LLMs often work without any import fixes.

**Tailwind CSS:** Loaded via CDN in `index.html` — no PostCSS/build step.

## Adding a new preview

**React components:** Drop a `.jsx` or `.tsx` file into `previews/`. The file **must** have a default export. Available at `/preview/<filename-without-extension>`.

**Plain HTML:** Drop a `.html` file into `previews/`. It's rendered in a full-viewport `<iframe>`. No default export needed.

Filename becomes the URL slug: `my-widget.tsx` → `/preview/my-widget`

## Key conventions

- **All state is local** — components use `useState`/`useEffect` only; no global state (Redux, Zustand, Context), no API calls
- **Mock data inline** — hardcode sample data directly in the component file
- **Lucide React for icons** — use `lucide-react` components; they're auto-imported if missing
- **Tailwind for styling** — all styling via Tailwind utility classes; no CSS files or CSS-in-JS
- **`strict: false`** in `tsconfig.json` — TypeScript is lenient; avoid adding strict type annotations unless necessary
- **Sub-components in same file** — helper components (cards, modals, etc.) are defined in the same file as the main component, not extracted to separate files

## Docker

`docker-compose.yml` runs `npm run dev --host 0.0.0.0` behind a Traefik reverse proxy. The app runs on port 5173 inside the container.
