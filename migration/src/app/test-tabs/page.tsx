import { readFileSync } from 'fs'
import { join } from 'path'
import { compileMDX } from 'next-mdx-remote/rsc'
import { CodeWithTabs } from '@/components/CodeWithTabs'

export default async function TestTabsPage() {
  // Leer el archivo MDX
  const filePath = join(process.cwd(), 'data', 'home', 'desktop.es.mdx')
  const source = readFileSync(filePath, 'utf8')
  
  // Compilar MDX
  const { content } = await compileMDX({
    source,
    components: {
      CodeWithTabs, // Pasar el componente explícitamente
    },
    options: {
      parseFrontmatter: true,
    },
  })

  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-white text-2xl mb-4">Test CodeWithTabs Component</h1>
      <div className="max-w-4xl">
        {content}
      </div>
    </div>
  )
}
