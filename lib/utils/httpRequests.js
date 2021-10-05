//Request via 'axios' é utilizado ao invés do 'fetch'
//pois converte automaticamente para json e
//resolve problema no tratamento de erro no 'fetch'
const axios = require('axios');
//@ts-ignore
const baseRequest = axios.create();

const https = require('https');

const { RequestCanceled } = require('../messages/ClientErrors');
const { NoResponse } = require('../messages/ServerErrors');
const { BasicMessageError } = require('../messages/BasicMessages');

// baseRequest.defaults.headers.common['User-Agent'] = 'investira';
const regexIpv4 = new RegExp(/(::ffff:)?(\d+\.\d+.\d+\.\d+(:\d+)?)/);
const localhostIp = '127.0.0.1';

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
     * @returns {Promise} com resposta
     */
    request: (pMethod, pProps, pFullResponse = false) => {
        return new Promise((pResolve, pReject) => {
            if (!pMethod) {
                return pReject(new BasicMessageError('Request: No method informed'));
            }
            if (!pProps) {
                return pReject(new BasicMessageError('Request: No parameters informed'));
            }
            const xConfig = {
                method: pMethod,
                url: pProps.url,
                headers: pProps.headers,
                params: pProps.params,
                data: pProps.data,
                cancelToken: pProps.cancelToken,
                timeout: pProps.timeout || 24000
            };

            if (pProps.hasOwnProperty('responseType')) {
                xConfig.responseType = pProps.responseType;
            }
            if (pProps.hasOwnProperty('rejectUnauthorized')) {
                xConfig.httpsAgent = new https.Agent({ rejectUnauthorized: pProps.rejectUnauthorized });
            }
            if (pProps.hasOwnProperty('onDownloadProgress')) {
                xConfig.onDownloadProgress = pProps.onDownloadProgress;
            }
            if (pProps.hasOwnProperty('onUploadProgress')) {
                xConfig.onUploadProgress = pProps.onUploadProgress;
            }
            baseRequest(xConfig)
                .then(rRes => {
                    if (rRes.error && rRes.error.code.status >= 500) {
                        throw new BasicMessageError(rRes);
                    } else {
                        if (pFullResponse) {
                            pResolve(rRes);
                        } else {
                            pResolve({ ...rRes.data, status: rRes.status });
                        }
                    }
                })
                .catch(rErr => {
                    // @ts-ignore
                    if (axios.isCancel(rErr)) {
                        pReject(new RequestCanceled());
                    } else if (
                        rErr.response &&
                        rErr.response.data &&
                        rErr.response.data.error &&
                        rErr.response.data.error.code &&
                        rErr.response.data.error.description
                    ) {
                        pReject(new BasicMessageError({ ...rErr.response.data }));
                    } else if (!rErr.response) {
                        pReject(new NoResponse(rErr.message));
                    } else {
                        const xMessage = rErr.response.statusText || rErr.response;
                        const xStatus = rErr.response.status;
                        const xError = new BasicMessageError({
                            error: {
                                description: xMessage,
                                code: { status: xStatus },
                                detail: { ...rErr.response.data }
                            }
                        });
                        pReject(xError);
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
     * @returns {Promise} com resposta
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
     * @returns {Promise} com resposta
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
     * @returns {Promise} com resposta
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
     * @returns {Promise} com resposta
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
     * @returns {Promise} com resposta
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
        return httpRequests.getAddress(req.headers['x-forwarded-for'] || req.connection.remoteAddress);
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
     * @param {string} [pUrl='https://investira.com.br'] Ação a se executa se não houver conexão
     * @return {Promise}
     */
    hasConnection: async (pUrl = 'https://investira.com.br') => {
        const xProps = { url: pUrl, rejectUnauthorized: false };

        let xResult = false;

        await httpRequests
            .request('HEAD', xProps)
            .then(_rResult => {
                xResult = true;
            })
            .catch(_rErr => {
                xResult = false;
            });

        return xResult;
    },

    /**
     * Retorna objeto para ser utilizado no controle do cancel.
     * O resquest deverá receber o parametro {cancelToken: source.token}
     *
     * @returns
     */
    cancelToken: () => {
        // @ts-ignore
        return axios.CancelToken.source();
    }
};

module.exports = httpRequests;
