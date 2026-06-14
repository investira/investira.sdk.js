/**
 * Expressão regular base utilizada para validação de e-mails.
 *
 * Observação:
 * Mantém a regra atual do projeto sem flexibilizar ou endurecer a validação.
 *
 * @type {RegExp}
 */
const EMAIL_REGEX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Conjunto de validadores utilitários usados no SDK.
 *
 * Cada método centraliza uma regra simples de detecção de tipo,
 * conteúdo vazio ou interpretação booleana para reutilização no projeto.
 */
const validators = {
    /**
     * Verifica se dois valores possuem a mesma representação serializada em JSON.
     *
     * Observação:
     * A comparação depende da ordem das chaves/itens produzida pelo `JSON.stringify`.
     *
     * @param {array | object} pElementA Primeiro elemento a ser comparado.
     * @param {array | object} pElementB Segundo elemento a ser comparado.
     * @return {boolean} `true` quando os valores serializados forem idênticos.
     */
    isEqual: (pElementA, pElementB) => {
        return JSON.stringify(pElementA) == JSON.stringify(pElementB);
    },

    /**
     * Verifica se o valor é nulo, indefinido ou a string literal `"null"`.
     *
     * @param {*} toValidate Elemento a ser verificado.
     * @return {boolean} `true` quando o valor for considerado nulo.
     */
    isNull: toValidate => {
        return (
            toValidate === null ||
            validators.isUndefined(toValidate) ||
            String(toValidate).toLocaleLowerCase() === 'null'
        );
    },

    /**
     * Verifica se o valor está vazio de acordo com o seu tipo.
     *
     * Regras aplicadas:
     * - `null` e `undefined` são vazios.
     * - strings com apenas espaços são vazias.
     * - arrays sem itens são vazios.
     * - objetos sem chaves próprias são vazios.
     *
     * @param {*} toValidate Elemento a ser verificado.
     * @return {boolean} `true` quando o valor for considerado vazio.
     */
    isEmpty: toValidate => {
        if (validators.isNull(toValidate)) {
            // Valores nulos ou indefinidos sempre são tratados como vazios.
            return true;
        } else if (validators.isString(toValidate)) {
            // Remove espaços das extremidades antes de validar conteúdo textual.
            if (toValidate.trim() === '') {
                return true;
            }
        } else if (validators.isArray(toValidate)) {
            // Arrays sem itens não possuem conteúdo útil.
            if (toValidate.length === 0) {
                return true;
            }
        } else if (validators.isObject(toValidate)) {
            // Objetos sem chaves representam ausência de dados.
            if (Object.keys(toValidate).length === 0) {
                return true;
            }
        }
        return false;
    },

    /**
     * Verifica se o valor é um objeto.
     *
     * @param {*} toValidate Elemento a ser verificado.
     * @returns {boolean} `true` quando for um objeto literal.
     */
    isObject: toValidate => {
        return !!(
            toValidate &&
            (toValidate.constructor === Object || Object.getPrototypeOf(toValidate) === Object.prototype)
        );
    },

    /**
     * Verifica se o valor é uma string.
     *
     * @param {*} toValidate Elemento a ser verificado.
     * @returns {boolean} `true` quando o tipo real for `string`.
     */
    isString: toValidate => {
        return validators.trueTypeOf(toValidate) === 'string';
    },

    /**
     * Verifica se o valor é uma string contendo JSON válido.
     *
     * @param {*} toValidate Elemento a ser verificado.
     * @returns {boolean} `true` quando a string puder ser convertida com `JSON.parse`.
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
     * Verifica se o valor é um array.
     *
     * @param {*} toValidate Elemento a ser verificado.
     * @returns {boolean} `true` quando o valor for um array.
     */
    isArray: toValidate => {
        return Array.isArray(toValidate);
    },

    /**
     * Verifica se o valor é `undefined` ou a string literal `"undefined"`.
     *
     * @param {*} toValidate Elemento a ser verificado.
     * @returns {boolean} `true` quando o valor for considerado indefinido.
     */
    isUndefined: toValidate => {
        if (toValidate === undefined) {
            return true;
        }
        return (
            validators.trueTypeOf(toValidate) === 'undefined' || String(toValidate).toLocaleLowerCase() === 'undefined'
        );
    },

    /**
     * Verifica se o valor é booleano.
     *
     * @param {*} toValidate Elemento a ser verificado.
     * @returns {boolean} `true` quando o tipo real for `boolean`.
     */
    isBoolean: toValidate => {
        return validators.trueTypeOf(toValidate) === 'boolean';
    },

    /**
     * Verifica se o valor é numérico e possui tipo real `number`.
     *
     * @param {*} toValidate Elemento a ser verificado.
     * @returns {boolean} `true` quando o valor for um número válido.
     */
    isNumber: toValidate => {
        return !isNaN(toValidate) && validators.trueTypeOf(toValidate) === 'number';
    },

    /**
     * Verifica se o valor é uma instância válida de `Date`.
     *
     * @param {*} toValidate Elemento a ser verificado.
     * @returns {boolean} `true` quando o valor for uma data válida.
     */
    isDate: toValidate => {
        return validators.trueTypeOf(toValidate) === 'date' && !isNaN(toValidate.valueOf());
    },

    /**
     * Verifica se o valor é um `Symbol`.
     *
     * @param {*} toValidate Elemento a ser verificado.
     * @returns {boolean} `true` quando o tipo real for `symbol`.
     */
    isSymbol: toValidate => {
        return validators.trueTypeOf(toValidate) === 'symbol';
    },

    /**
     * Verifica se o valor é uma função síncrona ou assíncrona.
     *
     * @param {*} toValidate Elemento a ser verificado.
     * @returns {boolean} `true` quando o valor for uma função.
     */
    isFunction: toValidate => {
        const xType = validators.trueTypeOf(toValidate);
        return xType === 'function' || xType === 'asyncfunction';
    },

    /**
     * Verifica se o valor é um objeto puro que pode participar de mesclagens.
     *
     * Objetos `RegExp` e `Date` são excluídos intencionalmente.
     *
     * @param {*} toValidate Elemento a ser verificado.
     * @returns {boolean} `true` quando o valor puder ser mesclado com segurança.
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
     * Cria um validador que compara o atributo `length` de outro valor.
     *
     * @param {number} length Tamanho mínimo exclusivo para comparação.
     * @returns {function(*): boolean} Função que retorna `true` quando `toValidate.length > length`.
     */
    isLengthGreaterThen: length => toValidate => toValidate.length > length,

    /**
     * Retorna o tipo real do valor em letras minúsculas.
     *
     * Usa `Object.prototype.toString` para evitar ambiguidades de `typeof`.
     *
     * @param {*} toValidate Elemento a ser verificado.
     * @returns {string} Tipo identificado em minúsculas.
     */
    trueTypeOf: toValidate => {
        return Object.prototype.toString.call(toValidate).slice(8, -1).toLowerCase();
    },

    /**
     * Verifica se um e-mail atende à expressão regular padrão do projeto.
     *
     * @param {string} pEmail E-mail a ser testado.
     * @return {boolean} `true` quando o e-mail for válido.
     */
    isEmail: pEmail => {
        return EMAIL_REGEX.test(String(pEmail).toLowerCase());
    },

    /**
     * Verifica se um valor deve ser interpretado como verdadeiro.
     *
     * Regras aceitas:
     * - número `1`
     * - número `-1`
     * - strings `"1"`, `"-1"` e `"true"`
     *
     * @param {*} pValue Valor que será testado.
     * @return {boolean} `true` quando o valor representar verdadeiro.
     */
    isTrue: pValue => {
        if (pValue === null || validators.isUndefined(pValue)) {
            return false;
        }

        if (pValue === -1 || pValue === 1) {
            return true;
        }

        const xString = String(pValue).trim().toLowerCase();
        return (
            xString === 'true' ||
            xString === '1' ||
            xString === '-1' ||
            xString === 'yes' ||
            xString === 'sim' ||
            xString === 's' ||
            xString === 'y' ||
            xString === 'si' ||
            xString === 'ok'
        );
    }
};

module.exports = validators;
