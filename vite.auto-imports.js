const JSX_TAG_REGEX = /<([A-Z][A-Za-z0-9]*)[\s/>]/g

export default function autoInjectImports() {
  return {
    name: "auto-inject-imports",
    enforce: "pre",

    transform(code, id) {
      const isPreviewFile =
        id.includes("/previews/") &&
        (id.endsWith(".jsx") || id.endsWith(".tsx"))

      if (!isPreviewFile) return null

      let imports = []

      // React import if missing (still useful for some TSX outputs)
      if (!code.match(/from\s+['"]react['"]/)) {
        imports.push(`import React from "react"`)
      }

      // Lucide auto-detection
      if (!code.match(/from\s+['"]lucide-react['"]/)) {
        const used = new Set()
        let match

        while ((match = JSX_TAG_REGEX.exec(code))) {
          used.add(match[1])
        }

        if (used.size) {
          imports.push(`import { ${[...used].join(", ")} } from "lucide-react"`)
        }
      }

      if (!imports.length) return null

      return {
        code: `${imports.join("\n")}\n\n${code}`,
        map: null
      }
    }
  }
}