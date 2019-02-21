const { getValueAs } = require('../utils/objects');
const { isSymbol, isUndefined, isObject } = require('../utils/validators');

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
const objectModel = (pSource = {}, pOptions = { strict: false }) => {
    //Descosidera se não for um objeto simples
    if (!isObject(pSource)) {
        return pSource;
    }
    return new Proxy(pSource, {
        get: (pObj, pProp) => {
            if (isSymbol(pProp)) {
                return pObj;
            }
            //Restritivo
            if (pProp in pObj) {
                return Reflect.get(pObj, pProp);
            }
        },
        set: (pObj, pProp, pReceiver) => {
            //Restritivo
            if (pProp in pObj) {
                return Reflect.set(pObj, pProp, pReceiver);
            }
            //Salva valor ao objeto
            return 'atributo inexistente';
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
            return argumentsList[0] + argumentsList[1] + argumentsList[2];
        }
    });
};

module.exports = objectModel;
