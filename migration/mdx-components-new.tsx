import type { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'

// Legacy CH component for backward compatibility
const CHCode = ({ children, style, ...props }: any) => {
    return (
        <div style={style}>
            <pre className="bg-gray-900 text-white p-4 rounded overflow-x-auto border my-4" {...props}>
                <code>{children}</code>
            </pre>
        </div>
    );
};

const CH = {
    Code: CHCode,
};

// Make CH available globally for legacy MDX files
if (typeof globalThis !== 'undefined') {
    (globalThis as any).CH = CH;
}

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
    pre: ({ children, ...props }) => (
      <pre className="bg-gray-900 text-white p-4 rounded overflow-x-auto border my-4" {...props}>
        {children}
      </pre>
    ),
    code: ({ children }) => (
      <code className="bg-gray-800 text-gray-100 px-1 py-0.5 rounded text-sm">
        {children}
      </code>
    ),
    CH, // Add CH for legacy compatibility
    ...components,
  }
}
