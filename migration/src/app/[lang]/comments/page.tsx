import type { Metadata } from 'next'
import { getDictionary } from '../dictionaries'
import CommentsContent from './comments-content'
import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import html from 'remark-html'

const COMMENTS_PATH = path.join(process.cwd(), 'data/comments')

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return {
    title: dict.comments.seo?.title || `${dict.comments.breadcrumb} - ${dict.seo.title}`,
    description: dict.comments.seo?.description || 'Web application comments, allows users to leave comments on the content of the page',
  }
}

export default async function CommentsPage({ params }: Props) {
  const { lang } = await params
  
  // Look for language-specific file first, then fallback to default
  const filePath = path.join(COMMENTS_PATH, `index.${lang}.mdx`)
  const fallbackPath = path.join(COMMENTS_PATH, 'index.mdx')
  
  let content = ''
  
  try {
    let mdxContent = ''
    
    if (fs.existsSync(filePath)) {
      mdxContent = fs.readFileSync(filePath, 'utf8')
    } else if (fs.existsSync(fallbackPath)) {
      mdxContent = fs.readFileSync(fallbackPath, 'utf8')
    } else {
      // Default content if no file exists
      mdxContent = '```text\n# No content available\n```'
    }
    
    // Process MDX content to HTML using remark
    const processedContent = await remark()
      .use(html)
      .process(mdxContent)
    
    content = processedContent.toString()
  } catch (error) {
    console.error('Error processing comments content:', error)
    content = '<pre>Error loading content</pre>'
  }
  
  return <CommentsContent lang={lang} content={content} />
}
