import type { Metadata } from 'next'
import { getDictionary } from './dictionaries'
import ClientLayout from './client-layout'

type Props = {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return {
    title: dict.seo.title,
    description: dict.seo.description,
  }
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return (
    <div lang={lang}>
      <ClientLayout dict={dict} lang={lang}>
        {children}
      </ClientLayout>
    </div>
  )
}
