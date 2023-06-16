const { isNumber, isString, isEmpty, isNull } = require('./validators');

const PRECISION = 16;
const numbers = {
    PICircle: Math.PI * 2,
    PICircleFactor: this.PICircle / 100,

    /**
     * Retorna valor arrendodado
     *
     * @param {number} pValue Valor
     * @param {number} pDecimals Quantidade de casas decimais
     * @returns {number} Valor arrendodado
     */
    round: (pValue, pDecimals) => {
        if (isNaN(pValue)) {
            return null;
        }
        const xP = Math.pow(10, pDecimals);
        let xValue = Number(Math.round(numbers.mul(pValue, xP)));
        xValue = Math[xValue < 0 ? 'ceil' : 'floor'](xValue);
        return xValue / xP;
    },

    /**
     * Retorna valor truncado
     *
     * @param {number} pValue Valor
     * @param {number} pDecimals Quantidade de casas decimais
     * @returns {number} Valor truncado
     */
    trunc: (pValue, pDecimals) => {
        if (isNaN(pValue)) {
            return null;
        }
        const xP = Math.pow(10, pDecimals);
        let xValue = numbers.mul(pValue, xP);
        xValue = Math[xValue < 0 ? 'ceil' : 'floor'](xValue);
        return xValue / xP;
    },

    /**
     * Retorna somente os números dentro da string
     *
     * @param {string} pString
     * @return {string}
     */
    onlyNumbers: pString => {
        if (isNull(pString)) {
            return null;
        }
        return String(pString).replace(/[^\d]/g, '');
    },

    /**
     * Converte pValue para number
     *
     * @param {*} pValue Valor a ser convertido
     * @param {boolean} [pDecimalPointIsComma=false] Indica se ponto decimal do número recebido é uma vírgula
     * @returns {number}
     */
    toNumber: (pValue, pDecimalPointIsComma = false) => {
        if (isNumber(pValue)) {
            return pValue;
        }
        if (isString(pValue) && pValue !== 'null' && pValue !== 'undefined') {
            pValue = pValue.trim();
            if (pValue !== '') {
                if (pDecimalPointIsComma) {
                    //Exclui todos os pontos e substitui vírgula por ponto
                    pValue = pValue.replace(/\./g, '').replace(/\,/g, '.');
                } else {
                    //Exclui todos as vírgulas
                    pValue = pValue.replace(/\,/g, '');
                }
                return parseFloat(pValue);
            }
        }
        return null;
    },

    /**
     * Converte pValue para string retirando os zeros a direita
     *
     * @param {string|number} pValue Valor a ser convertido
     * @returns {string}
     */
    toSqlNumber: pValue => {
        // @ts-ignore
        if (isNaN(pValue)) {
            return null;
        }

        return String(pValue).replace(/^([\d,]+)$|^([\d,]+)\.0*$|^([\d,]+\.[0-9]*?)0*$/, '$1$2$3');
    },

    /**
     * Subtração com maior precisão
     *
     * @param {number} pValue1
     * @param {number} pValue2
     * @returns {number} Resultado da subtração
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
     * @returns {number} Resultado da subtração
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
     * @returns {number} Resultado da subtração
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
     * @returns {number} Resultado da subtração
     */
    div: (pValue1, pValue2) => {
        return pvCalc(pValue1, pValue2, (rValue1, rValue2, _pReducer) => {
            return rValue1 / rValue2;
        });
    },
    /**
     * Exponenciação
     *
     * @param {number} pValue1
     * @param {number} pValue2
     * @returns {number} Resultado a exponenciação
     */
    pow: (pValue1, pValue2) => {
        return Math.pow(pValue1, pValue2);
    },

    /**
     * Retorna o somatório de itens contidos em um array
     * @deprecated Utilizar <code>sum</code>
     * @param {array} pValues
     * @returns {number}
     */
    sumValues: pValues => {
        return numbers.sum(pValues);
    },

    /**
     * Retorna o somatório dos valores contidos em pValue
     *
     * @param {array} pValues
     * @returns {number}
     */
    sum: pValues => {
        if (!pValues) {
            return null;
        }
        return pValues.reduce((a, b) => {
            return numbers.add(a, b);
        }, 0);
    },

    /**
     * Retorna a média ponderada dos valores e seus respectivos pesos
     *
     * @param {array} pValues
     * @param {array} pWeights
     * @returns {number}
     */
    weightedMean: (pValues, pWeights) => {
        const xArray = pValues.map((pValue, index) => {
            return numbers.mul(pValue, pWeights[index]);
        });
        return numbers.div(numbers.sum(xArray), numbers.sum(pWeights));
    },

    /**
     * Retorna o valor médio a partir dos valores contidos em pValue
     *
     * @param {array} pValues
     * @returns {number}
     */
    avg: pValues => {
        if (!pValues) {
            return null;
        }
        return numbers.div(numbers.sum(pValues), pValues.length);
    },

    /**
     * Retorna a quantidade de casas decimais
     *
     * @param {number} pValue
     * @returns {number}
     */
    countDecimals: pValue => {
        var match = ('' + pValue).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) {
            return 0;
        }
        return Math.max(
            0,
            // Number of digits right of decimal point.
            (match[1] ? match[1].length : 0) -
                // Adjust for scientific notation.
                (match[2] ? +match[2] : 0)
        );
    },
    /**
     * Retorna objecto com número separado em inteiros e decimais
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
        if (xValueStr.indexOf('e') > -1) {
            xValueStr = Math.abs(pValue).toFixed(numbers.countDecimals(pValue));
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
    },

    /**
     * Interpolação linear
     *
     * @param {number} pPrevious
     * @param {number} pTarget
     * @param {number} pN
     * @returns
     */
    lerp: (pPrevious, pTarget, pN) => {
        return (1 - pN) * pPrevious + pN * pTarget;
    },
    /**
     * Calcula percentil a partir de uma array de numeros e o percentil desejado
     *
     * @param {array} pValues
     * @param {number} pPercentil
     * @returns {number}
     */
    percentile: (pValues, pPercentil) => {
        const xSorted = pValues.sort((pA, pB) => pA - pB);
        const xPos = (xSorted.length - 1) * pPercentil;
        const xBase = Math.floor(xPos);
        const xRest = xPos - xBase;
        if (xSorted[xBase + 1] !== undefined) {
            return xSorted[xBase] + xRest * (xSorted[xBase + 1] - xSorted[xBase]);
        } else {
            return xSorted[xBase];
        }
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
    if (isEmpty(pValue1)) {
        throw Error('Valor1 não informado');
    }
    if (isEmpty(pValue2)) {
        throw Error('Valor2 não informado');
    }
    const xValue1Str = numbers.apart(pValue1);
    const xValue2Str = numbers.apart(pValue2);
    const xMaxDec = Math.max(xValue1Str.dec.length, xValue2Str.dec.length);

    //Como se estivesse multiplicando os valores por 10^xMaxDec,
    //mas concatena os zeros para evitar um possível residuo no cálculo
    xValue1Str.dec = xValue1Str.dec + '0'.repeat(xMaxDec - xValue1Str.dec.length);
    xValue2Str.dec = xValue2Str.dec + '0'.repeat(xMaxDec - xValue2Str.dec.length);
    //Faz cálculo básico
    const xResult = pOperation(
        Number(xValue1Str.sign + xValue1Str.int + xValue1Str.dec),
        Number(xValue2Str.sign + xValue2Str.int + xValue2Str.dec),
        Math.pow(10, xMaxDec)
    );
    return xResult;
};

module.exports = numbers;
