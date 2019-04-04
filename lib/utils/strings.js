const strings = {
    replaceAll: (pSource, pOld, pNew) => {
        return pSource.replace(
            new RegExp(strings.escapeRegExp(pOld), 'g'),
            pNew
        );
    },
    escapeRegExp: pSource => {
        return pSource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};

module.exports = strings;
