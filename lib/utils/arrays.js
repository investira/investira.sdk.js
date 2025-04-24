const { isEmpty, isArray } = require('./validators');

/**
 * Módulo com funções utilitárias para manipulação de arrays
 * @module arrays
 */

/** @type {Object} Funções utilitárias para arrays */
const arrays = {
    /**
     * Verifica se um valor está presente em um array
     *
     * @param {array} pArray Array onde será feita a busca
     * @param {string | number} pValue Valor a ser procurado
     * @returns {boolean} True se o valor foi encontrado, false caso contrário
     */
    inArray: (pArray, pValue) => {
        return pArray.includes(pValue);
    },
    /**
     * Busca a data mais próxima em um array de datas
     *
     * @description
     * Realiza uma busca binária em um array de datas para encontrar a data mais próxima
     * à data alvo. As datas no array devem estar em ordem crescente.
     *
     * @param {array} pSourceArray Array com as datas (em formato string) em ordem crescente
     * @param {string} pTargetValue Data alvo a ser procurada
     * @param {boolean} [pGreater=null] Direção da busca:
     * - true: retorna a data posterior mais próxima
     * - false: retorna a data anterior mais próxima
     * - null: retorna a data mais próxima independente da direção
     * @returns {number} Índice do array onde a data foi encontrada
     */
    seekDate: (pSourceArray, pTargetValue, pGreater = null) => {
        return pvSeek(pSourceArray, new Date(pTargetValue), pGreater, pSourceValue => {
            return new Date(pSourceValue);
        });
    },

    /**
     * Busca o número mais próximo em um array de números
     *
     * @description
     * Realiza uma busca binária em um array de números para encontrar o valor mais próximo
     * ao valor alvo. Os números podem estar em formato string, serão convertidos automaticamente.
     * O array deve estar em ordem crescente.
     *
     * @param {array} pSourceArray Array com os números (podem ser strings) em ordem crescente
     * @param {string} pTargetValue Número alvo a ser procurado
     * @param {boolean} [pGreater=null] Direção da busca:
     * - true: retorna o número posterior mais próximo
     * - false: retorna o número anterior mais próximo
     * - null: retorna o número mais próximo independente da direção
     * @returns {number} Índice do array onde o número foi encontrado
     */
    seekNumber: (pSourceArray, pTargetValue, pGreater = null) => {
        return pvSeek(pSourceArray, Number(pTargetValue), pGreater, pSourceValue => {
            return Number(pSourceValue);
        });
    },

    /**
     * Busca o valor mais próximo em um array usando uma função de conversão personalizada
     *
     * @description
     * Realiza uma busca binária em um array para encontrar o valor mais próximo
     * ao valor alvo. Permite especificar uma função de conversão para comparar os valores.
     * O array deve estar em ordem crescente.
     *
     * @param {array} pSourceArray Array com os itens em ordem crescente
     * @param {*} pTargetValue Valor alvo a ser procurado
     * @param {boolean} [pGreater=null] Direção da busca:
     * - true: retorna o valor posterior mais próximo
     * - false: retorna o valor anterior mais próximo
     * - null: retorna o valor mais próximo independente da direção
     * @param {function} pConvertFunction Função para converter os valores antes da comparação
     * @returns {number} Índice do array onde o valor foi encontrado
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
     * Converte um array de objetos em um objeto usando uma propriedade como chave
     *
     * @description
     * Transforma um array de objetos em um único objeto onde cada item do array é indexado
     * por uma propriedade especificada. Permite formatar a chave e adicionar um prefixo.
     *
     * @param {Array} pArray Array de objetos a ser convertido
     * @param {String} pKeyPropertyName Nome da propriedade que será usada como chave
     * @param {Function} [pKeyFormatFunction] Função opcional para formatar o valor da chave
     * @param {string} [pKeyPrefix=''] Prefixo opcional para adicionar a cada chave
     * @returns {Object} Objeto resultante da conversão
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
     * Filtra um array mantendo apenas os itens que existem em outro array
     *
     * @description
     * Compara dois arrays e retorna um novo array contendo apenas os elementos
     * do primeiro array que também existem no segundo array.
     *
     * @param {Array} pCompliance Array de origem a ser filtrado
     * @param {Array} pTarget Array com os valores válidos para filtro
     * @returns {Array} Novo array contendo apenas os elementos em comum
     */
    arrayComplianceWithArray: (pCompliance, pTarget) => {
        let xObject = [];
        if (!pCompliance || !pTarget) {
            return xObject;
        }
        for (const xKey of pTarget) {
            if (pCompliance.includes(xKey)) {
                xObject.push(xKey);
            }
        }
        return xObject;
    },

    /**
     * Converte uma string em um array de palavras ou frases
     *
     * ex:
     * - "abc def" = ['abc','def']
     * - "abc def," = ['abc def']
     * - "abc def,ghi" = ['abc def','ghi']
     * - "abc def,,ghi" = ['abc def','ghi']
     *
     *
     * @param {string} pString String a ser convertida em array
     * @param {string} [pDelimiter=','] Caractere ou string usado como delimitador
     * @param {string} [pPrefix=''] Prefixo a ser adicionado a cada item
     * @param {string} [pSuffix=''] Sufixo a ser adicionado a cada item
     * @returns {array} Array com as palavras ou frases resultantes
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
    },
    /**
     * Remove itens duplicados de um array
     *
     * @description
     * Cria um novo array contendo apenas valores únicos, eliminando
     * quaisquer duplicatas do array original.
     *
     * @param {Array} pArray Array com possíveis valores duplicados
     * @returns {Array} Novo array contendo apenas valores únicos
     */
    removeDuplicated: pArray => {
        return pArray.filter((pItem, pIndex) => {
            return pArray.indexOf(pItem) === pIndex;
        });
    },
    /**
     * Verifica se dois arrays são iguais
     *
     * @description
     * Compara dois arrays para determinar se são iguais, independente da ordem
     * dos elementos. Os arrays são ordenados antes da comparação.
     *
     * @param {Array} pArray1 Primeiro array para comparação
     * @param {Array} pArray2 Segundo array para comparação
     * @returns {boolean} True se os arrays são iguais, false caso contrário
     */
    isEqual: (pArray1, pArray2) => {
        // Check if the arrays have the same length
        if (pArray1.length !== pArray2.length) {
            return false;
        }

        // Sort the arrays before comparison
        const xSortedArr1 = pArray1.slice().sort();
        const xSortedArr2 = pArray2.slice().sort();

        // Check each element individually
        for (let i = 0; i < xSortedArr1.length; i++) {
            if (xSortedArr1[i] !== xSortedArr2[i]) {
                return false;
            }
        }
        // If all elements are equal, the arrays are equal
        return true;
    }
};

/**
 * Implementa uma busca binária para encontrar o índice mais próximo ao valor alvo
 *
 * @description
 * Função interna que implementa o algoritmo de busca binária para encontrar
 * o índice do elemento mais próximo ao valor alvo em um array ordenado.
 * ATENÇÃO: O array de entrada DEVE estar em ordem crescente.
 *
 * @private
 *
 * @private
 * @param {Array} pSourceArray Array ordenado com os itens a serem pesquisados
 * @param {*} pTargetValue Valor alvo para a busca
 * @param {boolean} [pGreater=null] Direção da busca:
 * - true: retorna o item posterior mais próximo
 * - false: retorna o item anterior mais próximo
 * - null: retorna o item mais próximo numericamente
 * @param {Function} pConvertFunction Função para converter valores antes da comparação
 * @param {Object} [pControl] Objeto de controle para busca recursiva
 * @returns {number|null} Índice do item mais próximo ou null se array vazio
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
        //Retorna se o target for igual a minValue ou maxValue
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
