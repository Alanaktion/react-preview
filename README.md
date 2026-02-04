# React Preview Server

A simple self-hosted preview server for LLM-generated web app prototypes from Claude Artifacts, Gemini Canvases, or any React components you want to iterate on.

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run the Server
```bash
npm run dev
```

The server will start at `http://localhost:5173` (or the next available port). You'll see a home page listing all your preview components.

## How to Use

### 1. Add Your Components

Drop your React components (`.jsx` or `.tsx` files) into the `previews/` folder:

```
previews/
  my-app.jsx
  another-component.tsx
  todo-list.jsx
```

Each component should have a **default export**:

```jsx
export default function MyApp() {
  return <div>Your app here</div>
}
```

### 2. View Your Components

Visit the homepage to see a list of all your components. Click any link to preview it in the browser.

### 3. Edit and Hot Reload

The server automatically reloads when you edit files. Just save your component and refresh the browser to see changes.

## Getting Components from LLMs

### Claude Artifacts
1. Ask Claude to create a React component (it'll do this by default if it needs dynamic state)
2. Download the code from the artifact (TSX file)
3. Paste it into the `previews/` folder
4. Visit `http://localhost:5173` to see it

### Gemini Canvas
1. Create a web app in Gemini Canvas
2. Select "Share" and choose "Copy code"
3. Paste into a new `.jsx` file in the `previews/` folder
4. Visit `http://localhost:5173` to see it

## Project Structure

- `main.jsx` - React app entry point
- `router.jsx` - Routing logic and component discovery
- `previews/` - Your component files go here
- `vite.config.js` - Build configuration

## Tech Stack

- **React 18** - UI framework
- **Vite** - Lightning-fast dev server
- **React Router** - Client-side routing
- **Lucide React** - Icon library (optional)
- **TypeScript** - Full TypeScript support
- **Tailwind** - Auto-generates CSS styles used by most Gemini/Claude output

## Notes

- Components render in isolation with full router support
- Install additional packages with `npm install` as needed for your components
- The preview server is optimized for development, not production
