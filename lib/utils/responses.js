const { isObject } = require('./validators');
const { arrayToObject } = require('./arrays');
const { i } = require('investira.sdk/lib/utils/invests');

const responses = {
    /**
     * Retorna data ou de um atributo de data
     *
     * @param {Object} pResp
     * @param {String} pKey
     * @returns {String | Number | Array | Object}
     */
    getObjData: (pResp, pKey) => {
        const xData = pResp.data[pKey] || pResp.data;
        return xData;
    },

    /**
     * Retorna data ou de um atributo de data
     *
     * @param {Object} pResp
     * @param {String} pKey
     * @returns {String | Number | Array | Object}
     */
    getObjFullData: (pResp, pKey) => {
        const xData = pResp.data.data[pKey] || pResp.data.data;
        return xData;
    },

    /**
     * Retorna pages ou de um atributo de pages
     *
     * @param {Object} pResp
     * @param {String} pKey
     * @returns {String | Number | Array | Object}
     */
    getObjPages: (pResp, pKey) => {
        let xData = null;

        if (pResp.pages) {
            xData = pKey ? pResp.pages[pKey] : pResp.pages;
        }
        return xData;
    },

    /**
     * Retorna message ou de um atributo de message
     *
     * @param {Object} pResp
     * @param {String} pKey
     * @returns {Object | String}
     */
    getObjMessage: (pResp, pKey) => {
        let xData = null;
        if (pResp.message) {
            xData = pResp.message[pKey] || pResp.message;
        }
        return xData;
    },

    /**
     * Retorna a descrição da mensagem
     *
     * @param {Object} pResp
     * @returns {String}
     */
    getMessageText: pResp => {
        return responses.getObjMessage(pResp, 'description');
    },

    /**
     * Retorna o código da mensagem
     *
     * @param {Object} pResp
     * @returns {String}
     */
    getMessageCode: pResp => {
        return responses.getObjMessage(pResp, 'code').status;
    },

    /**
     * Retorna error ou um atributo de erro
     *
     * @param {Object} pResp
     * @param {String} pKey
     * @returns {String | Object},
     */
    getError: (pResp, pKey) => {
        const xError = pResp.error[pKey] || pResp.error;
        return xError;
    },

    /**
     * Retorna o status HTTP da resposta
     *
     * @param {Object} pResp
     * @returns {Number},
     */

    getStatusCode: pResp => {
        return pResp.status;
    },

    /**
     * Retorna o valor do código de erro
     *
     * @param {Object} pResp
     * @returns {Number}
     */
    getErrorCode: pResp => {
        let xCode = responses.getError(pResp, 'code');
        return xCode.status ? xCode.status : 500; // retorna 500 caso seja a resposta seja undefined
    },

    /**
     * Retorna a mensagem de erro
     *
     * @param {object} pResp
     * @returns {String}
     */
    getErrorText: pResp => {
        return responses.getError(pResp, 'description');
    },
    /**
     * Retorna data de series de um gráfico
     *
     * @param {Object} pResp
     * @param {Number} pIndex
     * @returns {Array | Object}
     */
    getSeries: (pResp, pIndex) => {
        let series = pIndex >= 0 ? pResp.data.series[pIndex].data : pResp.data.series;
        return series;
    },

    /**
     * Retorna objeto separando {data, pages} quando pQueryClauses possuir 'size' e 'totalItemsPromise'.
     * Se houve controle de 'size':
     * - chama a promise definida em pTotalItensPromise para recuperar a quantidade de registros total
     * - retorna objeto no padrão {data: pages:{total_items}}
     *
     * @param {array} pMainResult Result principal
     * @param {*} [pClauses=null]
     * @param {*} [pReferenciaFuncao=null] Referencia a uma função que retorna uma promise que retorna a quantidade total de itens
     * @param {object} [pArrayToObjectParams=null] Parametros para a criação da chave dos objetos
     * - keyPropertyName
     * - keyFormatFunction
     * - keyPrefix
     * @returns {Promise}
     */
    serviceDataResponse: async (
        pMainResult,
        pClauses = null,
        pReferenciaFuncao = null,
        pArrayToObjectParams = null
    ) => {
        //Se size, para controle de paginação, foi definido, converte array em objeto e/ou busca quantidade total de registros
        let xMainResult = pMainResult;
        if (pClauses?.limit?.size) {
            if (pArrayToObjectParams && pArrayToObjectParams.keyPropertyName) {
                //Converte array em objeto
                const { keyPropertyName, keyFormatFunction = null, keyPrefix = '_' } = pArrayToObjectParams;
                xMainResult = arrayToObject(pMainResult, keyPropertyName, keyFormatFunction, keyPrefix);
            }
            if (pReferenciaFuncao) {
                //Trata a referencia a função ou promise
                //O correto é que seja informado uma referencia a uma função
                //para evitar que ela seja chamada desnecessariamente já na linha de comando
                //Foi mantido o código original para não quebrar funcionalidades existentes
                return Promise.resolve()
                    .then(() => {
                        //Paremetro é uma referencia a uma função
                        if (typeof pReferenciaFuncao === 'function') {
                            //Executa a função
                            return pReferenciaFuncao();
                            //Parametro é uma promise
                        } else if (pReferenciaFuncao instanceof Promise) {
                            //Executa a promise
                            return pReferenciaFuncao;
                        }
                        return 0;
                    })
                    .then(rCount => {
                        return {
                            data: xMainResult,
                            pages: { total_items: rCount }
                        };
                    })
                    .catch(rErr => {
                        console.log(rErr);
                    });
            }
        }
        return Promise.resolve(xMainResult || {});
    },

    /**
     * Retorna resultado no formado {data, pages, message}
     *
     * @param {*} pResult
     * @param {boolean} [pMessage=null]
     * @returns {object}
     */
    routeDataResponse: (pResult = {}, pMessage = null) => {
        //Responde objeto já contendo 'data' e 'pages'
        if (isObject(pResult) && pResult.hasOwnProperty('data') && pResult.hasOwnProperty('pages')) {
            return pResult;
        }
        //Assume que pResult é o conteúdo a ser utilizado no atributo data
        const xResponse = {
            data: pResult
        };
        //Inclui mensagem na resposta
        if (pMessage) {
            xResponse.message = pMessage;
        }
        return xResponse;
    }
};

module.exports = responses;
