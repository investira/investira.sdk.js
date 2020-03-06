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

const objects = {
    /**
     * Retorna objeto contendo tendo a propriedade e respectivo valor: ex: {propriedade:'valor'}
     *
     * @param {String} pProperty
     * @param {*} pValue
     * @returns {Object} JS
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
     * Retorna objeto criado a partir de uma string com os atributos separador por ponto 'campo1.campo2.campo3'
     *
     * @param {Object} pString
     * @returns {Object} JS
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
     * Exclui as propriedades contidas no objeto cujos nomes NÃO façam parte da lista
     *
     * @param {Object} pSource Objeto origem
     * @param {array} pProperties Array com os nomes das propriedades válidas: ex: ["client_id", "client_name"]
     * @returns {object} Objeto somente com as propriedades válidas
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
     * Retorna objeto contendo somente os itens em conformidade com o model
     *
     * @param {object} pModel Objeto modelo
     * @param {object} pTarget Objeto a ser validado
     * @returns {object} Objeto somente com as propriedades válidas
     */
    objectCompliance: (pModel, pTarget) => {
        if (!isObject(pTarget) || isNull(pModel)) {
            return pTarget;
        }
        let xObject = {};
        for (const xKey in pTarget) {
            if (pModel.hasOwnProperty(xKey)) {
                //Cria item
                xObject[xKey] = objects.objectCompliance(pModel[xKey], pTarget[xKey]);
            }
        }
        return xObject;
    },

    /**
     * Exclui as propriedades sem filhos
     *
     * @param {Object} pObject Objeto origem
     * @returns {Object} Somente com as propriedades válidas
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
     * Exclui as atributos nulos ou sem fihos
     *
     * @param {Object} pObject Objeto origem
     * @returns {Object} somente com as propriedades válidas
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
     * Retorna uma querystring a partir das chaves e valores de um objeto.
     *
     * @param {object} pObject Objeto origem. ex: {page: 1, size: 5}
     * @returns {string} no formato de querystring. ex: ?page=1&size=5
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
     * Retorna valor definido em default value, caso o valor passado seja nulo.
     *
     * @param {*} pElement Elemento a ser verificado
     * @param {string} [pDefaultValue=""] A ser retornado caso pElement seja nulo
     * @returns Elemento válido
     */

    getNotNull: (pElement, pDefaultValue) => {
        if (isNull(pElement)) {
            return pDefaultValue;
        } else {
            return pElement;
        }
    },

    /**
     * Retorna valor definido em default value, caso o valor passado seja vázio.
     *
     * @param {*} pElement Elemento a ser verificado
     * @param {string} [pDefaultValue=""] A ser retornado caso pElement seja vázio
     * @returns Elemento válido
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
     * Retorna value no type informado.
     *
     * @param {*} pValue Valor a ser analisado
     * @param {*} pType Tipo de dado: 'string', 'number', 'date' e 'object'
     * @returns Retorna no tipo informado
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
     * Copia um elemento para outro.
     *
     * @param {object} pSource Elemento origem
     * @return {object} Copia do elemento
     */
    deepCopy: pSource => {
        return JSON.parse(JSON.stringify(pSource));
    },

    /**
     * Retorna um deep merge dos objetos.
     * pTarget receberá todos os atributos contidos em pSource.
     * Atributos já existentes em pTarget serão sobreescritos pelo valores em pSource.
     *
     * @param {object} pTarget Objeto que receberá os atributos de pSource
     * @param {object} pSource Objeto com atributos que serão copiados para pTarget
     * @param {object} [pOptionsArgument=null]
     * @returns {object}
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

    deepMergeAll: (pArray, pOptionsArgument) => {
        if (!isArray(pArray) || pArray.length < 2) {
            throw new Error('first argument should be an array with at least two elements');
        }

        // we are sure there are at least 2 values, so it is safe to have no initial value
        return pArray.reduce((prev, next) => {
            return objects.deepMerge(prev, next, pOptionsArgument);
        });
    },

    emptyTarget: pValue => {
        return Array.isArray(pValue) ? [] : {};
    },

    cloneIfNecessary: (pValue, pOptionsArgument) => {
        const xClone = pOptionsArgument && pOptionsArgument.clone === true;
        return xClone && isMergeable(pValue)
            ? objects.deepMerge(objects.emptyTarget(pValue), pValue, pOptionsArgument)
            : pValue;
    },

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

    mergeObject: (pTarget, pSource, pOptionsArgument) => {
        let xDestination = {};
        if (isMergeable(pTarget)) {
            Object.keys(pTarget).forEach(xKey => {
                xDestination[xKey] = objects.cloneIfNecessary(pTarget[xKey], pOptionsArgument);
            });
        }
        Object.keys(pSource).forEach(xKey => {
            if (!isMergeable(pSource[xKey]) || !pTarget[xKey]) {
                xDestination[xKey] = objects.cloneIfNecessary(pSource[xKey], pOptionsArgument);
            } else {
                xDestination[xKey] = objects.deepMerge(pTarget[xKey], pSource[xKey], pOptionsArgument);
            }
        });
        return xDestination;
    },

    /**
     * Diferenças entre dois objetos
     * @param {object} pCurrentData Dados atuais
     * @param {object} pNewData Novos dados
     * @param {function} [pOnMerge=null] Função chamada quando for efetuado o merge dos dados. Merge somente será efetuado se função for informada;
     * @returns {object}
     */
    getDiff: (pCurrentData, pNewData, pOnMerge = null) => {
        let xCurrentData = pCurrentData;
        let xNewData = pNewData;
        if (isFunction(pOnMerge)) {
            xCurrentData = objects.deleteNull(pCurrentData);
            xNewData = objects.deepMerge(objects.deleteNull(pCurrentData), objects.deleteNull(pNewData));
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
     * Retorna o "tamanho" do objeto
     * @param {object} pObject Objeto origem. ex: {page: 1, size: 5}
     * @returns {number}
     */
    getSize: pObject => {
        return Object.keys(pObject).length;
    }
};
module.exports = objects;
