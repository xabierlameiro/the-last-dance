import { Block, CodeBlock, parseProps } from "codehike/blocks"
import { Pre, highlight, RawCode } from "codehike/code"
import { z } from "zod"
import { CodeTabsHydrated } from "./CodeTabsHydrated"

const Schema = Block.extend({ tabs: z.array(CodeBlock) })

export async function CodeWithTabs(props: unknown) {
  const { tabs } = parseProps(props, Schema)
  return <CodeTabsWrapper tabs={tabs} />
}

async function CodeTabsWrapper(props: { readonly tabs: RawCode[] }) {
  const { tabs } = props
  const highlighted = await Promise.all(
    tabs.map((tab) => highlight(tab, "github-dark")),
  )
  
  return <CodeTabsHydrated highlighted={highlighted} tabs={tabs} />
}
