const {
    isEmpty,
    isNull,
    isArray,
    isDate,
    isNumber,
    isString,
    isObject,
    isMergeable,
    isUndefined,
    isFunction
} = require('./validators');
const diff = require('deep-diff').diff;

/**
 * Utilitários para criação, limpeza, comparação e merge profundo de objetos.
 */
const objects = {
    /**
     * Cria objeto contendo uma única propriedade com o valor informado.
     *
     * @param {String} pProperty Nome da propriedade.
     * @param {*} pValue Valor atribuído.
     * @returns {Object} Objeto criado.
     * @example
     * objects.objectFromPropertyAndValue('status', 'ok'); // { status: 'ok' }
     */
    objectFromPropertyAndValue: (pProperty, pValue) => {
        if (isEmpty(pProperty)) {
            return {};
        }
        let xO = {};
        xO[pProperty] = pValue;
        return xO;
    },

    /**
     * Cria objeto aninhado a partir de caminho em notação por ponto.
     *
     * @param {String} pString Caminho no formato `campo1.campo2.campo3`.
     * @returns {Object} Objeto aninhado.
     * @example
     * objects.objectFromString('user.address.city'); // { user: { address: { city: {} } } }
     */
    objectFromString: pString => {
        if (isNull(pString)) {
            return {};
        }
        const xObject = {};
        const xAttrs = pString.split('.');
        let xValue = {};
        let xKey = pString;
        if (xAttrs.length > 1) {
            xKey = xAttrs[0];
            xValue = objects.objectFromString(pString.substr(xKey.length + 1));
        }
        xObject[xKey] = xValue;
        return xObject;
    },

    /**
     * Mantém apenas as propriedades cujos nomes existam na lista informada.
     *
     * @param {Object} pSource Objeto origem.
     * @param {Array} pProperties Lista com os nomes das propriedades válidas.
     * @returns {object} Objeto somente com as propriedades válidas.
     */
    objectComplianceWithArray: (pSource, pProperties) => {
        if (isEmpty(pSource) || isEmpty(pProperties)) {
            return pSource;
        }

        let xObject = {};
        for (const xKey in pSource) {
            if (pProperties.includes(xKey)) {
                xObject[xKey] = pSource[xKey];
            }
        }
        return xObject;
    },

    /**
     * Retorna objeto contendo somente os itens em conformidade com o modelo.
     *
     * A validação percorre estruturas aninhadas recursivamente.
     *
     * @param {object} pModel Objeto modelo.
     * @param {object} pTarget Objeto a ser filtrado.
     * @returns {object} Objeto somente com as propriedades válidas.
     */
    objectCompliance: (pModel, pTarget) => {
        if (!isObject(pTarget) || isNull(pModel)) {
            return pTarget;
        }
        let xObject = {};
        for (const xKey in pTarget) {
            if (pModel.hasOwnProperty(xKey)) {
                // Mantém apenas chaves também previstas no modelo.
                xObject[xKey] = objects.objectCompliance(pModel[xKey], pTarget[xKey]);
            }
        }
        return xObject;
    },

    /**
     * Exclui propriedades-objeto que fiquem sem filhos após limpeza recursiva.
     *
     * @param {Object} pObject Objeto origem.
     * @returns {Object|null} Objeto limpo.
     */
    deleteEmpty: pObject => {
        if (isNull(pObject)) {
            return null;
        }
        const xObject = { ...pObject };
        for (const xKey in pObject) {
            // if (isEmpty(xObject[xKey])) {
            //     delete xObject[xKey];
            // } else {
            if (isObject(xObject[xKey])) {
                xObject[xKey] = objects.deleteEmpty(xObject[xKey]);
                if (Object.keys(xObject[xKey]).length === 0) {
                    delete xObject[xKey];
                }
            }
            // }
        }
        return xObject;
    },

    /**
     * Exclui atributos vazios, nulos ou objetos filhos que se tornem vazios.
     *
     * @param {Object} pObject Objeto origem.
     * @returns {Object|null} Objeto somente com as propriedades válidas.
     */
    deleteNull: pObject => {
        if (isNull(pObject)) {
            return null;
        }
        const xObject = { ...pObject };
        for (const xKey in pObject) {
            if (isEmpty(xObject[xKey])) {
                delete xObject[xKey];
            } else {
                if (isObject(xObject[xKey])) {
                    xObject[xKey] = objects.deleteNull(xObject[xKey]);
                    if (!xObject[xKey]) {
                        delete xObject[xKey];
                    }
                }
            }
        }
        if (isObject(xObject) && Object.keys(xObject).length === 0) {
            return null;
        }

        return xObject;
    },

    /**
     * Exclui atributos vazios, nulos, falsy ou objetos filhos sem conteúdo.
     *
     * @param {Object} pObject Objeto origem.
     * @returns {Object|null} Objeto somente com as propriedades válidas.
     */
    deleteZeros: pObject => {
        if (isNull(pObject) || !pObject) {
            return null;
        }
        const xObject = { ...pObject };
        for (const xKey in pObject) {
            if (isEmpty(xObject[xKey]) || !xObject[xKey]) {
                delete xObject[xKey];
            } else {
                if (isObject(xObject[xKey])) {
                    xObject[xKey] = objects.deleteZeros(xObject[xKey]);
                    if (!xObject[xKey]) {
                        delete xObject[xKey];
                    }
                }
            }
        }
        if (isObject(xObject) && Object.keys(xObject).length === 0) {
            return null;
        }

        return xObject;
    },

    /**
     * Retorna uma querystring a partir das chaves e valores de um objeto.
     *
     * @param {object} pObject Objeto origem.
     * @returns {string} Querystring no formato `?page=1&size=5`.
     * @example
     * objects.objectToQueryString({ page: 1, size: 5 }); // "?page=1&size=5"
     */

    objectToQueryString: (pObject = {}) => {
        let xQueryString = '';
        const xString = Object.keys(pObject)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(pObject[key])}`)
            .join('&');
        xQueryString = `?${xString}`;
        return xQueryString;
    },

    /**
     * Retorna valor padrão quando o valor informado for nulo.
     *
     * @param {*} pElement Elemento a ser verificado.
     * @param {*} [pDefaultValue=""] Valor retornado quando `pElement` for nulo.
     * @returns {*} Elemento válido.
     */

    getNotNull: (pElement, pDefaultValue) => {
        if (isNull(pElement)) {
            return pDefaultValue;
        } else {
            return pElement;
        }
    },

    /**
     * Retorna valor padrão quando o valor informado estiver vazio.
     *
     * @param {*} pElement Elemento a ser verificado.
     * @param {*} [pDefaultValue=""] Valor retornado quando `pElement` estiver vazio.
     * @returns {*} Elemento válido.
     */
    getNotEmpty: (pElement, pDefaultValue = '') => {
        if (isEmpty(pElement)) {
            return pDefaultValue;
        } else {
            return pElement;
        }
    },

    //----------------------------------------------------
    /**
     * Tenta converter o valor para o tipo informado.
     *
     * Tipos suportados: `string`, `number`, `date`, `datetime` e `object`.
     *
     * @param {*} pValue Valor a ser analisado.
     * @param {*} pType Tipo de dado desejado.
     * @returns {*} Valor convertido, ou o original em caso de falha.
     */
    getValueAs: (pValue, pType) => {
        let xValue = pValue;
        let xType = pType || null;
        if (xType) {
            try {
                xType = xType.trim().toLowerCase();
                switch (xType) {
                    case 'string':
                        if (!isString(xValue)) {
                            xValue = String(xValue);
                        }
                        break;
                    case 'number':
                        if (!isNumber(xValue)) {
                            xValue = parseFloat(xValue);
                        }
                        break;
                    case 'date':
                        if (!isDate(xValue)) {
                            xValue = new Date(Date.parse(xValue));
                        }
                        break;
                    case 'datetime':
                        if (!isDate(xValue)) {
                            xValue = new Date(Date.parse(xValue));
                        }
                        break;
                    case 'object':
                        if (!isObject(xValue)) {
                            xValue = JSON.parse(xValue);
                        }
                        break;
                }
            } catch (err) {
                console.log(err);
            }
        }
        return xValue;
    },

    /**
     * Cria cópia profunda simples serializando o objeto em JSON.
     *
     * Não preserva funções, `Date`, `Map`, `Set` ou referências circulares.
     *
     * @param {object} pSource Objeto original.
     * @return {object} Cópia do objeto.
     */
    deepCopy: pSource => {
        return JSON.parse(JSON.stringify(pSource));
    },

    /**
     * Retorna um deep merge dos objetos.
     * pTarget receberá todos os atributos contidos em pSource.
     * Atributos já existentes em pTarget serão sobreescritos pelo valores em pSource.
     *
     * @param {object} pTarget Objeto base que receberá os atributos de pSource. Este objeto mantém seu valores originais. O objeto resultado do merge é retorna na função.
     * @param {object} pSource Objeto com atributos que serão copiados para pTarget.
     * @param {object} [pOptionsArgument=null] Opções de merge.
     * @param {boolean} [pOptionsArgument.clone=false] Clona estruturas mergeáveis antes de reutilizá-las.
     * @param {function} [pOptionsArgument.arrayMerge=objects.defaultArrayMerge] Estratégia de merge para arrays.
     * @returns {object} Resultado do merge.
     * @example
     * objects.deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } }); // { a: 1, b: { c: 2, d: 3 } }
     */
    deepMerge: (pTarget, pSource, pOptionsArgument = null) => {
        const xOptions = pOptionsArgument || {
            arrayMerge: objects.defaultArrayMerge
        };
        const xArrayMerge = xOptions.arrayMerge || objects.defaultArrayMerge;

        if (isArray(pSource)) {
            return isArray(pTarget)
                ? xArrayMerge(pTarget, pSource, pOptionsArgument)
                : objects.cloneIfNecessary(pSource, pOptionsArgument);
        } else {
            return objects.mergeObject(pTarget, pSource, pOptionsArgument);
        }
    },

    /**
     * Executa `deepMerge` sequencialmente sobre todos os itens do array.
     *
     * @param {Array} pArray Array com pelo menos dois objetos.
     * @param {object} [pOptionsArgument] Opções repassadas para `deepMerge`.
     * @returns {object}
     */
    deepMergeAll: (pArray, pOptionsArgument) => {
        if (!isArray(pArray) || pArray.length < 2) {
            throw new Error('first argument should be an array with at least two elements');
        }

        // we are sure there are at least 2 values, so it is safe to have no initial value
        return pArray.reduce((prev, next) => {
            return objects.deepMerge(prev, next, pOptionsArgument);
        });
    },

    /**
     * Retorna alvo vazio compatível com o tipo recebido.
     *
     * @param {*} pValue Valor de referência.
     * @returns {Array|Object}
     */
    emptyTarget: pValue => {
        return Array.isArray(pValue) ? [] : {};
    },

    /**
     * Clona o valor quando a opção `clone` estiver habilitada e o valor for mergeável.
     *
     * @param {*} pValue Valor a ser avaliado.
     * @param {object} pOptionsArgument Opções do merge.
     * @returns {*}
     */
    cloneIfNecessary: (pValue, pOptionsArgument) => {
        const xClone = pOptionsArgument && pOptionsArgument.clone === true;
        return xClone && isMergeable(pValue)
            ? objects.deepMerge(objects.emptyTarget(pValue), pValue, pOptionsArgument)
            : pValue;
    },

    /**
     * Estratégia padrão de merge para arrays.
     *
     * Mantém itens existentes, faz merge de itens mergeáveis na mesma posição
     * e adiciona novos itens não duplicados ao final.
     *
     * @param {Array} pTarget Array base.
     * @param {Array} pSource Array de origem.
     * @param {object} pOptionsArgument Opções do merge.
     * @returns {Array}
     */
    defaultArrayMerge: (pTarget, pSource, pOptionsArgument) => {
        let xDestination = pTarget.slice();
        pSource.forEach((e, i) => {
            if (isUndefined(xDestination[i])) {
                xDestination[i] = objects.cloneIfNecessary(e, pOptionsArgument);
            } else if (isMergeable(e)) {
                xDestination[i] = objects.deepMerge(pTarget[i], e, pOptionsArgument);
            } else if (pTarget.indexOf(e) === -1) {
                xDestination.push(objects.cloneIfNecessary(e, pOptionsArgument));
            }
        });
        return xDestination;
    },

    /**
     * Executa merge profundo entre objetos simples.
     *
     * @param {object} pTarget Objeto base.
     * @param {object} pSource Objeto de origem.
     * @param {object} pOptionsArgument Opções do merge.
     * @returns {object}
     */
    mergeObject: (pTarget, pSource, pOptionsArgument) => {
        let xTarget = pTarget || {};
        let xDestination = {};
        if (isMergeable(pTarget)) {
            Object.keys(pTarget).forEach(xKey => {
                xDestination[xKey] = objects.cloneIfNecessary(pTarget[xKey], pOptionsArgument);
            });
        }
        Object.keys(pSource).forEach(xKey => {
            if (!isMergeable(pSource[xKey]) || !xTarget[xKey]) {
                xDestination[xKey] = objects.cloneIfNecessary(pSource[xKey], pOptionsArgument);
            } else {
                xDestination[xKey] = objects.deepMerge(xTarget[xKey], pSource[xKey], pOptionsArgument);
            }
        });
        return xDestination;
    },

    /**
     * Retorna diferenças entre dois objetos usando `deep-diff`.
     *
     * @param {object} pCurrentData Dados atuais.
     * @param {object} pNewData Novos dados.
     * @param {function} [pOnMerge=null] Função chamada quando for efetuado o merge dos dados. Merge somente será efetuado se função for informada;
     * @returns {object} Lista de diferenças ou `undefined` quando não houver mudanças.
     */
    getDiff: (pCurrentData, pNewData, pOnMerge = null) => {
        let xCurrentData = objects.deepCopy(pCurrentData);
        let xNewData = objects.deepCopy(pNewData);
        if (isFunction(pOnMerge)) {
            // Exclui dados vazios do estado atual antes de comparar.
            xCurrentData = objects.deleteNull(xCurrentData);
            // Incorpora os novos dados para comparar o estado consolidado.
            xNewData = objects.deepMerge(xCurrentData, xNewData);
            pOnMerge(xNewData);
        }
        return diff(xCurrentData, xNewData, {
            normalize: (_path, _key, lhs, rhs) => {
                if (isNumber(lhs)) {
                    lhs = lhs.toString();
                }
                if (isNumber(rhs)) {
                    rhs = rhs.toString();
                }
                return [lhs, rhs];
            }
        });
    },

    /**
     * Retorna a quantidade de propriedades diretas do objeto.
     *
     * @param {object} pObject Objeto origem.
     * @returns {number}
     */
    getSize: pObject => {
        return Object.keys(pObject).length;
    },

    /**
     * Compara dois valores recursivamente para saber se são equivalentes.
     *
     * Suporta objetos simples, arrays, `Date` e `RegExp`.
     *
     * @param {*} pObj1 Primeiro valor.
     * @param {*} pObj2 Segundo valor.
     * @return {boolean}
     */
    isEqual(pObj1, pObj2) {
        // Verifica se ambos são exatamente o mesmo objeto (referência)
        if (pObj1 === pObj2) return true;

        // Verifica se algum dos objetos é null ou undefined
        if (pObj1 == null || pObj2 == null || typeof pObj1 !== 'object' || typeof pObj2 !== 'object') {
            return pObj1 === pObj2;
        }

        // Verifica se um dos objetos é Date
        if (pObj1 instanceof Date && pObj2 instanceof Date) {
            return pObj1.getTime() === pObj2.getTime();
        }

        // Verifica se um dos objetos é RegExp
        if (pObj1 instanceof RegExp && pObj2 instanceof RegExp) {
            return pObj1.toString() === pObj2.toString();
        }

        // Verifica se os objetos têm o mesmo número de propriedades
        const keys1 = Object.keys(pObj1);
        const keys2 = Object.keys(pObj2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        // Verifica cada propriedade recursivamente
        for (const key of keys1) {
            if (!keys2.includes(key) || !objects.isEqual(pObj1[key], pObj2[key])) {
                return false;
            }
        }

        return true;
    }
};
module.exports = objects;
