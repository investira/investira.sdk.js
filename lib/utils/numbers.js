const { isNumber, isString } = require('./validators');
const PRECISION = 16;
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
        let xValue = Number(Math.round(pValue * xP));
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
        let xValue = Number(pValue * xP);
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
        return pvCalc(pValue1, pValue2, (rValue1, rValue2, pReducer) => {
            return (rValue1 + rValue2) / pReducer;
        });
    },
    /**
     * Subtração com maior precisão
     *
     * @param {number} pValue1
     * @param {number} pValue2
     * @returns Resultado da subtração
     */
    sub: (pValue1, pValue2) => {
        return pvCalc(pValue1, pValue2, (rValue1, rValue2, pReducer) => {
            return (rValue1 - rValue2) / pReducer;
        });
    },
    /**
     * Subtração com maior precisão
     *
     * @param {number} pValue1
     * @param {number} pValue2
     * @returns Resultado da subtração
     */
    mul: (pValue1, pValue2) => {
        return pvCalc(pValue1, pValue2, (rValue1, rValue2, pReducer) => {
            return (rValue1 * rValue2) / Math.pow(pReducer, 2);
        });
    },
    /**
     * Subtração com maior precisão
     *
     * @param {number} pValue1
     * @param {number} pValue2
     * @returns Resultado da subtração
     */
    div: (pValue1, pValue2) => {
        return pvCalc(pValue1, pValue2, (rValue1, rValue2, _pReducer) => {
            return rValue1 / rValue2;
        });
    },
    /**
     * Retorna objecto com número serado em inteiros e decimais
     *
     * @param {number} pValue
     * @returns {object} {int, dec}
     */
    apart: pValue => {
        let xValue = { sign: '' };

        if (pValue == 0) {
            xValue.sign = '';
        } else if (Math.sign(pValue) == -1) {
            xValue.sign = '-';
        }
        let xValueStr = Math.abs(pValue) + '';
        //Retorna se for inteiro
        if (Number.isInteger(pValue)) {
            xValue.int = xValueStr;
            xValue.dec = '0';
            return xValue;
        }
        //Converte para string contendo todos os números se for scientific notation
        const xSN = xValueStr.indexOf('e');
        if (xSN > 0) {
            xValueStr = Math.abs(pValue).toFixed(
                Number(xValueStr.substr(xSN + 2, 10))
            );
            xValueStr = xValueStr.replace(/0+$/, '');
        }
        //Separa inteiro de decimal
        const xDec = xValueStr.split('.');
        if (xDec.length > 1) {
            xValue.int = xDec[0];
            xValue.dec = xDec[1];
        } else {
            xValue.int = '0';
            xValue.dec = xDec[0];
        }
        return xValue;
    }
};

/**
 * Faz cálculo com maior precisão, fazendo a conta como sendo números inteiros e depois retorna para fracionário
 *
 * @param {number} pValue1
 * @param {number} pValue2
 * @param {function} pOperation Função que fará a operação
 * @returns
 */
const pvCalc = (pValue1, pValue2, pOperation) => {
    if (Number.isInteger(pValue1) && Number.isInteger(pValue2)) {
        return pOperation(pValue1, pValue2, 1);
    }
    const xValue1Str = numbers.apart(pValue1);
    const xValue2Str = numbers.apart(pValue2);
    const xMaxInt = Math.max(xValue1Str.int.length, xValue2Str.int.length);
    let xMaxDec = Math.max(xValue1Str.dec.length, xValue2Str.dec.length);
    const xOver = xMaxInt + xMaxDec - PRECISION;
    if (xOver > 0 && xMaxDec > xOver) {
        xMaxDec -= xOver;
        xValue1Str.dec = xValue1Str.dec.substring(0, xMaxDec);
        xValue2Str.dec = xValue2Str.dec.substring(0, xMaxDec);
    }

    //Como se estivesse multiplicando os valores por 10^xMaxDec,
    //mas concatena os zeros para evitar um possível residuo no cálculo
    xValue1Str.dec =
        xValue1Str.dec + '0'.repeat(xMaxDec - xValue1Str.dec.length);
    xValue2Str.dec =
        xValue2Str.dec + '0'.repeat(xMaxDec - xValue2Str.dec.length);
    //Faz cálculo básico
    const xResult = pOperation(
        Number(xValue1Str.sign + xValue1Str.int + xValue1Str.dec),
        Number(xValue2Str.sign + xValue2Str.int + xValue2Str.dec),
        Math.pow(10, xMaxDec)
    );
    return xResult;
};

module.exports = numbers;
