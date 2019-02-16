const { isEmpty } = require("./validators");

const objects = {
    /**
     * Retorna objeto contendo tendo a propriedade e respectivo valor: ex: {propriedade:'valor'}
     *
     * @param {String} pProperty
     * @param {*} pValue
     * @returns Objeto JS
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
     * Exclui as propriedades contidas no objeto cujos nomes NÃO façam parte da lista
     *
     * @param {Object} pObject Objeto origem
     * @param {Array} pProperties Array com os nomes das propriedades válidas: ex: ["client_id", "client_name"]
     * @returns Objeto somente com as propriedades válidas
     */
    objectCleanup: (pObject, pProperties) => {
        if (isEmpty(pObject)) {
            throw Error("Objeto não informado");
        }
        if (isEmpty(pProperties)) {
            return pObject;
        }
        let xObject = { ...pObject };
        Object.keys(xObject).forEach(
            xProperty =>
                pProperties.includes(xProperty) || delete xObject[xProperty]
        );
        return xObject;
    }
};
module.exports = objects;
// '{"' + a[0] + '":"world"}';
