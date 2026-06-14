const { isNumber, isString, isEmpty, isNull } = require('./validators');

const PRECISION = 16;

/**
 * Utilitários para operações numéricas, conversões e cálculos com maior precisão.
 */
const numbers = {
    PICircle: Math.PI * 2,
    PICircleFactor: this.PICircle / 100,

    /**
     * Retorna valor arredondado.
     *
     * Usa as funções de precisão do próprio módulo para reduzir resíduos de ponto flutuante.
     *
     * @param {number} pValue Valor.
     * @param {number} pDecimals Quantidade de casas decimais.
     * @returns {number|null} Valor arredondado ou `null` quando `pValue` não for numérico.
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
     * Retorna valor truncado.
     *
     * @param {number} pValue Valor.
     * @param {number} pDecimals Quantidade de casas decimais.
     * @returns {number|null} Valor truncado ou `null` quando `pValue` não for numérico.
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
     * Retorna somente os dígitos existentes no valor informado.
     *
     * @param {string} pString Texto original.
     * @param {Object} [pNullValue=null] Valor retornado quando `pString` for `null`.
     * @return {string|Object}
     */
    onlyNumbers: (pString, pNullValue = null) => {
        if (isNull(pString)) {
            return pNullValue;
        }
        return String(pString).replace(/[^\d]/g, '');
    },

    /**
     * Converte um valor para `number`.
     *
     * Pode tratar números em formato brasileiro quando `pDecimalPointIsComma` for `true`.
     *
     * @param {*} pValue Valor a ser convertido.
     * @param {boolean} [pDecimalPointIsComma=false] Indica se a vírgula representa a casa decimal.
     * @param {Object} [pNullValue=null] Valor retornado quando a conversão não for possível.
     * @returns {number|Object}
     */
    toNumber: (pValue, pDecimalPointIsComma = false, pNullValue = null) => {
        if (isNumber(pValue)) {
            return pValue;
        }
        if (isString(pValue) && pValue !== 'null' && pValue !== 'undefined') {
            pValue = pValue.trim();
            if (pValue !== '') {
                if (pDecimalPointIsComma) {
                    // Exclui separadores de milhar e converte a vírgula decimal para ponto.
                    pValue = pValue.replace(/\./g, '').replace(/\,/g, '.');
                } else {
                    // Exclui vírgulas quando o formato esperado já usa ponto decimal.
                    pValue = pValue.replace(/\,/g, '');
                }
                return parseFloat(pValue);
            }
        }
        return pNullValue;
    },

    /**
     * Converte um número para string removendo zeros desnecessários à direita.
     *
     * O retorno é útil para persistência em SQL sem perda do valor significativo.
     *
     * @param {string|number} pValue Valor a ser convertido.
     * @param {Object} [pNullValue=null] Valor retornado quando `pValue` não for numérico.
     * @returns {string|Object}
     */
    toSqlNumber: (pValue, pNullValue = null) => {
        // @ts-ignore
        if (isNaN(pValue)) {
            return pNullValue;
        }

        return String(pValue).replace(/^([\d,]+)$|^([\d,]+)\.0*$|^([\d,]+\.[0-9]*?)0*$/, '$1$2$3');
    },

    /**
     * Soma dois valores com maior precisão.
     *
     * @param {number} pValue1 Primeiro valor.
     * @param {number} pValue2 Segundo valor.
     * @returns {number} Resultado da soma.
     */
    add: (pValue1, pValue2) => {
        return pvCalc(pValue1, pValue2, (rValue1, rValue2, pReducer) => {
            return (rValue1 + rValue2) / pReducer;
        });
    },
    /**
     * Subtrai dois valores com maior precisão.
     *
     * @param {number} pValue1 Primeiro valor.
     * @param {number} pValue2 Segundo valor.
     * @returns {number} Resultado da subtração.
     */
    sub: (pValue1, pValue2) => {
        return pvCalc(pValue1, pValue2, (rValue1, rValue2, pReducer) => {
            return (rValue1 - rValue2) / pReducer;
        });
    },
    /**
     * Multiplica dois valores com maior precisão.
     *
     * @param {number} pValue1 Primeiro valor.
     * @param {number} pValue2 Segundo valor.
     * @returns {number} Resultado da multiplicação.
     */
    mul: (pValue1, pValue2) => {
        return pvCalc(pValue1, pValue2, (rValue1, rValue2, pReducer) => {
            return (rValue1 * rValue2) / Math.pow(pReducer, 2);
        });
    },
    /**
     * Divide dois valores com maior precisão.
     *
     * @param {number} pValue1 Primeiro valor.
     * @param {number} pValue2 Segundo valor.
     * @returns {number} Resultado da divisão.
     */
    div: (pValue1, pValue2) => {
        return pvCalc(pValue1, pValue2, (rValue1, rValue2, _pReducer) => {
            return rValue1 / rValue2;
        });
    },
    /**
     * Calcula a exponenciação.
     *
     * @param {number} pValue1 Base.
     * @param {number} pValue2 Expoente.
     * @returns {number} Resultado da exponenciação.
     */
    pow: (pValue1, pValue2) => {
        return Math.pow(pValue1, pValue2);
    },

    /**
     * Retorna o somatório de itens contidos em um array.
     *
     * @deprecated Utilizar <code>sum</code>
     * @param {Array} pValues Valores a serem somados.
     * @returns {number|null}
     */
    sumValues: pValues => {
        return numbers.sum(pValues);
    },

    /**
     * Retorna o somatório dos valores contidos no array informado.
     *
     * @param {Array} pValues Valores a serem somados.
     * @returns {number|null}
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
     * Retorna a média ponderada dos valores e seus respectivos pesos.
     *
     * `pValues` e `pWeights` devem possuir o mesmo tamanho.
     *
     * @param {Array} pValues Valores que participarão da média.
     * @param {Array} pWeights Pesos correspondentes a cada valor.
     * @returns {number}
     */
    weightedMean: (pValues, pWeights) => {
        const xArray = pValues.map((pValue, index) => {
            return numbers.mul(pValue, pWeights[index]);
        });
        return numbers.div(numbers.sum(xArray), numbers.sum(pWeights));
    },

    /**
     * Retorna a média aritmética dos valores informados.
     *
     * @param {Array} pValues Valores utilizados no cálculo.
     * @returns {number|null}
     */
    avg: pValues => {
        if (!pValues) {
            return null;
        }
        return numbers.div(numbers.sum(pValues), pValues.length);
    },

    /**
     * Retorna a quantidade de casas decimais do número informado.
     *
     * Considera também números em notação científica.
     *
     * @param {number} pValue Valor a ser analisado.
     * @returns {number}
     */
    countDecimals: pValue => {
        var match = ('' + pValue).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) {
            return 0;
        }
        return Math.max(
            0,
            // Quantidade de dígitos à direita do separador decimal.
            (match[1] ? match[1].length : 0) -
                // Ajuste necessário quando o valor está em notação científica.
                (match[2] ? +match[2] : 0)
        );
    },
    /**
     * Retorna objeto com número separado em sinal, parte inteira e parte decimal.
     *
     * @param {number} pValue Valor a ser separado.
     * @returns {object} Objeto no formato `{ sign, int, dec }`.
     */
    apart: pValue => {
        let xValue = { sign: '' };

        if (pValue == 0) {
            xValue.sign = '';
        } else if (Math.sign(pValue) == -1) {
            xValue.sign = '-';
        }
        let xValueStr = Math.abs(pValue) + '';
        // Para inteiros, a parte decimal sempre será zero.
        if (Number.isInteger(pValue)) {
            xValue.int = xValueStr;
            xValue.dec = '0';
            return xValue;
        }
        // Expande a notação científica para facilitar a separação das partes.
        if (xValueStr.indexOf('e') > -1) {
            xValueStr = Math.abs(pValue).toFixed(numbers.countDecimals(pValue));
            xValueStr = xValueStr.replace(/0+$/, '');
        }
        // Separa o trecho inteiro do decimal já em formato textual.
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
     * Calcula interpolação linear entre dois valores.
     *
     * @param {number} pPrevious Valor inicial.
     * @param {number} pTarget Valor final.
     * @param {number} pN Fator de interpolação entre `0` e `1`.
     * @returns {number}
     */
    lerp: (pPrevious, pTarget, pN) => {
        return (1 - pN) * pPrevious + pN * pTarget;
    },
    /**
     * Calcula o percentil de um array de números.
     *
     * Quando `pInclusive` for `false`, utiliza o método exclusivo.
     *
     * @param {Array} pValues Valores usados no cálculo.
     * @param {number} pPercentil Percentil desejado no intervalo entre `0` e `1`.
     * @param {boolean} [pInclusive=false] Define se deve usar o método inclusivo.
     * @returns {number}
     */
    percentile: (pValues, pPercentil, pInclusive = false) => {
        const n = pValues.length;

        // No método exclusivo, o percentil deve estar estritamente dentro do intervalo.
        if (pPercentil <= 0 || pPercentil >= 1) {
            throw new Error('O percentil deve ser maior que 0 e menor que 1 para o método exclusivo.');
        }

        // Ordena os valores para localizar a posição do percentil.
        const xSorted = pValues.sort((pA, pB) => pA - pB);

        let xPos;
        if (pInclusive) {
            xPos = (n - 1) * pPercentil;
        } else {
            // No modo exclusivo, a posição é calculada com base em n + 1.
            xPos = pPercentil * (n + 1) - 1;
        }
        const xBase = Math.floor(xPos);
        const xRest = xPos - xBase;
        if (pInclusive) {
            if (xSorted[xBase + 1] !== undefined) {
                return xSorted[xBase] + xRest * (xSorted[xBase + 1] - xSorted[xBase]);
            } else {
                return xSorted[xBase];
            }
        } else {
            // Garante retorno das extremidades quando a posição extrapolar a faixa.
            if (xBase < 0) {
                return xSorted[0];
            } else if (xBase >= n - 1) {
                return xSorted[n - 1];
            } else {
                // Entre dois pontos, interpola linearmente o valor intermediário.
                return xSorted[xBase] + xRest * (xSorted[xBase + 1] - xSorted[xBase]);
            }
        }
    }
};

/**
 * Faz cálculo com maior precisão convertendo temporariamente os operandos para inteiros.
 *
 * A função separa parte inteira e decimal dos operandos, normaliza as casas
 * decimais e delega a operação para `pOperation`.
 *
 * @param {number} pValue1 Primeiro operando.
 * @param {number} pValue2 Segundo operando.
 * @param {function} pOperation Função que executará a operação desejada.
 * @returns {number}
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

    // Normaliza as casas como se ambos tivessem sido multiplicados por 10^xMaxDec,
    // evitando resíduos de ponto flutuante durante a operação.
    xValue1Str.dec = xValue1Str.dec + '0'.repeat(xMaxDec - xValue1Str.dec.length);
    xValue2Str.dec = xValue2Str.dec + '0'.repeat(xMaxDec - xValue2Str.dec.length);
    // Executa a operação com os inteiros já normalizados.
    const xResult = pOperation(
        Number(xValue1Str.sign + xValue1Str.int + xValue1Str.dec),
        Number(xValue2Str.sign + xValue2Str.int + xValue2Str.dec),
        Math.pow(10, xMaxDec)
    );
    return xResult;
};

module.exports = numbers;
