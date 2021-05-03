import { readFileSync, readdirSync } from 'fs'

export type LocalizedStringsProvider = {
    (key: string): LocalizedStrings
}

export type LocalizedStrings = {
    (key: string): string
}

const localeTranslator: Record<string, string> = {
    'sv': 'sv_SE',
    'da': 'da_DK',
    'nb': 'nb_NO',
    'nn': 'nb_NO'
}

const readFiles = (): LanguageFiles => {
    const files = readdirSync(".")
        .filter(file => file.endsWith('.json'))

    const result: LanguageFiles = {}
    files.forEach(file => {
        const language = file.replace('.json', '')
        const content = JSON.parse(readFileSync(file, 'utf8'))
        result[language] = content
    })

    return result
}

const files = readFiles()


export const localizedStringsProvider: LocalizedStringsProvider = (
    locale: string
): LocalizedStrings => {
    locale = locale.replace('-', '_')
    const match = files[locale] || files[localeTranslator[locale]]
    if (!match) return (key) => key
    return (key: string) => match[key] || key
}

type LanguageFiles = {
    [locale:string] : { 
        [key:string] : string | undefined 
    } | undefined
}