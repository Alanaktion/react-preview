import React from "react"
import { BrowserRouter, Routes, Route, Link, useParams } from "react-router-dom"

const modules = import.meta.glob("./previews/*.{jsx,tsx}", { eager: true })
const htmlFiles = import.meta.glob("./previews/*.html", { eager: true, query: "?url" })

function Index() {
  const jsxEntries = Object.keys(modules).map(path => ({
    path,
    name: path.split("/").pop().replace(/\.[tj]sx$/, ""),
  }))
  const htmlEntries = Object.keys(htmlFiles).map(path => ({
    path,
    name: path.split("/").pop().replace(/\.html$/, ""),
  }))
  const all = [...jsxEntries, ...htmlEntries].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="p-6 space-y-2">
      <h1 className="text-xl font-semibold">Previews</h1>
      <ul className="list-disc pl-5">
        {all.map(({ path, name }) => (
          <li key={path}>
            <Link className="text-blue-400 hover:underline" to={`/preview/${name}`}>
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Preview() {
  const { name } = useParams()

  const htmlMod = htmlFiles[`./previews/${name}.html`]
  if (htmlMod) {
    return (
      <iframe
        src={htmlMod.default}
        style={{ display: "block", width: "100vw", height: "100vh", border: "none" }}
      />
    )
  }

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
