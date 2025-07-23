import 'server-only'

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  es: () => import('./dictionaries/es.json').then((module) => module.default),
  gl: () => import('./dictionaries/gl.json').then((module) => module.default),
}

export const getDictionary = async (locale: string) => {
  const dict = dictionaries[locale as keyof typeof dictionaries]
  if (!dict) {
    return dictionaries.en() // fallback to English
  }
  return dict()
}
