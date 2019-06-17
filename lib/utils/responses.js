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

        if (pResp.data.pages) {
            xData = pKey ? pResp.data.pages[pKey] : pResp.data.pages;
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
        return pResp ? xCode.status : 500; // retorna 500 caso seja a resposta seja undefined
    },

    /**
     * Retorna a mensagem de erro
     *
     * @param {object} pResp
     * @returns {String}
     */
    getErrorText: pResp => {
        return responses.getError(pResp, 'description');
    }
};

module.exports = responses;
