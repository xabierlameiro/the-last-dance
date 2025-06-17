import { Code } from '@/components/Code';

export default async function TestCodePage() {
  const codeblock = {
    value: `import React from 'react';

const HelloWorld = () => {
  return <div>Hello World!</div>;
};

export default HelloWorld;`,
    lang: 'tsx',
    meta: 'HelloWorld.tsx'
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-white text-2xl mb-4">Test Code Component</h1>
      <Code codeblock={codeblock} />
    </div>
  );
}
