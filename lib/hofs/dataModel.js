const { getValueAs } = require('../utils/objects');
const { isSymbol, isEmpty, trueTypeOf } = require('../utils/validators');

/**
 * Retorna objeto com a garantia que os valores estarão conforme o atributo 'type' de cada propriedade.
 * Os types válidos são: 'number', 'string', 'date', 'array' e 'json'.
 * ex: {client_id:{type:"number"}, client_name:{type:"string"}}.
 *
 * @param {*} [pSource={}]
 * @param {object} [pOptions={ strict: false, convert: false }] strict: configura as propriedade deverão res restritas as definidas em pSource.
 * 																 convert: configura se os valores serão convertidos para o tipo de dado definido
 * 																 pelo atributo "type" da propriedade(caso tenha sido definido).
 *
 * @returns
 */
function dataModel(pSource = {}, pOptions = { strict: false, convert: false }) {
    //Cria novo objeto identico ao pSource, para evitar contaminação dos dados, que por acaso existam anteriormente em pSource.
    let xObject = JSON.parse(JSON.stringify(pSource));
    //Cria Proxy
    return new Proxy(xObject, {
        /**
         *
         *
         * @param {*} pObj
         * @param {string} pProp
         * @param {*} pReceiver
         * @returns
         */
        get: (pObj, pProp, pReceiver) => {
            if (isSymbol(pProp) || pProp == 'toJSON') {
                return pObj;
            }

            // console.log(`GET ${pProp}`);
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
         *
         *
         * @param {*} pObj
         * @param {string} pProp
         * @param {*} pValue
         * @returns
         */
        set: (pObj, pProp, pValue) => {
            // console.log(`SET ${pProp} = ${pValue}`);
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
                    if (pObj[pProp].type == 'json') {
                        xType = 'json';
                    }
                    if (xType != pObj[pProp].type) {
                        throw Error(
                            `Tipo de dado inválido para a propriedade "${pProp}"! Tipo informado "${xType}" é difente do tipo requerido "${
                                pObj[pProp].type
                            }"`
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
        deleteProperty(pObj, pProp) {
            return Reflect.deleteProperty(pObj, pProp);
        },
        has(pObj, pProp) {
            if (pProp[0] === '_') {
                return false;
            }
            return pProp in pObj;
        },
        ownKeys(pObj) {
            // Object.getOwnPropertyNames(object1)
            return Reflect.ownKeys(pObj);
        },
        apply: function(pObj, thisArg, argumentsList) {
            // console.log('called: ' + argumentsList.join(', '));
            return argumentsList[0] + argumentsList[1] + argumentsList[2];
        }
    });
}

module.exports = dataModel;
