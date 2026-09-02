import React from "react"
import { BrowserRouter, Routes, Route, Link, useParams } from "react-router-dom"

const modules = import.meta.glob("./previews/**/*.{jsx,tsx}", { eager: true })
const htmlFiles = import.meta.glob("./previews/**/*.html", { eager: true, query: "?url" })

function stripPrefix(path) {
  return path.replace(/^\.\/previews\//, "")
}

const jsxEntries = Object.keys(modules).map(path => ({
  rel: stripPrefix(path).replace(/\.[tj]sx$/, ""),
}))
const htmlEntries = Object.keys(htmlFiles).map(path => ({
  rel: stripPrefix(path).replace(/\.html$/, ""),
}))
const allEntries = [...jsxEntries, ...htmlEntries]

function Index() {
  const params = useParams()
  const dir = (params["*"] || "").replace(/\/+$/, "")
  const prefix = dir ? `${dir}/` : ""

  const folders = new Set()
  const files = []
  for (const { rel } of allEntries) {
    if (prefix && !rel.startsWith(prefix)) continue
    const remainder = rel.slice(prefix.length)
    if (!remainder) continue
    const slash = remainder.indexOf("/")
    if (slash === -1) {
      files.push({ rel, name: remainder })
    } else {
      folders.add(remainder.slice(0, slash))
    }
  }
  const folderList = [...folders].sort((a, b) => a.localeCompare(b))
  files.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="p-6 space-y-2">
      <h1 className="text-xl font-semibold">Previews{dir ? ` / ${dir}` : ""}</h1>
      <ul className="list-disc pl-5">
        {dir && (
          <li>
            <Link className="text-blue-400 hover:underline" to={`/browse/${dir.split("/").slice(0, -1).join("/")}`}>
              ..
            </Link>
          </li>
        )}
        {folderList.map(folder => (
          <li key={folder}>
            <Link className="text-blue-400 hover:underline font-semibold" to={`/browse/${prefix}${folder}`}>
              {folder}/
            </Link>
          </li>
        ))}
        {files.map(({ rel, name }) => (
          <li key={rel}>
            <Link className="text-blue-400 hover:underline" to={`/preview/${rel}`}>
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Preview() {
  const params = useParams()
  const name = params["*"]
  const iframeRef = React.useRef(null)
  const originalRef = React.useRef(null)

  React.useEffect(() => {
    const origIcon = document.querySelector("link[rel~=icon]")
    originalRef.current = {
      title: document.title,
      iconHref: origIcon ? origIcon.href : null,
    }
    return () => {
      document.title = originalRef.current.title
      const cur = document.querySelector("link[rel~=icon]")
      if (cur) {
        if (originalRef.current.iconHref != null) {
          cur.href = originalRef.current.iconHref
        } else {
          cur.remove()
        }
      }
    }
  }, [name])

  const htmlMod = htmlFiles[`./previews/${name}.html`]
  if (htmlMod) {
    return (
      <iframe
        ref={iframeRef}
        src={htmlMod.default}
        onLoad={() => {
          try {
            const doc = iframeRef.current?.contentDocument
            if (!doc) return
            const title = doc.title
            if (title) document.title = title
            const icon = doc.querySelector("link[rel~=icon]")
            if (icon) {
              let rootIcon = document.querySelector("link[rel~=icon]")
              if (rootIcon) {
                rootIcon.href = icon.href
              } else {
                const link = document.createElement("link")
                link.rel = "icon"
                link.href = icon.href
                document.head.appendChild(link)
              }
            }
          } catch {}
        }}
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
        <Route path="/browse/*" element={<Index />} />
        <Route path="/preview/*" element={<Preview />} />
      </Routes>
    </BrowserRouter>
  )
}
