import { RawCode, Pre, highlight, AnnotationHandler } from "codehike/code"

// Line numbers handler para CodeHike v1
const lineNumbers: AnnotationHandler = {
  name: "line-numbers",
  Line: ({ annotation, ...props }) => {
    const width = props.children.toString().split('\n').length.toString().length
    return (
      <div className="flex">
        <span 
          className="text-zinc-500 text-xs select-none pr-4 text-right inline-block"
          style={{ minWidth: `${Math.max(2, width)}ch` }}
        >
          {props.indentation}
        </span>
        <span className="flex-1">{props.children}</span>
      </div>
    )
  },
  AnnotatedLine: ({ annotation, ...props }) => {
    const lineNumber = annotation.query || props.lineNumber.toString()
    const width = annotation.data?.width || 2
    return (
      <div className="flex">
        <span 
          className="text-zinc-500 text-xs select-none pr-4 text-right inline-block"
          style={{ minWidth: `${Math.max(2, width)}ch` }}
        >
          {lineNumber}
        </span>
        <span className="flex-1">{props.children}</span>
      </div>
    )
  },
}

// Componente para mostrar el icono del archivo basado en la extensión
function CodeIcon({ filename }: Readonly<{ filename: string }>) {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  const getIconColor = (ext: string | undefined) => {
    switch (ext) {
      case 'tsx':
      case 'ts':
        return 'bg-blue-500'
      case 'css':
        return 'bg-purple-500'
      case 'json':
        return 'bg-yellow-500'
      case 'js':
      case 'jsx':
        return 'bg-yellow-600'
      default:
        return 'bg-gray-500'
    }
  }
  
  return (
    <div className="w-4 h-4 flex items-center justify-center">
      <div className={`w-3 h-3 rounded-sm ${getIconColor(extension)}`}></div>
    </div>
  )
}

// Componente principal que replica CH.Code v0 con múltiples tabs
// Esta es la migración del legacy <CH.Code> que tenía múltiples archivos
export async function Code({ 
  codeblock, 
  className = "",
  style = {},
  showTabs = true,
  lineNumbers = true,
}: Readonly<{ 
  codeblock: RawCode
  className?: string
  style?: React.CSSProperties
  showTabs?: boolean
  lineNumbers?: boolean
}>) {
  const highlighted = await highlight(codeblock, "github-dark")
  const filename = codeblock.meta || "index.tsx"
  
  const codeElement = (
    <Pre 
      code={highlighted} 
      style={{
        ...highlighted.style,
        backgroundColor: "var(--ch-16)",
      }}
      className="m-0 py-4 px-4 bg-zinc-900 text-sm leading-relaxed font-mono" 
    />
  )

  // Si no se muestran tabs, solo renderiza el código básico
  if (!showTabs) {
    return (
      <div 
        className={`border border-zinc-600 rounded overflow-hidden ${className}`}
        style={{
          backgroundColor: "var(--ch-16)",
          ...style,
        } as any}
      >
        {codeElement}
      </div>
    )
  }

  // Componente que replica exactamente CH.Code v0 con tabs múltiples
  return (
    <div 
      className={`border border-zinc-700 rounded-lg overflow-hidden shadow-2xl ${className}`}
      style={{
        backgroundColor: "#0d1117",
        borderColor: "#30363d",
        height: "inherit", // Replica style={{ height: 'inherit'}} del legacy
        ...style,
      } as any}
    >
      {/* Frame title bar - replica div.ch-frame-title-bar del CSS legacy */}
      <div className="bg-zinc-800 border-b border-zinc-700">
        <div className="flex items-center px-2 py-2">
          {/* Botones de control estilo macOS - posición izquierda como en producción */}
          <div className="flex gap-1.5 mr-4">
            <div className="w-3 h-3 bg-red-500 rounded-full opacity-80"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full opacity-80"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full opacity-80"></div>
          </div>
          
          {/* Tabs - replica la estructura de CH.Code v0 */}
          <div className="flex">
            {/* Tab activo - index.tsx */}
            <div className="px-3 py-1.5 bg-zinc-700 text-zinc-200 text-xs flex items-center gap-2 border-b-2 border-blue-500 font-medium">
              <CodeIcon filename="index.tsx" />
              <span>index.tsx</span>
            </div>
            
            {/* Tab inactivo - knowledge.module.css */}
            <div className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs flex items-center gap-2 border-b border-zinc-600 hover:bg-zinc-700 cursor-pointer">
              <CodeIcon filename="knowledge.module.css" />
              <span>knowledge.module.css</span>
            </div>
            
            {/* Tab inactivo - contact.json */}
            <div className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs flex items-center gap-2 border-b border-zinc-600 hover:bg-zinc-700 cursor-pointer">
              <CodeIcon filename="contact.json" />
              <span>contact.json</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenido del código - fondo negro como en producción */}
      <div className="bg-zinc-900">
        {codeElement}
      </div>
    </div>
  )
}

export default Code
