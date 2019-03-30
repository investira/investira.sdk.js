//Request via 'axios' é utilizado ao invés do 'fetch'
//pois converte automaticamente para json e
//resolve problema no tratamento de erro no 'fetch'
const axios = require('axios');
//@ts-ignore
const baseRequest = axios.create({ timeout: 10000 });
baseRequest.defaults.headers.common['User-Agent'] = 'investira';
const regexIpv4 = new RegExp(/(::ffff:)?(\d+\.\d+.\d+\.\d+(:\d+)?)/);
const localhostIp = '127.0.0.1';

const httpRequests = {
    /**
     *Request básico
     *
     * @param {string} pMethod
     * @param {string} pURI URI do request
     * @param {object} pHeaders Dados do cabeçalho
     * @param {object} pParams Dado passado na URL
     * @param {object} pData Data passado como parametro quando Method for POST ou PUT
     * @returns Promise com resposta
     */
    request: (pMethod, pURI, pHeaders, pParams, pData) => {
        try {
            return new Promise((pResolve, pReject) => {
                baseRequest({
                    url: pURI,
                    headers: pHeaders,
                    method: pMethod,
                    params: pParams,
                    data: pData
                })
                    .then(rRes => {
                        pResolve(rRes);
                    })
                    .catch(rErr => {
                        if (!rErr.response) {
                            pReject(rErr);
                        } else {
                            pResolve(rErr.response);
                        }
                    });
            });
        } catch (err) {
            return Promise.reject(err);
        }
    },

    /**
     *Request POST
     *
     * @param {string} pURI URI do request
     * @param {object} pHeaders Dados do cabeçalho
     * @param {object} pParams Dado passado na URL
     * @param {(ok, resp) => void} pCallback Função que será chamada após execução do request
     * @returns Promise com resposta
     */
    requestGET: (pURI, pHeaders, pParams) => {
        return httpRequests.request('GET', pURI, pHeaders, pParams, null);
    },
    /**
     *Request POST
     *
     * @param {string} pURI URI do request
     * @param {object} pHeaders Dados do cabeçalho
     * @param {object} pParams Dado passado na URL
     * @param {object} pData Data passado como parametro dentro do body
     * @param {(ok, resp) => void} pCallback Função que será chamada após execução do request
     * @returns Promise com resposta
     */
    requestPOST: (pURI, pHeaders, pParams, pData) => {
        return httpRequests.request('POST', pURI, pHeaders, pParams, pData);
    },

    /**
     *Request POST
     *
     * @param {string} pURI URI do request
     * @param {object} pHeaders Dados do cabeçalho
     * @param {object} pParams Dado passado na URL
     * @param {object} pData Data passado como parametro dentro do body
     * @param {(ok, resp) => void} pCallback Função que será chamada após execução do request
     * @returns Promise com resposta
     */
    requestPUT: (pURI, pHeaders, pParams, pData) => {
        return httpRequests.request('PUT', pURI, pHeaders, pParams, pData);
    },

    /**
     *Request DELETE
     *
     * @param {string} pURI URI do request
     * @param {object} pHeaders Dados do cabeçalho
     * @param {object} pParams Dado passado na URL
     * @param {object} pData Data passado como parametro dentro do body
     * @param {(ok, resp) => void} pCallback Função que será chamada após execução do request
     * @returns Promise com resposta
     */
    requestDELETE: (pURI, pHeaders, pParams, pData) => {
        return httpRequests.request('DELETE', pURI, pHeaders, pParams, pData);
    },

    /**
     *Request PATCH
     *
     * @param {string} pURI URI do request
     * @param {object} pHeaders Dados do cabeçalho
     * @param {object} pParams Dado passado na URL
     * @param {object} pData Data passado como parametro dentro do body
     * @param {(ok, resp) => void} pCallback Função que será chamada após execução do request
     * @returns Promise com resposta
     */
    requestPATCH: (pURI, pHeaders, pParams, pData) => {
        return httpRequests.request('PATCH', pURI, pHeaders, pParams, pData);
    },

    /**
     * Retorna ip original do request
     *
     * @param {*} req
     * @returns
     */
    getRemoteAddress: req => {
        return httpRequests.getAddress(
            req.headers['x-forwarded-for'] || req.connection.remoteAddress
        );
    },

    /**
     * Retorna ip local
     *
     * @param {*} req
     * @returns
     */
    getLocalAddress: req => {
        return httpRequests.getAddress(req.socket.address().address);
    },

    /**
     * Retorna ip original do proxy
     *
     * @param {*} req
     * @returns
     */
    getRemoteProxyAddress: req => {
        return httpRequests.getAddress(req.connection.remoteAddress);
    },

    /**
     * Retorna ip original do request
     *
     * @param {*} req
     * @returns
     */
    getAddress: pAddress => {
        let xAddress = pAddress;
        if (xAddress === '::1') {
            xAddress = localhostIp;
        } else {
            let xResult = xAddress.match(regexIpv4);
            if (xResult && xResult[2]) {
                xAddress = xResult[2];
            } else {
                xAddress = localhostIp;
            }
        }
        return xAddress;
    }
};

module.exports = httpRequests;
