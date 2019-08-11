const { isString, isEmpty } = require('./validators');
const { InvalidData } = require('../messages/DataErrors');
const toTitleCaseIgnore = ['I', 'II', 'III', 'IV', 'V', 'de', 'da', 'do', 'd', 'e', 'of', 'for', 'and'];
const toTitleCaseFullUpperCase = ['i', 'ii', 'iii', 'iv', 'v'];

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
            throw new InvalidData('[spellChecker.checkTitleCase] Not a string [' + JSON.stringify(pString) + ']');
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
            throw new InvalidData('[spellChecker.checkTitleCase] Not a string [' + JSON.stringify(pFullName) + ']');
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
     * Retorna string formatada como nome próprio
     *
     * @param {string} pString
     * @returns
     */
    toTitleCase: pString => {
        if (isEmpty(pString)) {
            return pString;
        }
        if (!isString(pString)) {
            throw new InvalidData('[spellChecker.checkTitleCase] Not a string [' + JSON.stringify(pString) + ']');
        }
        // return pString.replace(/(\w)(\w*)/gu, (_, i, r) => {
        //     let j = i.toUpperCase() + (r != null ? r : '');
        //     return xIgnore.indexOf(j.toLowerCase()) < 0 ? j : j.toLowerCase();
        // });
        let xLista = pString.split(' ');
        let xResult = '';
        for (let xPalavra of xLista) {
            if (toTitleCaseIgnore.includes(xPalavra)) {
                xResult += xPalavra + ' ';
            } else if (toTitleCaseFullUpperCase.includes(xPalavra)) {
                xResult += xPalavra.toUpperCase() + ' ';
            } else {
                xResult += xPalavra.charAt(0).toUpperCase() + xPalavra.slice(1).toLowerCase() + ' ';
            }
        }
        return xResult.trim();
    }
};

module.exports = strings;
