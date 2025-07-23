import type { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'
import { Code } from './src/components/Code'
import { CodeWithTabs } from './src/components/CodeWithTabs'

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-3xl font-semibold mb-3">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-medium mb-2">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="mb-4 leading-7">{children}</p>
    ),
    img: (props) => (
      <Image
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
        {...(props as ImageProps)}
        alt={props.alt ?? ''}
      />
    ),
    Code, // CodeHike v1 component for all code blocks
    CodeWithTabs, // CodeHike v1 component for tabs
    ...components,
  } as any
}
