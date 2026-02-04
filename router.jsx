import React from "react"
import { BrowserRouter, Routes, Route, Link, useParams } from "react-router-dom"

const modules = import.meta.glob("./previews/*.{jsx,tsx}", { eager: true })

function Index() {
  const files = Object.keys(modules)
  return (
    <div className="p-6 space-y-2">
      <h1 className="text-xl font-semibold">JSX Previews</h1>
      <ul className="list-disc pl-5">
        {files.map(path => {
          const name = path.split("/").pop().replace(/.[tj]sx/, "")
          return (
            <li key={path}>
              <Link className="text-blue-400 hover:underline" to={`/preview/${name}`}>
                {name}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Preview() {
  const { name } = useParams()
  const mod =
    modules[`./previews/${name}.jsx`] ||
    modules[`./previews/${name}.tsx`]

  if (!mod?.default) {
    return <div className="p-6">Component not found</div>
  }

  const Component = mod.default
  return <Component />
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/preview/:name" element={<Preview />} />
      </Routes>
    </BrowserRouter>
  )
}
