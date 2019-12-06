const { dataDictionaries } = require('investira.data');
const { toTitleCase, replaceAll } = require('../utils/strings');
const { isString, isEmpty } = require('../utils/validators');
const { InvalidData } = require('../messages/DataErrors');
const spellChecker = {
    locale: 'br',
    /**
     * Correção do texto
     *
     * @param {string} pString
     * @returns {string} Texto corrigido
     */
    check: pString => {
        if (isEmpty(pString)) {
            return pString;
        }
        if (!isString(pString)) {
            throw new InvalidData('[spellChecker.check] Not a string [' + JSON.stringify(pString) + ']');
        }
        const xLocale = spellChecker.locale.slice(-2).toLowerCase();
        const xDictionary = dataDictionaries[xLocale];
        if (!xDictionary) {
            throw 'Invalid locale';
        }
        let xText = pString.replace(/\s\s+/g, ' ');
        xText = pvCheckSyllables(xText, xDictionary);
        xText = pvCheckWords(xText, xDictionary);
        xText = pvCheckEndsWith(xText, xDictionary);
        xText = pvCheckPhrases(xText, xDictionary);
        return xText;
    },
    /**
     * Correção do texto
     *
     * @param {string} pString
     * @returns {string} Texto corrigido convertido para TitleCase
     */
    checkTitleCase: pString => {
        if (isEmpty(pString)) {
            return pString;
        }
        if (!isString(pString)) {
            throw new InvalidData('[spellChecker.checkTitleCase] Not a string [' + JSON.stringify(pString) + ']');
        }
        let xText = toTitleCase(pString);
        return spellChecker.check(xText);
    }
};

/**
 * Correção de silabas
 *
 * @param {string} pString
 * @param {object} pDictionary
 * @returns
 */
const pvCheckSyllables = (pString, pDictionary) => {
    const xDictionary = pDictionary.syllables;
    let xText = pString;
    for (const xMistake in xDictionary) {
        xText = replaceAll(xText, xMistake, xDictionary[xMistake]);
    }
    return xText;
};

/**
 * Correção de palavras
 *
 * @param {string} pString
 * @param {object} pDictionary
 * @returns
 */
const pvCheckWords = (pString, pDictionary) => {
    const xDictionary = pDictionary.words;
    const xWords = pString.split(' ');
    let xText = '';
    //Loop em array
    for (let xWord of xWords) {
        //Loop em objeto
        for (const xMistake in xDictionary) {
            if (xWord === xMistake) {
                xWord = replaceAll(xWord, xMistake, xDictionary[xMistake]);
                break;
            } else if (xWord.toLocaleLowerCase() === xDictionary[xMistake].toLocaleLowerCase()) {
                //Força o Case do dicionário
                xWord = xDictionary[xMistake];
                break;
            }
        }
        xText += ' ' + xWord.trim();
    }

    return xText.trim();
};

/**
 * Correção de frases
 *
 * @param {string} pString
 * @param {object} pDictionary
 * @returns
 */
const pvCheckEndsWith = (pString, pDictionary) => {
    const xDictionary = pDictionary.endsWith;
    let xText = pString;
    for (const xMistake in xDictionary) {
        if (pString.endsWith(xMistake)) {
            xText = pString.substr(0, pString.length - xMistake.length) + xDictionary[xMistake];
            break;
        }
    }
    return xText;
};

/**
 * Correção de frases
 *
 * @param {string} pString
 * @param {object} pDictionary
 * @returns
 */
const pvCheckPhrases = (pString, pDictionary) => {
    const xDictionary = pDictionary.phrases;
    let xText = pString;
    for (const xMistake in xDictionary) {
        xText = replaceAll(xText, xMistake, xDictionary[xMistake]);
    }
    return xText;
};

module.exports = spellChecker;
