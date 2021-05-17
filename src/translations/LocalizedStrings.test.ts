import { localizedStringsProvider } from "./LocalizedStrings"

describe('LocalizedStrings', () => {

    it('unknown locale will echo strings', () => {
        const strings = localizedStringsProvider('unknown')
    
        const output = strings('CONTRACT_DISPLAY_NAME_NO_HOME_CONTENT_OWN')

        expect(output).toEqual('CONTRACT_DISPLAY_NAME_NO_HOME_CONTENT_OWN')
    })

    it('unknown key will echo strings', () => {
        const strings = localizedStringsProvider('en-NO')
    
        const output = strings('UNKNOWN')

        expect(output).toEqual('UNKNOWN')
    })

    
    it('matching locale and key will produce translation', () => {
        const strings = localizedStringsProvider('en-NO')
    
        const output = strings('CONTRACT_DISPLAY_NAME_NO_HOME_CONTENT_OWN')
        
        expect(output).not.toEqual('CONTRACT_DISPLAY_NAME_NO_HOME_CONTENT_OWN')
    })
})
