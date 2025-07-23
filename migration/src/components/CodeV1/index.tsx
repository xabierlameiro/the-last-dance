import { Pre, RawCode, highlight } from "codehike/code"

// CodeHike v1 component for new codeblocks
export async function CodeV1({ codeblock }: Readonly<{ codeblock: RawCode }>) {
  const highlighted = await highlight(codeblock, "github-dark")
  return (
    <Pre 
      code={highlighted} 
      className="ch-codeblock border bg-card rounded p-4 my-4" 
      style={{
        backgroundColor: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '1rem',
        margin: '1rem 0'
      }}
    />
  )
}
