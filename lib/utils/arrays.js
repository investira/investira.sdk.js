const { isEmpty, isArray } = require('./validators');

const arrays = {
    /**
     * Retorna index da data da lista mais próxima a data alvo
     * Converte automaticamente os valores para date
     *
     * @param {array} pArray Array com os valores a ser testados
     * @param {string | number} pValue Valor alvo
     * @returns {boolean}
     */
    inArray: (pArray, pValue) => {
        return pArray.includes(pValue);
    },
    /**
     * Retorna index da data da lista mais próxima a data alvo
     * Converte automaticamente os valores para date
     *
     * @param {array} pSourceArray Array com as datas, em formato string, a serem pesquisadas já em ordem crescente
     * @param {string} pTargetValue Valor alvo
     * @param {boolean} [pGreater=null] Proximidade do valor alvo:
     * - true: o posterior mais próximo
     * - false: o anterior mais próximo
     * - null: mais próximo
     * @returns {number} Index da lista que contém o valor encontrado
     */
    seekDate: (pSourceArray, pTargetValue, pGreater = null) => {
        return pvSeek(pSourceArray, new Date(pTargetValue), pGreater, pSourceValue => {
            return new Date(pSourceValue);
        });
    },

    /**
     * Retorna index do valor da lista mais próximo ao valor alvo.
     * Converte automaticamente os valores para number.
     * Valor retornado é o original contido na lista, sem conversão.
     *
     * @param {array} pSourceArray Array com os números, em formato string, a serem pesquisados já em ordem crescente
     * @param {string} pTargetValue Valor alvo
     * @param {boolean} [pGreater=null] Proximidade do valor alvo:
     * - true: o posterior mais próximo
     * - false: o anterior mais próximo
     * - null: mais próximo
     * @returns {number} Index da lista que contém o valor encontrado
     */
    seekNumber: (pSourceArray, pTargetValue, pGreater = null) => {
        return pvSeek(pSourceArray, Number(pTargetValue), pGreater, pSourceValue => {
            return Number(pSourceValue);
        });
    },

    /**
     * Retorna index do valor da lista mais próximo ao valor alvo
     *
     * @param {array} pSourceArray Array com os itens a serem pesquisados já em ordem crescente
     * @param {*} pTargetValue Valor alvo
     * @param {boolean} [pGreater=null] Proximidade do valor alvo:
     * - true: o posterior mais próximo
     * - false: o anterior mais próximo
     * - null: mais próximo
     * @param {function} pConvertFunction Função para converte o valor do array caso necessário. Se não, utilizará o valor contído do próprio array.
     * @returns {number} Index da lista que contém o valor encontrado
     */
    seek: (
        pSourceArray,
        pTargetValue,
        pGreater = null,
        pConvertFunction = pCompliance => {
            return pCompliance;
        }
    ) => {
        return pvSeek(pSourceArray, pTargetValue, pGreater, pConvertFunction);
    },

    /**
     * Converte um array de objetos para um objetos atribuindo uma chave para cada valor index do array
     *
     * @param {Array} pArray Array de objetos
     * @param {String} pKeyPropertyName Chave que terá seu valor atribuído como nova chave da lista de objetos
     * @param {Function} pKeyFormatFunction Opcional: função para formatar a chave
     * @param {string} [pKeyPrefix=''] Opcional: Prefixo a ser adicionado a chave
     * @return {Object}
     */
    arrayToObject: (pArray, pKeyPropertyName, pKeyFormatFunction = null, pKeyPrefix = '') => {
        const xObject = {};
        if (!pArray || !isArray(pArray)) {
            return xObject;
        }
        for (const xItem of pArray) {
            let xKey = pKeyFormatFunction ? pKeyFormatFunction(xItem[pKeyPropertyName]) : xItem[pKeyPropertyName];
            xObject[pKeyPrefix + xKey] = xItem;
        }
        return xObject;
    },

    /**
     * Retorna array contendo somentes os itens existentes com pCompliance
     *
     * @param {array} pCompliance Array origem
     * @param {array} pTarget Array com os nomes válidos: ex: ["client_id", "client_name"]
     * @returns {array} array somente com as propriedades válidas
     */
    arrayComplianceWithArray: (pCompliance, pTarget) => {
        let xObject = [];
        if (!pTarget) {
            return null;
        }
        for (const xKey of pTarget) {
            if (pCompliance.includes(xKey)) {
                xObject.push(xKey);
            }
        }
        return xObject;
    },

    /**
     * Retorna array com palavras ou frases.
     * Exclui valore vázios.
     *
     * ex:
     * - "abc def" = ['abc','def']
     * - "abc def," = ['abc def']
     * - "abc def,ghi" = ['abc def','ghi']
     * - "abc def,,ghi" = ['abc def','ghi']
     *
     *
     * @param {*} pString
     * @param {string} [pDelimiter=',']
     * @param {string} [pPrefix=''] Prefixo a ser incorporado a cada string
     * @param {string} [pSuffix=''] Sufixo a ser incorporado a cada string
     * @returns {array}
     */
    toArray: (pString, pDelimiter = ',', pPrefix = '', pSuffix = '') => {
        if (isEmpty(pString)) {
            return [];
        }
        let xItens;
        const xArray = [];
        if (isArray(pString)) {
            xItens = pString;
        } else {
            //Separa frases
            if (pString.includes(pDelimiter)) {
                xItens = pString.split(pDelimiter);
            } else {
                //Separa palavras
                xItens = pString.split(' ');
            }
        }
        for (const xItem of xItens) {
            //Força que valor seja uma string
            const xTmp = '' + xItem;
            //Somente incluir itens não vázios
            if (xTmp.length > 0) {
                xArray.push(`${pPrefix}${xTmp}${pSuffix}`);
            }
        }
        return xArray;
    }
};

/**
 * Pesquisa binária para retorna o index da lista mais próximo ao valor alvo
 * Atenção: Lista precisar estar em ordem crescente
 * @param {array} pSourceArray Array com os itens a serem pesquisados
 * @param {object} pTargetValue Valor alvo
 * @param {boolean} [pGreater=null] Proximidade do valor alvo:
 * - true: item mais próximo superior
 * - false: item mais próximo anterior
 * - null: mais próximo numericamente
 * @param {function} pConvertFunction Função para converte o valor do array em conformidade com o tipo do valor alvo, caso necessário
 * @param {object} pControl
 * @returns {object}
 */
const pvSeek = (
    pSourceArray,
    pTargetValue,
    pGreater = null,
    pConvertFunction = pSourceValue => {
        return pSourceValue;
    },
    pControl = null
) => {
    if (!pControl) {
        if (pSourceArray.length == 0) {
            return null;
        }
        pControl = {
            minIndex: 0,
            maxIndex: pSourceArray.length - 1
        };
    }
    const xDif = pControl.maxIndex - pControl.minIndex;
    //Se não há diferença, encontrou o item
    if (xDif === 0) {
        return pControl.minIndex;
        //Se diferença for 1, um dos itens será o item encontrado
        //O item escolhido será definido conforme o parametro pGreater
    } else if (xDif === 1) {
        let xMinValue = pConvertFunction(pSourceArray[pControl.minIndex]);
        let xMaxValue = pConvertFunction(pSourceArray[pControl.maxIndex]);
        //IGUAL
        //Retorna se o target for iqual a minValue ou maxValue
        if (String(xMinValue) === String(pTargetValue)) {
            return pControl.minIndex;
        } else if (String(xMaxValue) === String(pTargetValue)) {
            return pControl.maxIndex;
        }
        //Retorna o item cujo valor númerico for mais próximo do target
        //utilizando comparação númerica para verificar proximidade ao target
        if (typeof xMaxValue !== 'string') {
            //FORA DO LIMITE
            if (pTargetValue > xMaxValue) {
                return pControl.maxIndex;
            }
            if (pTargetValue < xMinValue) {
                return pControl.minIndex;
            }
            //DENTRO DO INTERVALO
            let xIsMinCloser = false;
            //Calcula set o menor valor é mais próximo do target
            xIsMinCloser = Math.abs(xMinValue - pTargetValue) < Math.abs(xMaxValue - pTargetValue);
            if (pGreater === null) {
                return xIsMinCloser ? pControl.minIndex : pControl.maxIndex;
            } else {
                return pGreater ? pControl.maxIndex : pControl.minIndex;
            }
        }
        //FORA DO LIMITE
        //Retorna limite
        if (pControl.minIndex === 0) {
            return pControl.minIndex;
        } else if (pSourceArray.length - 1 === pControl.maxIndex) {
            return pControl.maxIndex;
        }
        //SEM COMPARAÇÃO DE VALORES
        //Só em função do index
        return pGreater ? pControl.maxIndex : pControl.minIndex;
    }
    const xI = Math.floor((pControl.minIndex + pControl.maxIndex) / 2);
    const xValue = pConvertFunction(pSourceArray[xI]);
    if (xValue <= pTargetValue) {
        pControl.minIndex = xI;
    }
    if (xValue >= pTargetValue) {
        pControl.maxIndex = xI;
    }
    if (xI != pControl.maxIndex && xI !== pControl.minIndex) {
        throw new Error('Comparison error');
    }
    //Chamada recursiva até finalizar a busca
    return pvSeek(pSourceArray, pTargetValue, pGreater, pConvertFunction, {
        minIndex: pControl.minIndex,
        maxIndex: pControl.maxIndex
    });
};

module.exports = arrays;
