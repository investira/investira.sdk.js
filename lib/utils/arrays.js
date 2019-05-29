const arrays = {
    // seekDate: (pSourceArray, pTargetValue, pGreater = null) => {
    //     return pvSeek(
    //         pSourceArray,
    //         pTargetValue,
    //         pGreater,
    //         pSourceValue => {
    //             return new Date(pSourceValue);
    //         }
    //     );
    // },

    // seekNumber: (pSourceArray, pTargetValue, pGreater = null) => {
    //     return pvSeek(
    //         pSourceArray,
    //         pTargetValue,
    //         pGreater,
    //         pSourceValue => {
    //             return Number(pSourceValue);
    //         }
    //     );
    // },
    /**
     * Retorna valor da lista mais próximo ao valor alvo
     *
     * @param {array} pSourceArray Array com os itens a serem pesquisados já ordenado em ordem crescente
     * @param {object} pTargetValue Valor alvo
     * @param {boolean} [pGreater=null] Proximidade do valor alvo:
     * - true: o posterior mais próximo
     * - false: o anterior mais próximo
     * - null: mais próximo
     * @param {function} pConvertFunction Função para converte o valor do array caso necessário. Se não, utilizará o valor contído do próprio array.
     * @returns {object}
     */
    seek: (
        pSourceArray,
        pTargetValue,
        pGreater = null,
        pConvertFunction = pSource => {
            return pSource;
        }
    ) => {
        return pvSeek(pSourceArray, pTargetValue, pGreater, pConvertFunction);
    }
};

/**
 * Retorna valor da lista mais próximo ao valor alvo
 *
 * @param {array} pSourceArray Array com os itens a serem pesquisados
 * @param {object} pTargetValue Valor alvo
 * @param {boolean} [pGreater=null] Proximidade do valor alvo:
 * - true: mais próximo superior
 * - false: mais próximo anterior
 * - null: mais próximo
 * @param {function} pConvertFunction Função para converte l valor do array caso necessário
 * @param {number} [pMinIndex=null]
 * @param {number} [pMaxIndex=null]
 * @returns {object}
 */
const pvSeek = (
    pSourceArray,
    pTargetValue,
    pGreater = null,
    pConvertFunction = pSourceValue => {
        return pSourceValue;
    },
    pMinIndex = null,
    pMaxIndex = null
) => {
    if (!pMinIndex && !pMaxIndex) {
        if (pSourceArray.length == 0) {
            return null;
        }
        pMinIndex = 0;
        pMaxIndex = pSourceArray.length - 1;
    }
    if (pMaxIndex - pMinIndex <= 1) {
        if (pGreater == null) {
            const xMinValue = pConvertFunction(pSourceArray[pMinIndex]);
            const xMaxValue = pConvertFunction(pSourceArray[pMaxIndex]);
            if (
                Math.abs(xMinValue - pTargetValue) <
                Math.abs(xMaxValue - pTargetValue)
            ) {
                return pSourceArray[pMinIndex];
            } else {
                return pSourceArray[pMaxIndex];
            }
        } else {
            if (pGreater) {
                if (pMinIndex == 0) {
                    return pSourceArray[pMinIndex];
                } else {
                    return pSourceArray[pMaxIndex];
                }
            } else {
                if (pSourceArray.length - 1 == pMaxIndex) {
                    return pSourceArray[pMaxIndex];
                } else {
                    return pSourceArray[pMinIndex];
                }
            }
        }
    }
    const xI = Math.floor((pMinIndex + pMaxIndex) / 2);
    const xData = pConvertFunction(pSourceArray[xI]);
    if (xData <= pTargetValue) {
        pMinIndex = xI;
    }
    if (xData >= pTargetValue) {
        pMaxIndex = xI;
    }
    return pvSeek(
        pSourceArray,
        pTargetValue,
        pGreater,
        pConvertFunction,
        pMinIndex,
        pMaxIndex
    );
};

module.exports = arrays;
