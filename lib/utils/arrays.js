const { isEmpty, isArray } = require('./validators');

/**
 * Utilitários para manipulação, busca e normalização de arrays.
 *
 * @module arrays
 */

/** @type {Object} Funções utilitárias para arrays. */
const arrays = {
    /**
     * Verifica se um valor está presente em um array.
     *
     * @param {Array} pArray Array onde será feita a busca.
     * @param {string | number} pValue Valor a ser procurado.
     * @returns {boolean} `true` quando o valor for encontrado.
     */
    inArray: (pArray, pValue) => {
        return pArray.includes(pValue);
    },
    /**
     * Busca a data mais próxima em um array de datas.
     *
     * Realiza busca binária em um array de datas ordenado em ordem crescente.
     *
     * @param {Array} pSourceArray Array com as datas em ordem crescente.
     * @param {string} pTargetValue Data alvo a ser procurada.
     * @param {boolean} [pGreater=null] Direção da busca:
     * - `true`: retorna a data posterior mais próxima.
     * - `false`: retorna a data anterior mais próxima.
     * - `null`: retorna a data mais próxima independentemente da direção.
     * @returns {number|null} Índice do item encontrado ou `null` se o array estiver vazio.
     */
    seekDate: (pSourceArray, pTargetValue, pGreater = null) => {
        return pvSeek(pSourceArray, new Date(pTargetValue), pGreater, pSourceValue => {
            return new Date(pSourceValue);
        });
    },

    /**
     * Busca o número mais próximo em um array de números.
     *
     * Realiza busca binária em um array ordenado em ordem crescente.
     * Valores do array podem ser strings numéricas.
     *
     * @param {Array} pSourceArray Array com os números em ordem crescente.
     * @param {string|number} pTargetValue Número alvo a ser procurado.
     * @param {boolean} [pGreater=null] Direção da busca:
     * - `true`: retorna o número posterior mais próximo.
     * - `false`: retorna o número anterior mais próximo.
     * - `null`: retorna o número mais próximo independentemente da direção.
     * @returns {number|null} Índice do item encontrado ou `null` se o array estiver vazio.
     */
    seekNumber: (pSourceArray, pTargetValue, pGreater = null) => {
        return pvSeek(pSourceArray, Number(pTargetValue), pGreater, pSourceValue => {
            return Number(pSourceValue);
        });
    },

    /**
     * Busca o valor mais próximo em um array usando uma função de conversão personalizada.
     *
     * O array de origem deve estar em ordem crescente considerando o valor
     * retornado por `pConvertFunction`.
     *
     * @param {Array} pSourceArray Array com os itens em ordem crescente.
     * @param {*} pTargetValue Valor alvo a ser procurado.
     * @param {boolean} [pGreater=null] Direção da busca:
     * - `true`: retorna o valor posterior mais próximo.
     * - `false`: retorna o valor anterior mais próximo.
     * - `null`: retorna o valor mais próximo independentemente da direção.
     * @param {function} pConvertFunction Função para converter os valores antes da comparação.
     * @returns {number|null} Índice do item encontrado ou `null` se o array estiver vazio.
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
     * Converte um array de objetos em um objeto usando uma propriedade como chave.
     *
     * Cada item do array passa a ser indexado pela propriedade informada.
     *
     * @param {Array} pArray Array de objetos a ser convertido.
     * @param {string} pKeyPropertyName Nome da propriedade usada como chave.
     * @param {Function} [pKeyFormatFunction] Função opcional para formatar o valor da chave.
     * @param {string} [pKeyPrefix=''] Prefixo opcional adicionado a cada chave.
     * @returns {Object} Objeto indexado pela chave informada.
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
     * Filtra um array mantendo apenas os itens que existem em outro array.
     *
     * A ordem do retorno segue a ordem de `pTarget`.
     *
     * @param {Array} pCompliance Array de origem a ser filtrado.
     * @param {Array} pTarget Array com os valores válidos para filtro.
     * @returns {Array} Novo array contendo apenas os elementos em comum.
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
     * Converte string ou array em um array normalizado de itens.
     *
     * ex:
     * - "abc def" = ['abc','def']
     * - "abc def," = ['abc def']
     * - "abc def,ghi" = ['abc def','ghi']
     * - "abc def,,ghi" = ['abc def','ghi']
     *
     * Quando o delimitador não existir no texto, a separação ocorre por espaço.
     * Itens vazios são descartados e duplicados são removidos.
     *
     * @param {string|Array} pString Valor a ser convertido em array.
     * @param {string} [pDelimiter=','] Caractere ou string usado como delimitador.
     * @param {string} [pPrefix=''] Prefixo a ser adicionado a cada item.
     * @param {string} [pSuffix=''] Sufixo a ser adicionado a cada item.
     * @returns {Array} Array com as palavras ou frases resultantes.
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
            // Se houver delimitador explícito, trata como lista de frases.
            pString = String(pString);
            if (pString.includes(pDelimiter)) {
                xItens = pString.split(pDelimiter);
            } else {
                // Caso contrário, separa por palavras.
                xItens = pString.split(' ');
            }
        }
        for (const xItem of xItens) {
            // Normaliza o item para string e remove espaços excedentes.
            const xTmp = String(xItem).trim();
            // Ignora itens vazios após a normalização.
            if (xTmp.length > 0) {
                xArray.push(`${pPrefix}${xTmp}${pSuffix}`);
            }
        }
        // Remove itens duplicados preservando a primeira ocorrência.
        return Array.from(new Set(xArray));
    },
    /**
     * Remove itens duplicados de um array.
     *
     * @param {Array} pArray Array com possíveis valores duplicados.
     * @returns {Array} Novo array contendo apenas valores únicos.
     */
    removeDuplicated: pArray => {
        if (!pArray) {
            return [];
        }
        return Array.from(new Set(pArray));
    },
    /**
     * Verifica se dois arrays possuem o mesmo conteúdo.
     *
     * A comparação é feita sem considerar a ordem original dos elementos.
     *
     * @param {Array} pArray1 Primeiro array para comparação.
     * @param {Array} pArray2 Segundo array para comparação.
     * @returns {boolean} `true` quando os arrays tiverem o mesmo conteúdo.
     */
    isEqual: (pArray1, pArray2) => {
        // Arrays com tamanhos diferentes nunca podem ser equivalentes.
        if (pArray1.length !== pArray2.length) {
            return false;
        }

        // Ordena cópias para evitar alterar os arrays recebidos.
        const xSortedArr1 = pArray1.slice().sort();
        const xSortedArr2 = pArray2.slice().sort();

        // Compara item a item após a ordenação.
        for (let i = 0; i < xSortedArr1.length; i++) {
            if (xSortedArr1[i] !== xSortedArr2[i]) {
                return false;
            }
        }
        // Todos os itens coincidem, então os arrays são equivalentes.
        return true;
    }
};

/**
 * Implementa busca binária para encontrar o índice mais próximo ao valor alvo.
 *
 * O array de entrada deve estar em ordem crescente de acordo com o resultado
 * de `pConvertFunction`.
 *
 * @private
 * @param {Array} pSourceArray Array ordenado com os itens a serem pesquisados.
 * @param {*} pTargetValue Valor alvo para a busca.
 * @param {boolean} [pGreater=null] Direção da busca:
 * - `true`: retorna o item posterior mais próximo.
 * - `false`: retorna o item anterior mais próximo.
 * - `null`: retorna o item numericamente mais próximo quando aplicável.
 * @param {Function} pConvertFunction Função para converter valores antes da comparação.
 * @param {Object} [pControl] Objeto de controle usado internamente na recursão.
 * @returns {number|null} Índice do item mais próximo ou `null` se o array estiver vazio.
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
    // Quando só resta um índice possível, a busca terminou.
    if (xDif === 0) {
        return pControl.minIndex;
        // Quando restam dois candidatos, a escolha depende da proximidade
        // e eventualmente da direção pedida em pGreater.
    } else if (xDif === 1) {
        let xMinValue = pConvertFunction(pSourceArray[pControl.minIndex]);
        let xMaxValue = pConvertFunction(pSourceArray[pControl.maxIndex]);
        // Retorna imediatamente se o alvo coincidir com uma das extremidades.
        if (String(xMinValue) === String(pTargetValue)) {
            return pControl.minIndex;
        } else if (String(xMaxValue) === String(pTargetValue)) {
            return pControl.maxIndex;
        }
        // Para valores numéricos ou datas, decide pela menor distância.
        if (typeof xMaxValue !== 'string') {
            // Se o alvo estiver fora do intervalo, devolve o limite correspondente.
            if (pTargetValue > xMaxValue) {
                return pControl.maxIndex;
            }
            if (pTargetValue < xMinValue) {
                return pControl.minIndex;
            }
            // Dentro do intervalo, calcula qual extremo está mais próximo.
            let xIsMinCloser = false;
            xIsMinCloser = Math.abs(xMinValue - pTargetValue) < Math.abs(xMaxValue - pTargetValue);
            if (pGreater === null) {
                return xIsMinCloser ? pControl.minIndex : pControl.maxIndex;
            } else {
                return pGreater ? pControl.maxIndex : pControl.minIndex;
            }
        }
        // Para comparações textuais, fora dos limites devolve a própria borda.
        if (pControl.minIndex === 0) {
            return pControl.minIndex;
        } else if (pSourceArray.length - 1 === pControl.maxIndex) {
            return pControl.maxIndex;
        }
        // Sem métrica de distância textual, decide apenas pela direção solicitada.
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
    // Continua refinando o intervalo até chegar ao menor recorte possível.
    return pvSeek(pSourceArray, pTargetValue, pGreater, pConvertFunction, {
        minIndex: pControl.minIndex,
        maxIndex: pControl.maxIndex
    });
};

module.exports = arrays;
