const { stringify } = require('flatted');
const { isString, isEmpty } = require('./validators');
const { toArray } = require('./arrays');

const { InvalidData } = require('../messages/DataErrors');
const toTitleCaseIgnore = ['de', 'da', 'do', 'd', 'e', 'of', 'for', 'and'];
const toTitleCaseFullUpperCase = [
    'i',
    'ii',
    'iii',
    'iv',
    'v',
    'vi',
    'vii',
    'viii',
    'ix',
    'x',
    'xi',
    'xii',
    'xiii',
    'xiv',
    'xv',
    'xvi',
    'xvii',
    'xviii',
    'xix',
    'xx'
];

const toTitleCaseSeparators = ["'", '`', '.', '-', '(', ')', ':', ',', ';'];
const strings = {
    /**
     * Substitui a ocorrência de uma string por outra
     *
     * @param {string} pSource String origem
     * @param {string} pOld String antiga
     * @param {string} pNew String nova
     * @returns {string}
     */
    replaceAll: (pSource, pOld, pNew) => {
        if (!isString(pSource)) {
            return pSource;
        }
        return pSource.replace(new RegExp(strings.escapeRegExp(pOld), 'g'), pNew);
    },

    escapeRegExp: pSource => {
        return pSource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Remove primeiro e último caracter da string
     *
     * @param {string} pString
     * @returns {string}
     */
    removeEnclosure: pString => {
        if (!isString(pString)) {
            throw new InvalidData('[spellChecker.checkTitleCase] is not a string [' + JSON.stringify(pString) + ']');
        }
        if (pString.length < 2) {
            return pString;
        }
        return pString.slice(1, -1);
    },
    /**
     * Retorna objeto {first, middle, last} contendo as partes do nome já formatada como nome próprio
     *
     * @param {string} pFullName
     * @returns
     */
    splitFullName: pFullName => {
        let xName = {
            first: '',
            middle: '',
            last: ''
        };
        if (isEmpty(pFullName)) {
            return xName;
        }
        if (!isString(pFullName)) {
            throw new InvalidData('[spellChecker.checkTitleCase] is not a string [' + JSON.stringify(pFullName) + ']');
        }
        let xSplit = strings.toTitleCase(pFullName).split(' ');
        if (xSplit.length >= 1) {
            xName.first = xSplit[0];
            xSplit.shift();
        }
        if (xSplit.length >= 2) {
            xName.last = xSplit[xSplit.length - 1];
            xSplit.pop();
            xName.middle = xSplit.join(' ');
        } else if (xSplit.length >= 1) {
            xName.last = xSplit[0];
            xName.middle = null;
        }
        return xName;
    },

    /**
     * Retorna uma string formatada como nome próprio, ou seja, com a primeira letra de cada palavra em maiúscula e as outras letras em minúscula, exceto palavras especiais que devem ser mantidas maiúsculas.
     *
     * @param {string} pString
     * @returns
     */
    toTitleCase: pString => {
        if (isEmpty(pString)) {
            return pString;
        }
        if (!isString(pString)) {
            throw new InvalidData('[spellChecker.checkTitleCase] is not a string [' + JSON.stringify(pString) + ']');
        }
        let xString = pvtoTitleCase(pString);
        for (const xSepatator of toTitleCaseSeparators) {
            xString = pvtoTitleCase(xString, xSepatator);
        }
        return xString;
    },
    /**
     * Retorna um objeto com os paramentos da querystring
     *
     * @param {string} pString
     * @returns {object}
     */
    querystringToObject: pString => {
        if (isEmpty(pString)) {
            return {};
        }
        if (!isString(pString)) {
            throw new InvalidData('[spellChecker.checkTitleCase] is not a string [' + JSON.stringify(pString) + ']');
        }

        const xQueryParams = decodeURI(pString).split('?')[1].split('&');
        let xParams = {};

        xQueryParams.forEach(pParam => {
            const xParam = pParam.split('=');
            xParams[xParam[0]] = xParam[1];
        });

        return xParams;
    },

    /**
     * Retorna a string sem espaços no inicio e fim e sem múltiplos espaços
     *
     * @param {string} pString
     * @returns {string}
     */
    whitespacesCleaner: pString => {
        if (isEmpty(pString)) {
            return pString;
        }
        return pString.trim().replace(/\s+/g, ' ');
    },

    /**
     * Retorna somente os alphanumericos e espaços
     *
     * @param {string} pString
     * @return {string}
     */
    onlyAlphas: pString => {
        if (!pString) {
            return null;
        }
        return pString
            .replace(/[^a-zA-Z\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    },

    /**
     * Retorna array com palavras ou frases para serem utlizadas em condição LIKE.
     * Frases devem ser separadas por vígula.
     * ex:
     * - "abc def" = ['%abc%','%def%']
     * - "abc def," = ['%abc def%']
     * - "abc def,ghi" = ['%abc def%','%ghi%']
     *
     * @param {string} pString
     * @returns {Array}
     */
    stringToQuery: pString => {
        return toArray(pString, ',', '%', '%');
    },

    /**
     * Retorna Strginfy do JSON
     *
     * @param {object} pValue
     * @param {object} pReplacer
     * @param {number} pSpace
     * @returns {string}
     */
    stringify: (pValue, pReplacer, pSpace) => {
        return stringify(pValue, pReplacer, pSpace);
    },

    /**
     * Retorna palavas separadas pelo separador informado e a última separada pelo último separador informado
     *
     * @param {Array} pWords
     * @param {string} [pSeparator=', ']
     * @param {string} [pLastSeparator=' e ']
     * @returns {String}
     */
    joinWords: (pWords, pSeparator = ', ', pLastSeparator = ' e ') => {
        if (!Array.isArray(pWords) || pWords.length === 0) {
            return '';
        }
        if (pWords.length === 1) {
            return pWords[0];
        }
        const xAllTheRest = pWords.slice(0, -1);
        const xLastWord = pWords[pWords.length - 1];
        return xAllTheRest.join(pSeparator) + (pLastSeparator || ' ') + xLastWord;
    }
};

module.exports = strings;

/**
 * Retorna uma string formatada como nome próprio, ou seja, com a primeira letra de cada palavra em maiúscula e as outras letras em minúscula, exceto palavras especiais que devem ser mantidas maiúsculas.
 *
 * @param {string} pString - A string a ser formatada.
 * @param {string} [pSplit=' '] - O separador utilizado para dividir a string em palavras. Por padrão, é um espaço em branco.
 * @returns {string} - A string formatada como nome próprio.
 */
const pvtoTitleCase = (pString, pSplit) => {
    // Define o separador padrão e converte a string para minúsculas, se o separador não foi especificado
    if (!pSplit) {
        pSplit = ' ';
        pString = pString.toLocaleLowerCase();
    }
    // Divide a string em palavras e separa a primeira palavra da lista
    const xPalavras = pString.split(pSplit);
    const xPrimeira = xPalavras.shift();
    // Formata as palavras restantes e as une em uma única string
    const xPalavrasFormatadas = xPalavras.map(pWord => {
        if (pSplit === ' ' && toTitleCaseIgnore.includes(pWord)) {
            // Mantém a palavra em minúsculas, se for uma palavra ignorada no início de uma frase
            return pWord;
        } else if (toTitleCaseFullUpperCase.includes(pWord)) {
            // Mantém a palavra em maiúsculas, se for uma palavra especial
            return pWord.toUpperCase();
        } else {
            // Formata a palavra normalmente
            return pWord.charAt(0).toUpperCase() + pWord.slice(1);
        }
    });
    // Retorna a primeira palavra formatada e as palavras restantes unidas em uma única string, separadas pelo separador especificado
    return [xPrimeira.charAt(0).toUpperCase() + xPrimeira.slice(1), ...xPalavrasFormatadas].join(pSplit);
};
