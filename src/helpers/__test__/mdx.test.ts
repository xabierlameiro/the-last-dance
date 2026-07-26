import fs from 'fs';
import path from 'path';

/**
 * SDD-L10-T13. `helpers/mdx.ts` sits at 0% coverage, and what it is not covering is a deliberate
 * security trade-off.
 *
 * `next-mdx-remote` v6 blocks JavaScript expressions in MDX by default. This project turns that off
 * (`blockJS: false`) because Code Hike's compiled output *is* JS expressions, and relies on
 * `blockDangerousJS: true` to keep `eval`, `Function`, `require` and friends out. That pair is the
 * entire safety argument, and nothing asserted the second half still held while the first was
 * disabled.
 *
 * ## Why this reads the source instead of running it
 *
 * The test I wanted — `await expect(serialize("{eval('x')}")).rejects.toThrow()` — cannot run here.
 * Importing `helpers/mdx.ts` pulls in `remark-gfm` and its unified/micromark/mdast/vfile chain, all
 * pure ESM, and Jest's transform refuses them with `SyntaxError: Unexpected token 'export'`. I tried
 * the documented fix (a narrow `transformIgnorePatterns` exception for that chain) and it did not
 * take: `next/jest` sets its own value after the custom config and wins. SDD-L10's docs gate called
 * this "its own class of problem", and it was right.
 *
 * So this asserts the flags at the source level. That is weaker than executing the pipeline — it
 * cannot prove next-mdx-remote honours the flag — but it catches the regression that would actually
 * happen: someone tidying up `blockJS: false` and taking the guard with it. The pipeline itself is
 * executed for real on every CI run, by `next build` compiling all 45 posts and by the e2e suite
 * rendering one and running axe over it.
 *
 * The same technique, and the same reasoning, as the DeploymentStatus stylesheet test in SDD-L07.
 */
const source = fs.readFileSync(path.join(__dirname, '..', 'mdx.ts'), 'utf8');
const plugins = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'mdx.plugins.ts'), 'utf8');

describe('MDX serialize options', () => {
    it('should keep the dangerous-globals guard on', () => {
        expect(source).toMatch(/blockDangerousJS:\s*true/);
    });

    // Not an accident and not safe to "tidy up": blocking expressions blanks every code block.
    it('should allow plain JS expressions, which Code Hike needs', () => {
        expect(source).toMatch(/blockJS:\s*false/);
    });

    /**
     * `autoImport: false` for this pipeline specifically. SDD-L09 established the difference the
     * hard way, with a broken build: `next-mdx-remote` compiles a fragment with no module scope, so
     * an injected `import { CH } from '@code-hike/mdx/components'` cannot run — `CH` arrives through
     * the components prop instead. `@next/mdx` compiles a real module and needs the opposite.
     */
    it('should not ask Code Hike to auto-import into a fragment', () => {
        expect(source).toMatch(/remarkPlugins:\s*remarkPlugins\(\{\s*autoImport:\s*false\s*\}\)/);
    });

    it('should build both pipelines from one plugin factory', () => {
        expect(source).toContain("from '../../mdx.plugins.ts'");
        // The parameter carries a type annotation since SDD-L11-T6 moved this module to
        // TypeScript, so the destructuring is matched without pinning what follows it.
        expect(plugins).toMatch(/export const remarkPlugins = \(\{ autoImport \}/);
    });

    // "~1M requests" in prose must never pair up into strikethrough.
    it('should disable single-tilde strikethrough', () => {
        expect(plugins).toMatch(/remarkGfm,\s*\{\s*singleTilde:\s*false\s*\}/);
    });
});
