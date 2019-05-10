const strings = {
    replaceAll: (pSource, pOld, pNew) => {
        return pSource.replace(
            new RegExp(strings.escapeRegExp(pOld), 'g'),
            pNew
        );
    },
    escapeRegExp: pSource => {
        return pSource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Retorna objeto {first, middle, last} contendo as partes do nome já formatada como nome próprio
     *
     * @param {*} pFullName
     * @returns
     */
    splitFullName: pFullName => {
        let xSplit = strings.toTitleCase(pFullName).split(' ');
        let xName = {
            first: '',
            middle: '',
            last: ''
        };
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

    toTitleCase: pString => {
        const xIgnore = [
            'I',
            'II',
            'III',
            'IV',
            'V',
            'de',
            'da',
            'd',
            'e',
            'of',
            'for',
            'and'
        ];
        return pString.replace(/(\w)(\\H*)/g, (pWord, pI, pR) => {
            if (xIgnore.includes(pWord)) {
                return pWord;
            } else {
                return pI.toUpperCase() + (pR != null ? pR : '');
            }
        });
    }
};

module.exports = strings;
