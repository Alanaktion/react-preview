import React from "react"
import { BrowserRouter, Routes, Route, Link, Navigate, useParams } from "react-router-dom"
import { marked } from "marked"

const modules = import.meta.glob("./previews/**/*.{jsx,tsx}", { eager: true })
const htmlFiles = import.meta.glob("./previews/**/*.html", { eager: true, query: "?url" })
const mdFiles = import.meta.glob("./previews/**/*.md", { eager: true, query: "?raw" })

function stripPrefix(path) {
  return path.replace(/^\.\/previews\//, "")
}

// Priority when a directory has more than one file that could resolve a given
// name (e.g. both index.html and index.jsx).
const EXT_PRIORITY = ["html", "jsx", "tsx", "md"]

const jsxEntries = Object.keys(modules).map(path => {
  const rel = stripPrefix(path)
  return { rel: rel.replace(/\.[tj]sx$/, ""), ext: rel.match(/\.([tj]sx)$/)[1] }
})
const htmlEntries = Object.keys(htmlFiles).map(path => ({
  rel: stripPrefix(path).replace(/\.html$/, ""),
  ext: "html",
}))
const mdEntries = Object.keys(mdFiles).map(path => ({
  rel: stripPrefix(path).replace(/\.md$/, ""),
  ext: "md",
}))
const allEntries = [...jsxEntries, ...htmlEntries, ...mdEntries]

function Markdown({ content }) {
  return (
    <div
      className="max-w-3xl space-y-4 leading-relaxed [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-400 [&_a]:hover:underline [&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded [&_pre]:bg-white/10 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
    />
  )
}

function Index() {
  const params = useParams()
  const dir = (params["*"] || "").replace(/\/+$/, "")
  const prefix = dir ? `${dir}/` : ""

  const folders = new Set()
  const files = []
  for (const { rel, ext } of allEntries) {
    if (prefix && !rel.startsWith(prefix)) continue
    const remainder = rel.slice(prefix.length)
    if (!remainder) continue
    const slash = remainder.indexOf("/")
    if (slash === -1) {
      files.push({ rel, name: remainder, ext })
    } else {
      folders.add(remainder.slice(0, slash))
    }
  }
  const folderList = [...folders].sort((a, b) => a.localeCompare(b))
  files.sort((a, b) => a.name.localeCompare(b.name))

  // A directory whose own files include an "index" (index.html, index.jsx, ...)
  // renders that file directly instead of the listing, like a web server.
  const indexCandidates = files.filter(f => f.name.toLowerCase() === "index")
  if (indexCandidates.length) {
    indexCandidates.sort((a, b) => EXT_PRIORITY.indexOf(a.ext) - EXT_PRIORITY.indexOf(b.ext))
    return <Navigate to={`/preview/${indexCandidates[0].rel}`} replace />
  }

  const readme = files.find(f => f.ext === "md" && f.name.toLowerCase() === "readme")
  const readmeContent = readme ? mdFiles[`./previews/${readme.rel}.md`]?.default : null

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
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
      {readmeContent != null && (
        <div className="border-t pt-6">
          <Markdown content={readmeContent} />
        </div>
      )}
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

  const mdMod = mdFiles[`./previews/${name}.md`]
  if (mdMod) {
    return (
      <div className="p-6">
        <Markdown content={mdMod.default} />
      </div>
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
