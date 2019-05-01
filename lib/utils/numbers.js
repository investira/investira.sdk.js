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
    },

    /**
     * Subtração com maior precisão
     *
     * @param {number} pValue1
     * @param {number} pValue2
     * @returns Resultado da subtração
     */
    add: (pValue1, pValue2) => {
        return pvCalcAdd(pValue1, pValue2);
    },
    /**
     * Subtração com maior precisão
     *
     * @param {number} pValue1
     * @param {number} pValue2
     * @returns Resultado da subtração
     */
    sub: (pValue1, pValue2) => {
        return pvCalcSub(pValue1, pValue2);
    },
    /**
     * Subtração com maior precisão
     *
     * @param {number} pValue1
     * @param {number} pValue2
     * @returns Resultado da subtração
     */
    mul: (pValue1, pValue2) => {
        return pvCalcMul(pValue1, pValue2);
    },
    /**
     * Subtração com maior precisão
     *
     * @param {number} pValue1
     * @param {number} pValue2
     * @returns Resultado da subtração
     */
    div: (pValue1, pValue2) => {
        return pvCalcDiv(pValue1, pValue2);
    },
    /**
     * Retorna objecto com número serado em inteiros e decimais
     *
     * @param {number} pValue
     * @returns {object} {int, dec}
     */
    apart: pValue => {
        if (Number.isInteger(pValue)) {
            return { int: pValue + '', dec: '0' };
        }
        const xDec = (pValue + '').split('.');
        // const xDec = pValue.toFixed(19).split('.');
        if (xDec.length > 1) {
            return { int: xDec[0], dec: xDec[1] };
        } else {
            return { int: '0', dec: xDec[0] };
        }
    }
};

/**
 * Faz cálculo com maior precisão
 *
 * @param {number} pValue1
 * @param {number} pValue2
 * @param {function} pOperation Função que fará a operação
 * @returns
 */
const pvCalc = (pValue1, pValue2, pOperation) => {
    const xValue1Str = numbers.apart(pValue1);
    const xValue2Str = numbers.apart(pValue2);
    // const xValue1Str = {
    //     int: xValue1Apart.int + '',
    //     dec: xValue1Apart.dec + ''
    //     // dec: xValue1Apart.dec != 0 ? xValue1Apart.dec + '' : ''
    // };
    // const xValue2Str = {
    //     int: xValue2Apart.int + '',
    //     dec: xValue2Apart.dec + ''
    // };
    const xMaxInt = Math.max(xValue1Str.int.length, xValue2Str.int.length);
    let xMaxDec = Math.max(xValue1Str.dec.length, xValue2Str.dec.length);
    const xOver = xMaxInt + xMaxDec - 20;
    if (xOver > 0 && xMaxDec > xOver) {
        xMaxDec -= xOver;
        xValue1Str.dec = xValue1Str.dec.substring(0, xMaxDec);
        xValue2Str.dec = xValue2Str.dec.substring(0, xMaxDec);
    }
    if (xMaxDec == 0) {
        return pOperation(pValue1, pValue2, 1);
    }
    //'Multiplica por 10^xMaxDec
    xValue1Str.dec =
        xValue1Str.dec + '0'.repeat(xMaxDec - xValue1Str.dec.length);
    xValue2Str.dec =
        xValue2Str.dec + '0'.repeat(xMaxDec - xValue2Str.dec.length);
    //Faz cálculo básico
    const xResult = pOperation(
        Number(xValue1Str.int + xValue1Str.dec),
        Number(xValue2Str.int + xValue2Str.dec),
        Math.pow(10, xMaxDec)
    );
    return xResult;
};
const pvCalcAdd = (pValue1, pValue2) => {
    return pvCalc(pValue1, pValue2, (rValue1, rValue2, pReducer) => {
        return (rValue1 + rValue2) / pReducer;
    });
};
const pvCalcSub = (pValue1, pValue2) => {
    return pvCalc(pValue1, pValue2, (rValue1, rValue2, pReducer) => {
        return (rValue1 - rValue2) / pReducer;
    });
};
const pvCalcMul = (pValue1, pValue2) => {
    return pvCalc(pValue1, pValue2, (rValue1, rValue2, pReducer) => {
        return (rValue1 * rValue2) / Math.pow(pReducer, 2);
    });
};
const pvCalcDiv = (pValue1, pValue2) => {
    return pvCalc(pValue1, pValue2, (rValue1, rValue2, _pReducer) => {
        return rValue1 / rValue2;
    });
};

module.exports = numbers;
