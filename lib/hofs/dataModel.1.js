const { getValueAs } = require('../utils/objects');
const {
    isSymbol,
    isObject,
    isEmpty,
    trueTypeOf
} = require('../utils/validators');

/**
 * Retorna objeto com a garantia que os valores estarão conforme a propriedade 'type' de cada item.
 * Os types válidos são: 'number', 'string', 'date' e 'json'.
 * ex: {client_id:{type:"number"}, client_name:{type:"string"}}.
 *
 * @param {*} [pSource={}]
 * @param {boolean} [pOptions={ strict: false }] //strict: configura se novos itens, não definidos anteriormente,
 * 												  podem ou não ser adicionados ao pSource.
 * @returns
 */
const dataModel = (
    pSource = {},
    pOptions = { strict: false, convert: true }
) => {
    //Descosidera se não for um objeto simples
    if (!isObject(pSource)) {
        return pSource;
    }
    return new Proxy(pSource, {
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
            if (key[0] === '_') {
                return false;
            }
            return pProp in pObj;
        },
        ownKeys(pObj) {
            // Object.getOwnPropertyNames(object1)
            return Reflect.ownKeys(pObj);
        },
        apply: function(pObj, thisArg, argumentsList) {
            console.log('called: ' + argumentsList.join(', '));
            return argumentsList[0] + argumentsList[1] + argumentsList[2];
        }
    });
};

module.exports = dataModel;
