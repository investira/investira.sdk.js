const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const validators = {
    /**
     * Verifica se um array ou objetos são iguais.
     *
     * @param {array | object} pElementA Elemento a ser verificado
     * @param {array | object} pElementB Elemento a ser verificado
     * @return {boolean}
     */
    isEqual: (pElementA, pElementB) => {
        return JSON.stringify(pElementA) == JSON.stringify(pElementB);
    },

    /**
     * Verifica se elemento é nulo ou undefined.
     *
     * @param {object} toValidate Elemento a ser verificado
     * @return {boolean} Se é nulo
     */
    isNull: toValidate => {
        return toValidate === null || validators.isUndefined(toValidate);
    },

    /**
     * Verifica se elemento é nulo, undefined ou vazio.
     *
     * @param {object} toValidate Elemento a ser verificado
     * @return {boolean} Se é vazio
     */
    isEmpty: toValidate => {
        if (validators.isNull(toValidate)) {
            return true;
        } else if (validators.isString(toValidate)) {
            if (toValidate.trim() === '') {
                return true;
            }
        } else if (validators.isArray(toValidate)) {
            if (toValidate.length === 0) {
                return true;
            }
        } else if (validators.isObject(toValidate)) {
            if (Object.keys(toValidate).length === 0) {
                return true;
            }
        }
        return false;
    },

    /**
     * Retorna se é um objeto
     * @param {object} toValidate Elemento a ser verificado
     * @returns {boolean}
     */
    isObject: toValidate => {
        return toValidate && validators.trueTypeOf(toValidate) === 'object' && toValidate.constructor === Object;
    },

    /**
     * Retorna se é uma string
     * @param {object} toValidate Elemento a ser verificado
     * @returns {boolean}
     */
    isString: toValidate => {
        return validators.trueTypeOf(toValidate) === 'string';
    },

    /**
     * Retorna se é uma string JSON
     * @param {object} toValidate Elemento a ser verificado
     * @returns {boolean}
     */
    isJSONString: toValidate => {
        if (!validators.isString(toValidate)) {
            return false;
        }
        try {
            JSON.parse(toValidate);
            return true;
        } catch (err) {
            return false;
        }
    },

    /**
     * Retorna se é um array
     * @param {object} toValidate Elemento a ser verificado
     * @returns {boolean}
     */
    isArray: toValidate => {
        return Array.isArray(toValidate) || validators.trueTypeOf(toValidate) === 'array';
    },

    /**
     * Retorna se é undefined
     * @param {object} toValidate Elemento a ser verificado
     * @returns {boolean}
     */
    isUndefined: toValidate => {
        return validators.trueTypeOf(toValidate) === 'undefined';
    },

    /**
     * Retorna se é um boleano
     * @param {object} toValidate Elemento a ser verificado
     * @returns {boolean}
     */
    isBoolean: toValidate => {
        return validators.trueTypeOf(toValidate) === 'boolean';
    },

    /**
     * Retorna se é um número
     * @param {object} toValidate Elemento a ser verificado
     * @returns {boolean}
     */
    isNumber: toValidate => {
        return !isNaN(toValidate) && validators.trueTypeOf(toValidate) === 'number';
    },

    /**
     * Retorna se é uma data
     * @param {object} toValidate Elemento a ser verificado
     * @returns {boolean}
     */
    isDate: toValidate => {
        return validators.trueTypeOf(toValidate) === 'date' && !isNaN(toValidate.valueOf());
    },

    /**
     * Retorna se é um Symbol
     * @param {object} toValidate Elemento a ser verificado
     * @returns {boolean}
     */
    isSymbol: toValidate => {
        return validators.trueTypeOf(toValidate) === 'symbol';
    },

    /**
     * Retorna se é uma função
     * @param {object} toValidate Elemento a ser verificado
     * @returns {boolean}
     */
    isFunction: toValidate => {
        const xType = validators.trueTypeOf(toValidate);
        return xType === 'function' || xType === 'asyncfunction';
        // return typeof toValidate === "function";
    },

    /**
     * Retorna se é um objeto que pode ser mesclado
     * @param {object} toValidate Elemento a ser verificado
     * @returns {boolean}
     */
    isMergeable: toValidate => {
        let xNonNullObject = toValidate && validators.isObject(toValidate);

        return (
            xNonNullObject &&
            Object.prototype.toString.call(toValidate) !== '[object RegExp]' &&
            Object.prototype.toString.call(toValidate) !== '[object Date]'
        );
    },

    /**
     * Retorna se tamanho é maior que outro
     * @param {object} toValidate Elemento a ser verificado
     * @returns
     */
    isLengthGreaterThen: length => toValidate => toValidate.length > length,

    /**
     * Retorna tipo
     * @param {any} toValidate Elemento a ser verificado
     * @returns Retorna tipo
     */
    trueTypeOf: toValidate => {
        return Object.prototype.toString.call(toValidate).slice(8, -1).toLowerCase();
    },

    /**
     * Verifica se e-mail é válido
     *
     * @param {string} pEmail e-mail a ser testado
     * @return {boolean}
     */
    isEmail: pEmail => {
        return EMAIL_REGEX.test(String(pEmail).toLowerCase());
    },

    /**
     * Verifica se valor é true
     *
     * @param {*} pValue Valor que será testado
     * @return {boolean}
     */
    isTrue: pValue => {
        //Separado em vário if's para otimizar performance
        if (pValue === null) {
            return false;
        }
        if (validators.isUndefined(pValue)) {
            return false;
        }
        if (pValue === -1 || pValue === 1) {
            return true;
        }
        const xString = String(pValue).trim().toLowerCase();
        if (xString === 'true' || xString === '-1' || xString === '1') {
            return true;
        }
        return false;
    }
};

module.exports = validators;
