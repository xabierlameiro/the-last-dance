import type { Metadata } from 'next'
import { getDictionary } from '../dictionaries'
import SurveyContent from './survey-content'

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return {
    title: `Survey - ${dict.seo.title}`,
    description: 'User survey to gather feedback about the website experience',
  }
}

export default async function SurveyPage({ params }: Props) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return <SurveyContent dictionary={dict} />
}
