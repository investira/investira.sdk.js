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
     * Retorna result principal limitado pela quantidade de registros por página e total de registros global.
     * Se houve controle de 'size':
     * - chama a promise definida em pCountPromise para recuperar a quantidade de registros total
     * - retorna objeto no padrão {data: pages:{total_items}}
     *
     * @param {*} [pMainResult={}] Result principal
     * @param {*} pQueryClauses
     * @param {Promise} pCountPromise
     * @returns {Promise}
     */
    serviceResultWithPagesTotalItems: (pMainResult = {}, pQueryClauses = null, pCountPromise) => {
        if (pQueryClauses && pQueryClauses.limit && pQueryClauses.limit.size && pCountPromise) {
            return pCountPromise.then(rCount => {
                return { data: pMainResult, pages: { total_items: rCount } };
            });
        }
        return Promise.resolve(pMainResult);
    },

    /**
     * Retorna resultado no formado {data, pages}
     *
     * @param {*} pResult
     * @param {boolean} [pVerifyPage=true]
     * @returns {object}
     */
    routeDataResponse: (pResult, pVerifyPage = true) => {
        if (pVerifyPage) {
            //Desconstroi array da resposta para verficar se possui paginação
            const { data, pages } = pResult;
            //
            if (pages) {
                if (data) {
                    return { data, pages };
                } else {
                    return { data: {}, pages };
                }
            }
        }
        return { data: pResult || {} };
    }
};

module.exports = responses;
