import type { Metadata } from 'next'
import { getDictionary } from '../dictionaries'
import CommentsContent from './comments-content'

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return {
    title: `${dict.comments.breadcrumb} - ${dict.seo.title}`,
    description: 'Web application comments, allows users to leave comments on the content of the page',
  }
}

export default async function CommentsPage({ params }: Props) {
  const { lang } = await params
  
  return <CommentsContent lang={lang} />
}
