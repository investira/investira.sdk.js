//Request via 'axios' é utilizado ao invés do 'fetch'
//pois converte automaticamente para json e
//resolve problema no tratamento de erro no 'fetch'
const axios = require('axios');
//@ts-ignore
const baseRequest = axios.create({ timeout: 24000 });
// baseRequest.defaults.headers.common['User-Agent'] = 'investira';
const regexIpv4 = new RegExp(/(::ffff:)?(\d+\.\d+.\d+\.\d+(:\d+)?)/);
const localhostIp = '127.0.0.1';
const { NoResponse } = require('../messages/ServerErrors');
const { BasicMessage } = require('../messages/BasicMessages');

const httpRequests = {
    /**
     *Request básico
     *
     * @param {string} pMethod
     * @param {object} pProps Objeto contendo atributos
     * {
     * 	url:string (URL do request),
     * 	headers: object (Atributos do header),
     * 	params: object (Atributos dos parametros),
     * 	data: object (Atributos do data passado como parametro no body quando Method for POST ou PUT)
     * }
     * @param {boolean} [pFullResponse=false] indicando se devolverá a resposta completa ou simplificada contendo somente os dados(data), status e statusText
     * @returns Promise com resposta
     */
    request: (pMethod, pProps, pFullResponse = false) => {
        return new Promise((pResolve, pReject) => {
            baseRequest({
                method: pMethod,
                url: pProps.url,
                headers: pProps.headers || null,
                params: pProps.params || null,
                data: pProps.data || null
            })
                .then(rRes => {
                    if (rRes.error && rRes.error.code.status >= 500) {
                        throw new BasicMessage(rRes.error);
                    } else {
                        if (pFullResponse) {
                            pResolve(rRes);
                        } else {
                            pResolve({ ...rRes.data, status: rRes.status });
                        }
                    }
                })
                .catch(rErr => {
                    if (
                        rErr.response &&
                        rErr.response.data.error &&
                        rErr.response.data.error.code.status >= 500
                    ) {
                        pReject(rErr);
                    } else if (!rErr.response) {
                        pReject(new NoResponse(rErr.message));
                    } else {
                        //TODO: Verificar o porque utilizar o pResolve e não o pReject
                        if (pFullResponse) {
                            pResolve(rErr.response);
                        } else {
                            pResolve({
                                ...rErr.response.data,
                                status: rErr.response.status
                            });
                        }
                    }
                });
        });
    },

    /**
     *Request GET
     *
     * @param {object} pProps Objeto contendo atributos
     * {
     * 	url:string (URL do request),
     * 	headers: object (Atributos do header),
     * 	params: object (Atributos dos parametros),
     * }
     * @param {boolean} [pFullResponse=false] indicando se devolverá a resposta completa ou simplificada contendo somente os dados(data), status e statusText
     * @returns Promise com resposta
     */
    requestGET: (pProps, pFullResponse = false) => {
        return httpRequests.request('GET', pProps, pFullResponse);
    },
    /**
     *Request POST
     *
     * @param {string} pMethod
     * @param {object} pProps Objeto contendo atributos
     * {
     * 	url:string (URL do request),
     * 	headers: object (Atributos do header),
     * 	params: object (Atributos dos parametros),
     * 	data: object (Atributos do data passado como parametro no body quando Method for POST ou PUT)
     * }
     * @param {boolean} [pFullResponse=false] indicando se devolverá a resposta completa ou simplificada contendo somente os dados(data), status e statusText
     * @returns Promise com resposta
     */
    requestPOST: (pProps, pFullResponse = false) => {
        return httpRequests.request('POST', pProps, pFullResponse);
    },

    /**
     *Request PUT
     *
     * @param {string} pMethod
     * @param {object} pProps Objeto contendo atributos
     * {
     * 	url:string (URL do request),
     * 	header: object (Atributos do header),
     * 	param: object (Atributos dos parametros),
     * 	data: object (Atributos do data passado como parametro no body quando Method for POST ou PUT)
     * }
     * @param {boolean} [pFullResponse=false] indicando se devolverá a resposta completa ou simplificada contendo somente os dados(data), status e statusText
     * @returns Promise com resposta
     */
    requestPUT: (pProps, pFullResponse = false) => {
        return httpRequests.request('PUT', pProps, pFullResponse);
    },

    /**
     *Request DELETE
     *
     * @param {string} pMethod
     * @param {object} pProps Objeto contendo atributos
     * {
     * 	url:string (URL do request),
     * 	headers: object (Atributos do header),
     * 	params: object (Atributos dos parametros),
     * 	data: object (Atributos do data passado como parametro no body quando Method for POST ou PUT)
     * }
     * @param {boolean} [pFullResponse=false] indicando se devolverá a resposta completa ou simplificada contendo somente os dados(data), status e statusText
     * @returns Promise com resposta
     */
    requestDELETE: (pProps, pFullResponse = false) => {
        return httpRequests.request('DELETE', pProps, pFullResponse);
    },

    /**
     *Request PACTH
     *
     * @param {string} pMethod
     * @param {object} pProps Objeto contendo atributos
     * {
     * 	url:string (URL do request),
     * 	headers: object (Atributos do header),
     * 	params: object (Atributos dos parametros),
     * 	data: object (Atributos do data passado como parametro no body quando Method for POST ou PUT)
     * }
     * @param {boolean} [pFullResponse=false] indicando se devolverá a resposta completa ou simplificada contendo somente os dados(data), status e statusText
     * @returns Promise com resposta
     */
    requestPATCH: (pProps, pFullResponse = false) => {
        return httpRequests.request('PATCH', pProps, pFullResponse);
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
    },

    /**
     * Verifica se há conexão com a internet.
     *
     * @constructor
     * @param {Function} pUrl Ação a se executa se não houver conexão
     * @return {Promise}
     */
    hasConection: async pUrl => {
        const xProps = {
            url: pUrl || 'https://investira.com.br'
        };

        let xResult = false;

        await httpRequests
            .requestGET(xProps)
            .then(rResult => {
                xResult = true;
            })
            .catch(() => {
                xResult = false;
            });

        return xResult;
    }
};

module.exports = httpRequests;
