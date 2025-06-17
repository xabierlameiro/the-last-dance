import type { Metadata } from 'next'
import { getDictionary } from '../dictionaries'
import SettingsContent from './settings-content'
import { DialogProvider } from '@/context/dialog'

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return {
    title: `${dict.settings.title} - ${dict.seo.title}`,
    description: `${dict.settings.title}. ${dict.settings.desc}`,
  }
}

export default async function SettingsPage({ params }: Props) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return (
    <DialogProvider>
      <SettingsContent dict={dict} />
    </DialogProvider>
  )
}
