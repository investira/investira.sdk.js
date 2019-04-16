const { isNumber, isString } = require('./validators');

const numbers = {
    PICircle: Math.PI * 2,
    PICircleFactor: this.PICircle / 100,

    /**
     * Retorna valor arrendodado
     *
     * @param {number} pValue Valor
     * @param {number} pDecimals Quantidade de casas decimais
     * @returns Valor arrendodado
     */
    round: (pValue, pDecimals) => {
        if (isNaN(pValue)) {
            return null;
        }
        const xP = Math.pow(10, pDecimals);
        let xValue = Number(Math.round(pValue * xP).toPrecision(16)); //Precision para evitar ERRO ex: 123459 * 100 = 123458.99999999999
        xValue = Math[xValue < 0 ? 'ceil' : 'floor'](xValue);
        return xValue / xP;
    },

    /**
     * Retorna valor truncado
     *
     * @param {number} pValue Valor
     * @param {number} pDecimals Quantidade de casas decimais
     * @returns Valor truncado
     */
    trunc: (pValue, pDecimals) => {
        if (isNaN(pValue)) {
            return null;
        }
        const xP = Math.pow(10, pDecimals);
        let xValue = Number((pValue * xP).toPrecision(16)); //Precision para evitar ERRO ex: 123459 * 100 = 123458.99999999999
        xValue = Math[xValue < 0 ? 'ceil' : 'floor'](xValue);
        return xValue / xP;
    },

    /**
     * Converte pValue para number
     *
     * @param {*} pValue Valor a ser convertido
     * @returns {number}
     */
    toNumber: pValue => {
        if (isNumber(pValue)) {
            return pValue;
        }
        if (isString(pValue)) {
            // pValue = pValue.replaceAll(dbsfaces.groupSeparator, "");
            // pValue = pValue.replaceAll(dbsfaces.decimalSeparator, ".");
            return parseFloat(pValue);
        }
        return null;
    }
};

module.exports = numbers;
