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
        }
        xName.middle = xSplit.join(' ');
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
        ]; //(\X+)
        return pString.replace(/(\w)(\w*)/gu, (_, i, r) => {
            let j = i.toUpperCase() + (r != null ? r : '');
            return xIgnore.indexOf(j.toLowerCase()) < 0 ? j : j.toLowerCase();
        });
    }
};

module.exports = strings;
