// public static String corretorOrtografico(String pTexto){
// 	if (pTexto==null){
// 		return null;
// 	}
// 	String xTexto = toProper(pTexto);
// 	if(wDicionarioSilaba.isEmpty()){
// 		pvDicionarioInit();
// 	}
// 	//Retira duplo espaço
// 	xTexto = DBSString.changeStr(xTexto, "  ", " ", false);
// 	//System.out.println(pTexto);
// 	xTexto = pvCorretorOrtograticoSilaba(xTexto);
// 	//System.out.println(pTexto);
// 	xTexto = pvCorretorOrtograficoPalavra(xTexto);
// 	//System.out.println(pTexto);
// 	xTexto = pvCorretorOrtograficoFrase(xTexto);
// 	//System.out.println(pTexto);
// 	return xTexto;
// }

const { dataDictionaries } = require('investira.data');
const { toTitleCase, replaceAll } = require('../utils/strings');
const { isEmpty } = require('../utils/validators');
const spellChecker = {
    locale: 'br',
    /**
     * Correção do texto
     *
     * @param {string} pText
     * @returns {string} Texto corrigido
     */
    check: pText => {
        if (isEmpty(pText)) {
            return pText;
        }
        const xLocale = spellChecker.locale.slice(-2).toLowerCase();
        const xDictionary = dataDictionaries[xLocale];
        if (!xDictionary) {
            throw 'Invalid locale';
        }
        let xText = pText.replace(/\s\s+/g, ' ');
        xText = pvCheckSyllables(xText, xDictionary);
        xText = pvCheckWords(xText, xDictionary);
        xText = pvCheckPhrases(xText, xDictionary);
        return xText;
    },
    /**
     * Correção do texto
     *
     * @param {string} pText
     * @returns {string} Texto corrigido convertido para TitleCase
     */
    checkTitleCase: pText => {
        if (isEmpty(pText)) {
            return pText;
        }
        let xText = toTitleCase(pText);
        return spellChecker.check(xText);
    }
};

const pvCheckSyllables = (pText, pDictionary) => {
    const xDictionary = pDictionary.syllables;
    const xMistakes = Object.keys(xDictionary);
    let xText = pText;
    for (const xMistake of xMistakes) {
        xText = replaceAll(xText, xMistake, xDictionary[xMistake]);
    }
    return xText;
};

const pvCheckWords = (pText, pDictionary) => {
    const xDictionary = pDictionary.words;
    const xMistakes = Object.keys(xDictionary);
    const xWords = pText.split(' ');
    let xText = '';
    for (let xWord of xWords) {
        for (const xMistake of xMistakes) {
            if (xWord === xMistake) {
                xWord = replaceAll(xWord, xMistake, xDictionary[xMistake]);
                break;
            }
        }
        xText += ' ' + xWord;
    }

    return xText.trim();
};

const pvCheckPhrases = (pText, pDictionary) => {
    const xDictionary = pDictionary.phrases;
    const xMistakes = Object.keys(xDictionary);
    let xText = pText;
    for (const xMistake of xMistakes) {
        xText = replaceAll(xText, xMistake, xDictionary[xMistake]);
    }
    return xText;
};

module.exports = spellChecker;
