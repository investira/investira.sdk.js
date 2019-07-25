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

/**
 * Correção de silabas
 *
 * @param {string} pText
 * @param {object} pDictionary
 * @returns
 */
const pvCheckSyllables = (pText, pDictionary) => {
    const xDictionary = pDictionary.syllables;
    let xText = pText;
    for (const xMistake in xDictionary) {
        xText = replaceAll(xText, xMistake, xDictionary[xMistake]);
    }
    return xText;
};

/**
 * Correção de palavras
 *
 * @param {string} pText
 * @param {object} pDictionary
 * @returns
 */
const pvCheckWords = (pText, pDictionary) => {
    const xDictionary = pDictionary.words;
    const xWords = pText.split(' ');
    let xText = '';
    //Loop em array
    for (let xWord of xWords) {
        //Loop em objeto
        for (const xMistake in xDictionary) {
            if (xWord === xMistake) {
                xWord = replaceAll(xWord, xMistake, xDictionary[xMistake]);
                break;
            }
        }
        xText += ' ' + xWord;
    }

    return xText.trim();
};

/**
 * Correção de frases
 *
 * @param {string} pText
 * @param {object} pDictionary
 * @returns
 */
const pvCheckPhrases = (pText, pDictionary) => {
    const xDictionary = pDictionary.phrases;
    let xText = pText;
    for (const xMistake in xDictionary) {
        xText = replaceAll(xText, xMistake, xDictionary[xMistake]);
    }
    return xText;
};

module.exports = spellChecker;
