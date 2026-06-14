//@ts-ignore
const { round, trunc, toNumber } = require('./numbers');
//@ts-ignore
const { startOf, addDays, addMonths, addYears, toDate, daysBetween, monthsBetween, yearsBetween } = require('./dates');
//@ts-ignore
const { isEmpty, isNumber, isString } = require('./validators');
//@ts-ignore
const moment = require('moment/min/moment-with-locales');
// var l10nEN = new Intl.DateTimeFormat("en-US")
// var l10nDE = new Intl.DateTimeFormat("de-DE")

/**
 * Utilitários para formatação textual de números, datas, durações e endereços.
 */
const formats = {
    LOCALE: 'pt-BR',
    CURRENCY: 'BRL',
    DIM_NUMBER: {
        BASE: 3,
        VALUES: ['', 'mil', 'mi', 'bi', 'tri', 'quatri', 'quint', 'sext']
    },
    DIM_BYTE: {
        BASE: 3,
        VALUES: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    },

    /**
     * Define o locale usado pelas formatações baseadas em `moment`.
     *
     * @param {string} [pLocale='UTC'] Locale a ser configurado.
     * @returns {void}
     */
    locale: (pLocale = 'UTC') => {
        moment.locale(pLocale);
    },

    /**
     * Retorna número formatado conforme locale e quantidade de casas decimais.
     *
     * @param {number} pValue Valor a ser formatado.
     * @param {number} [pDecimals=2] Quantidade de casas decimais.
     * @param {boolean} [pSeparateThousand=false] Indica se deve separar milhar.
     * @param {boolean} [pShowCurrency=false] Se exibe o símbolo da moeda do país definido em formats.CURRENCY.
     * @returns {string} Número formatado.
     * @example
     * formats.formatNumber(1234.5, 2, true); // "1.234,50"
     * @example
     * formats.formatNumber(1234.5, 2, true, true); // "R$ 1.234,50"
     */
    formatNumber: (pValue, pDecimals = 2, pSeparateThousand = false, pShowCurrency = false) => {
        pValue = toNumber(pValue);
        pValue = round(pValue, pDecimals);
        const xOptions = {
            minimumFractionDigits: pDecimals,
            useGrouping: pSeparateThousand,
            style: pShowCurrency ? 'currency' : 'decimal',
            currencyDisplay: 'symbol',
            currency: formats.CURRENCY
        };
        //@ts-ignore
        return pValue.toLocaleString(formats.LOCALE, xOptions);
    },

    /**
     * Formata inteiro com zeros à esquerda.
     *
     * @param {number} pNumber Número que será preenchido.
     * @param {number} [pSize=2] Tamanho total desejado.
     * @returns {string}
     * @example
     * formats.formatLeadingZeros(7); // "07"
     * @example
     * formats.formatLeadingZeros(15, 4); // "0015"
     */
    formatLeadingZeros: (pNumber, pSize = 2) => {
        if (isEmpty(pNumber) || isEmpty(pSize) || !isNumber(pSize) || pSize < 1) {
            return '';
        }
        return String(pNumber).padStart(pSize, '0');
    },

    /**
     * Retorna o número simplificado com sufixos como `mil`, `mi` e `bi`.
     *
     * @param {number} pValue Valor a ser simplificado.
     * @param {number} [pDecimalPlaces=0] Quantidade de casas decimais.
     * @param {boolean} [pShowCurrency=false] Se exibe o símbolo da moeda do país definido em formats.CURRENCY.
     * @param {string} [pBase=null] Base fixa desejada.
     * @return {string} Número formatado.
     * @example
     * formats.friendlyNumber(15320); // "15 mil"
     * @example
     * formats.friendlyNumber(1532000, 1); // "1,5 mi"
     */
    friendlyNumber: (pValue, pDecimalPlaces = 0, pShowCurrency = false, pBase = null) => {
        return pvSimplify(formats.DIM_NUMBER, pValue, pDecimalPlaces, pShowCurrency, pBase);
    },

    /**
     * Retorna o tamanho simplificado com sufixos como `KB`, `MB` e `GB`.
     *
     * @param {number} pValue Valor a ser simplificado.
     * @param {number} [pDecimalPlaces=0] Quantidade de casas decimais.
     * @return {string} Número formatado.
     * @example
     * formats.friendlyByte(2048); // "2 KB"
     * @example
     * formats.friendlyByte(1048576, 1); // "1 MB"
     */
    friendlyByte: (pValue, pDecimalPlaces = 0) => {
        return pvSimplify(formats.DIM_BYTE, pValue, pDecimalPlaces);
    },

    /**
     * Formata data no layout `DD/MMM/YY`.
     *
     * @param {Date} pDate Data a ser formatada.
     * @returns {string}
     * @example
     * formats.formatDate(new Date('2024-01-05T00:00:00Z')); // "05/jan/24"
     */
    formatDate: pDate => {
        return formats.formatDateCustom(pDate, 'DD/MMM/YY');
    },

    /**
     * Faz formatação simples de telefone com número, DDD e DDI opcionais.
     *
     * @param {string | number} pNumber Número do telefone sem máscara.
     * @param {string | number} [pDDD=""] DDD opcional.
     * @param {string | number} [pDDI=""] DDI opcional.
     * @returns {string}
     * @example
     * formats.formatPhone('99998888'); // "9999-8888"
     * @example
     * formats.formatPhone('99998888', '11'); // "(011) 9999-8888"
     */
    formatPhone: (pNumber, pDDD = '', pDDI = '') => {
        let xPhone = '';
        const xNumberStr = String(pNumber);
        if (!isEmpty(pNumber) && xNumberStr.length > 4) {
            xPhone =
                xNumberStr.substring(0, xNumberStr.length - 4) +
                '-' +
                xNumberStr.substring(xNumberStr.length - 4, xNumberStr.length);
            if (!isEmpty(pDDD)) {
                if (!isEmpty(pDDI)) {
                    xPhone = '+' + Number(pDDI) + ' (' + Number(pDDD) + ') ' + xPhone;
                } else {
                    xPhone = '(' + formats.formatLeadingZeros(Number(pDDD), 3) + ') ' + xPhone;
                }
            }
        }
        return xPhone;
    },

    /**
     * Formata data conforme o layout informado.
     *
     * @param {Date} pDate Data.
     * @param {string} pFormat Formato desejado, por exemplo `DD/MM/YYYY`.
     * @returns {string}
     * @example
     * formats.formatDateCustom(new Date('2024-01-05T00:00:00Z'), 'YYYY-MM-DD'); // "2024-01-05"
     */
    formatDateCustom: (pDate, pFormat) => {
        return moment(pDate).format(pFormat);
    },

    /**
     * Retorna o texto relativo de uma unidade de tempo.
     *
     * Exemplo de saída: `2 anos`, `1 mês`, `3 dias`.
     *
     * keys: s: segundos, m: minuto, mm: minutos, h: hora, hh: horas, d: dia, dd:dias
     * M: mês, MM: meses, y: ano, yy: anos
     * @param {number} pValue Quantidade da unidade.
     * @param {string} pKey Chave da unidade relativa.
     * @return {string}
     */
    getRelativeTime: (pValue, pKey = 'd') => {
        if (isEmpty(pValue) || !isNumber(pValue) || pValue < 1) {
            return '';
        }

        let xTime = '';
        const localeData = moment.localeData();
        //@ts-ignore
        xTime = localeData.relativeTime(pValue, false, pKey);

        return xTime;
    },

    /**
     * Retorna objeto com o prazo por extenso em anos, meses e dias.
     *
     * @param {number} pYear Quantidade de anos.
     * @param {number} pMonth Quantidade de meses.
     * @param {number} [pDay=0] Quantidade de dias.
     * @return {object}
     * @example
     * formats.slugPeriod(1, 2, 3); // { year: "1 ano", month: "2 meses", day: "3 dias" }
     */
    slugPeriod: (pYear = 0, pMonth = 0, pDay = 0) => {
        return {
            year: pYear > 1 ? formats.getRelativeTime(pYear, 'yy') : pYear === 1 ? formats.getRelativeTime(1, 'y') : '',
            month:
                pMonth > 1
                    ? formats.getRelativeTime(pMonth, 'MM')
                    : pMonth === 1
                      ? formats.getRelativeTime(pMonth, 'M')
                      : '',
            day: pDay > 1 ? formats.getRelativeTime(pDay, 'dd') : pDay === 1 ? formats.getRelativeTime(1, 'd') : ''
        };
    },

    /**
     * Retorna período amigável a partir de um valor em dias, meses ou anos.
     *
     * @param {number} pValue Quantidade a ser convertida.
     * @param {string} pType Tipo de entrada: `d`, `m` ou `y`.
     * @returns {string}
     */
    friendlyDate: (pValue, pType = 'd') => {
        if (isEmpty(pValue) || !isNumber(pValue) || pValue < 1) {
            return '';
        }
        const xDataI = new Date();
        let xDataF = new Date();

        if (pType === 'd') {
            xDataF = addDays(xDataI, pValue);
        }

        if (pType === 'm') {
            xDataF = addMonths(xDataI, pValue);
        }

        if (pType === 'y') {
            xDataF = addYears(xDataI, pValue);
        }

        return formats.friendlyBetweenDates(xDataI, xDataF);
    },

    /**
     * Retorna período amigável entre duas datas.
     *
     * @param {string | Date} pDateI Data inicial.
     * @param {string | Date} pDateF Data final.
     * @returns {string}
     * @example
     * formats.friendlyBetweenDates('2024-01-01', '2024-03-15'); // "2 meses e 14 dias"
     */
    friendlyBetweenDates: (pDateI, pDateF) => {
        let xPeriod = '';
        if (isEmpty(pDateI) || isEmpty(pDateF)) {
            return xPeriod;
        }

        let xDateI = pDateI;
        let xDateF = pDateF;

        if (isString(pDateI)) {
            // @ts-ignore
            xDateI = toDate(xDateI);
        }
        if (isString(pDateF)) {
            // @ts-ignore
            xDateF = toDate(xDateF);
        }
        // @ts-ignore
        xDateI = startOf('day', xDateI);
        // @ts-ignore
        xDateF = startOf('day', xDateF);

        if (daysBetween(xDateI, xDateF) == 0) {
            return '';
        }

        const xYears = Math.floor(yearsBetween(xDateI, xDateF));
        xDateF = addYears(xDateF, -xYears);
        const xMonths = Math.floor(monthsBetween(xDateI, xDateF));
        xDateF = addMonths(xDateF, -xMonths);
        const xDays = daysBetween(xDateI, xDateF, true);
        const xSlugs = formats.slugPeriod(xYears, xMonths, xDays);

        if (xYears > 0 && xMonths > 0) {
            xPeriod = `${xSlugs.year} e ${xSlugs.month}`;
        } else if (xYears > 0 && xDays > 0) {
            xPeriod = `${xSlugs.year} e ${xSlugs.day}`;
        } else if (xYears > 0) {
            xPeriod = `${xSlugs.year}`;
        } else if (xMonths > 0 && xDays > 0) {
            xPeriod = `${xSlugs.month} e ${xSlugs.day}`;
        } else if (xMonths > 0) {
            xPeriod = xSlugs.month;
        } else if (xDays > 0) {
            xPeriod = xSlugs.day;
        }

        return xPeriod;
    },
    /**
     * Retorna texto relativo da data em relação ao momento atual.
     *
     * @param {Date} pDate Data de referência.
     * @param {boolean} pSuffix Quando `true`, omite sufixos como `atrás`.
     * @returns {string}
     */
    fromNow: (pDate, pSuffix = false) => {
        return moment(pDate).fromNow(pSuffix);
    },
    /**
     * Retorna texto relativo do momento atual até a data informada.
     *
     * @param {Date} pDate Data de referência.
     * @param {boolean} pPrefix Quando `true`, omite prefixos como `em`.
     * @returns {string}
     */
    toNow: (pDate, pPrefix = false) => {
        return moment(pDate).toNow(pPrefix);
    },
    /** Retorna duração por extenso com base em milissegundos.
     *
     * @param {Number} pValue Duração em milissegundos.
     * @returns {String} Exemplo: `2 horas`, `1 minuto`, `poucos segundos`.
     */
    duration: pValue => {
        return moment.duration(pValue).humanize();
    },
    /**
     * Retorna o site "limpo", mantendo o caminho (path) se existir.
     *
     * Exemplo: `"http:/MinhaEmpresa.com/path"` resulta em `"minhaempresa.com/path"`.
     * E-mails de provedores públicos retornam `null`.
     *
     * @param {string} pEntrada URL, e-mail ou domínio.
     * @returns {string|null}
     */
    site: pEntrada => {
        const xPublicos = new Set([
            'gmail.com',
            'outlook.com',
            'hotmail.com',
            'live.com',
            'icloud.com',
            'me.com',
            'zaz.com.br',
            'bol.com.br',
            'terra.com.br',
            'ig.com.br',
            'yahoo.com',
            'msn.com',
            'yahoo.com.br',
            'globo.com',
            'uol.com.br'
        ]);

        const pvNorm = pStr => (pStr ?? '').toString().normalize('NFKC').trim().toLowerCase();

        const pvTiraProtocoloGrosseiro = pStr =>
            pvNorm(pStr)
                .replace(/^mailto:/, '')
                .replace(/^https?:\/+/, '') // http://, https://, http:/, https:/
                .replace(/^https?:?/, ''); // http:, https:

        const pvSoDominioDeEmail = pStr => {
            const xIdx = pStr.lastIndexOf('@');
            return xIdx >= 0 ? pStr.slice(xIdx + 1) : pStr;
        };

        const pvExtraiHostPath = pStr => {
            let xStr = pvTiraProtocoloGrosseiro(pStr);
            xStr = pvSoDominioDeEmail(xStr);

            // Tenta URL API para separar host e path; senão, fallback manual
            try {
                const xUrl = new URL(/^https?:\/\//i.test(xStr) ? xStr : `http://${xStr}`);
                const xHost = xUrl.hostname || '';
                const xPath = xUrl.pathname === '/' ? '' : xUrl.pathname;
                return `${xHost}${xPath}`;
            } catch {
                const xPartes = xStr.split('/');
                const xHost = xPartes.shift() || '';
                const xPath = xPartes.length > 0 ? '/' + xPartes.join('/') : '';
                return `${xHost}${xPath}`;
            }
        };

        // Não remove 'www' do retorno; apenas limpa porta e barra final redundante
        const pvLimpa = pHostPath => {
            let xStr = pvNorm(pHostPath);

            // remove porta se estiver antes do path (ex.: exemplo.com:8080/app)
            const xSlash = xStr.indexOf('/');
            const xColon = xStr.indexOf(':');
            if (xColon > -1 && (xSlash === -1 || xColon < xSlash)) {
                const xHostSemPorta = xStr.slice(0, xColon);
                const xResto = xSlash === -1 ? '' : xStr.slice(xSlash);
                xStr = xHostSemPorta + xResto;
            }

            // remove barra final redundante (mantém path)
            if (xStr.endsWith('/') && xStr !== '/') xStr = xStr.slice(0, -1);

            return xStr;
        };

        const pvBaseHost = pHost => {
            let xHost = pHost;
            while (xHost.startsWith('www.')) xHost = xHost.slice(4); // só para comparação, não para retorno
            return xHost;
        };

        const pvDominioValido = pHostPath => {
            const xHost = pHostPath.split('/')[0];
            return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(xHost);
        };

        if (!pEntrada) return null;

        const xEntrada = pvNorm(pEntrada);
        if (!xEntrada) return null;

        const xHostPathBruto = pvExtraiHostPath(xEntrada);
        const xHostPath = pvLimpa(xHostPathBruto);

        if (!pvDominioValido(xHostPath)) return null;

        // Bloqueia provedores públicos (comparando sem 'www'), mas mantém 'www' no retorno
        const xHostParaCheck = pvBaseHost(xHostPath.split('/')[0]);
        if (xPublicos.has(xHostParaCheck)) return null;

        return xHostPath;
    },
    /**
     * Converte valores de tamanho de arquivo para bytes.
     *
     * Aceita valores numéricos (já em bytes) ou strings formatadas com unidades
     * como '100mb', '2gb', '500kb', '1024'. Caso não seja possível parsear,
     * retorna o valor padrão de 100MB.
     *
     * Unidades suportadas (case insensitive):
     * - b: bytes
     * - kb: kilobytes (1024 bytes)
     * - mb: megabytes (1024 * 1024 bytes)
     * - gb: gigabytes (1024 * 1024 * 1024 bytes)
     *
     * @param {number|string} pValue Valor a ser convertido.
     * @returns {number} Valor em bytes.
     *
     * @example
     * formats.toBytes(1024); // 1024
     * @example
     * formats.toBytes('100mb'); // 104857600
     * @example
     * formats.toBytes('invalid'); // 104857600
     */
    toBytes: pValue => {
        if (typeof pValue === 'number' && Number.isFinite(pValue)) {
            return pValue;
        }

        const xValue = String(pValue || '')
            .trim()
            .toLowerCase();
        const xMatch = xValue.match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
        if (!xMatch) {
            return 100 * 1024 * 1024;
        }

        const xAmount = Number(xMatch[1]);
        const xUnit = xMatch[2] || 'b';
        const xMultiplier = {
            b: 1,
            kb: 1024,
            mb: 1024 * 1024,
            gb: 1024 * 1024 * 1024
        };

        return Math.floor(xAmount * xMultiplier[xUnit]);
    }
};

module.exports = formats;

/**
 * Retorna o valor simplificado conforme a dimensão informada.
 *
 * @param {*} pDIM Dimensão usada na simplificação.
 * @param {*} pValue Valor a ser simplificado.
 * @param {number} [pDecimals=2] Quantidade máxima de casas decimais.
 * @param {boolean} [pShowCurrency=false] Se exibe o símbolo da moeda do país definido em formats.CURRENCY.
 * @param {string} [pBase=null] Base fixa opcional.
 * @returns {String} Valor formatado de forma simplificada.
 */
const pvSimplify = (pDIM, pValue, pDecimals = 2, pShowCurrency = false, pBase = null) => {
    const xOptions = {
        minimumFractionDigits: 0,
        maximumFractionDigits: pDecimals,
        style: pShowCurrency ? 'currency' : 'decimal',
        currencyDisplay: 'symbol',
        currency: formats.CURRENCY
    };
    // Limite máximo suportado pelo catálogo de sufixos.
    const xMaxLenght = pDIM.VALUES.length * pDIM.BASE;
    // Converte para número e preserva o sinal separadamente.
    let xValueRounded = toNumber(pValue);
    const xSign = Math.sign(xValueRounded) || 1;
    xValueRounded = Math.abs(xValueRounded);

    // Mede a ordem de grandeza usando apenas a parte inteira.
    let xIntLength = trunc(xValueRounded, 0).toString().length - 1;
    if (xIntLength == 0 && xValueRounded != 0) {
        return round(xValueRounded, pDecimals).toLocaleString(formats.LOCALE, xOptions);
    } else if (xIntLength > xMaxLenght) {
        // Limita a simplificação à maior dimensão disponível.
        xIntLength = xMaxLenght;
    }
    // Define quantas casas serão reduzidas para chegar à dimensão desejada.
    let xReducer = 0;
    if (pBase != null) {
        const xIndex = formats.DIM_NUMBER.VALUES.indexOf(String(pBase).toLocaleLowerCase());
        if (xIndex > -1) {
            xReducer = 3 * xIndex;
        }
    } else {
        xReducer = xIntLength - (xIntLength % pDIM.BASE);
    }
    // Aplica a redução da escala numérica.
    let xValueInt = xValueRounded / Math.pow(10, xReducer);
    // Seleciona o sufixo textual correspondente à dimensão.
    let xSuf = ' ' + pDIM.VALUES[trunc(xReducer / pDIM.BASE, 0)];
    // Restaura o sinal original depois da simplificação.
    xValueInt *= xSign;
    // Formata o valor final usando o locale configurado.
    //@ts-ignore
    return xValueInt.toLocaleString(formats.LOCALE, xOptions) + xSuf.trimEnd();
};
