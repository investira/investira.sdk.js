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
const dataModel = (pSource = {}, pOptions = { strict: false }) => {
    //Descosidera se não for um objeto simples
    if (!isObject(pSource)) {
        return pSource;
    }
    return new Proxy(pSource, {
        get: (pObj, pProp) => {
            if (isSymbol(pProp)) {
                return pObj;
            }
            // console.log(`GET ${pProp}`);
            //Converte valor para o type definido.
            //Se type não existir, utiliza o valor sem conversão
            let xValue = getValueAs(
                Reflect.get(pObj[pProp], 'value'),
                pObj[pProp].type
            );
            return xValue;
            //Restritivo
            // if (pProp in pObj) {
        },
        set: (pObj, pProp, pReceiver) => {
            // console.log(`SET ${pProp} = ${pReceiver}`);
            let xValue = pReceiver;
            //Verifica se propriedade existe
            if (!isUndefined(pObj[pProp])) {
                //Converte valor para o type definido.
                //Se type não existir, utiliza o valor sem conversão
                xValue = getValueAs(xValue, pObj[pProp].type);
            } else if (!pOptions.strict) {
                //Se não for restritivo, adiciona atributo ao objeto
                Reflect.set(pObj, pProp, {});
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
        },
    });
};

module.exports = dataModel;
