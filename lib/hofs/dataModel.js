const { getValueAs } = require('../utils/objects');
const { isSymbol, isEmpty, trueTypeOf } = require('../utils/validators');

/**
 * Cria um proxy que garante a tipagem dos valores de um objeto conforme o atributo 'type' de cada propriedade.
 * 
 * @description
 * Esta função cria um proxy que intercepta o acesso às propriedades de um objeto e garante que seus valores
 * estejam de acordo com o tipo especificado no atributo 'type' de cada propriedade.
 * 
 * Tipos válidos:
 * - number: Valores numéricos
 * - string: Textos
 * - date: Data (sem hora)
 * - datetime: Data e hora
 * - array: Arrays/Listas
 * - email: Endereços de email
 * - title: Textos formatados como título
 * - object: Objetos
 * 
 * Exemplo de uso:
 * ```javascript
 * const modelo = {
 *   client_id: { type: "number" },
 *   client_name: { type: "string" }
 * };
 * const data = dataModel(modelo);
 * ```
 * 
 * @param {object} [pSource={}] Objeto modelo com as definições de tipos
 * @param {object} [pOptions] Opções de configuração
 * @param {boolean} [pOptions.strict=false] Se true, restringe as propriedades apenas às definidas no modelo
 * @param {boolean} [pOptions.convert=false] Se true, tenta converter os valores para o tipo definido
 * @returns {Proxy} Proxy que garante a tipagem dos valores
 */
function dataModel(pSource = {}, pOptions = { strict: false, convert: false }) {
    //Cria novo objeto identico ao pSource, para evitar contaminação dos dados, que por acaso existam anteriormente em pSource.
    let xObject = JSON.parse(JSON.stringify(pSource));
    //Cria Proxy
    return new Proxy(xObject, {
        /**
         * Intercepta o acesso às propriedades do objeto
         * 
         * @param {object} pObj Objeto original
         * @param {string} pProp Nome da propriedade sendo acessada
         * @returns {*} Valor da propriedade convertido para o tipo apropriado
         */
        get: (pObj, pProp) => {
            if (isSymbol(pProp) || pProp == 'toJSON') {
                return pObj;
            }
            //Converte valor para o type definido.
            //Se type não existir, utiliza o valor sem conversão
            let xValue = null;
            if (pProp in pObj) {
                xValue = Reflect.get(pObj[pProp], 'value');
                if (pOptions.convert) {
                    xValue = getValueAs(xValue, pObj[pProp].type);
                }
            }
            return xValue;
        },
        /**
         * Intercepta a atribuição de valores às propriedades
         * 
         * @param {object} pObj Objeto original
         * @param {string} pProp Nome da propriedade sendo modificada
         * @param {*} pValue Novo valor sendo atribuído
         * @returns {boolean} True se a atribuição foi bem sucedida
         */
        set: (pObj, pProp, pValue) => {
            let xValue = pValue;
            //Verifica se propriedade existe
            if (pProp in pObj) {
                //Converte valor para o type definido.
                if (pOptions.convert) {
                    xValue = getValueAs(xValue, pObj[pProp].type);
                }
                //Verifica tipo
                if (!isEmpty(pObj[pProp].type)) {
                    let xType = trueTypeOf(xValue);
                    if (pObj[pProp].type == 'object') {
                        xType = 'object';
                    }
                    if (xType != pObj[pProp].type) {
                        throw Error(
                            `Tipo de dado inválido para a propriedade "${pProp}"! Tipo informado "${xType}" é difente do tipo requerido "${pObj[pProp].type}"`
                        );
                    }
                }
            } else if (!pOptions.strict) {
                //Se não for restritivo, adiciona atributo ao objeto
                Reflect.set(pObj, pProp, {});
            } else {
                //Retorna sem salvar
                return;
            }
            //Salva valor ao objeto
            return Reflect.set(pObj[pProp], 'value', xValue);
        },
        /**
         * Intercepta a remoção de propriedades do objeto
         * 
         * @param {object} pObj Objeto original
         * @param {string} pProp Nome da propriedade a ser removida
         * @returns {boolean} True se a propriedade foi removida com sucesso
         */
        deleteProperty(pObj, pProp) {
            return Reflect.deleteProperty(pObj, pProp);
        },
        /**
         * Verifica se uma propriedade existe no objeto
         * Propriedades que começam com '_' são consideradas privadas e retornam false
         * 
         * @param {object} pObj Objeto original
         * @param {string} pProp Nome da propriedade a ser verificada
         * @returns {boolean} True se a propriedade existe e não é privada
         */
        has(pObj, pProp) {
            if (pProp[0] === '_') {
                return false;
            }
            return pProp in pObj;
        },
        /**
         * Retorna todas as chaves próprias do objeto
         * 
         * @param {object} pObj Objeto original
         * @returns {Array<string>} Array com todas as chaves próprias do objeto
         */
        ownKeys(pObj) {
            return Reflect.ownKeys(pObj);
        },
        /**
         * Intercepta chamadas de função no objeto
         * 
         * @param {object} pObj Objeto original (função)
         * @param {*} thisArg Valor de 'this' para a chamada
         * @param {Array<*>} argumentsList Lista de argumentos passados para a função
         * @returns {*} Resultado da chamada da função
         */
        apply: function (pObj, thisArg, argumentsList) {
            return argumentsList[0] + argumentsList[1] + argumentsList[2];
        }
    });
}

module.exports = dataModel;
