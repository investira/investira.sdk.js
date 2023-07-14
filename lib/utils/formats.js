const { round, trunc, toNumber } = require('./numbers');
const { startOf, addDays, addMonths, addYears, toDate, daysBetween, monthsBetween, yearsBetween } = require('./dates');
const { isEmpty, isNumber, isString } = require('./validators');
const moment = require('moment/min/moment-with-locales');
// var l10nEN = new Intl.DateTimeFormat("en-US")
// var l10nDE = new Intl.DateTimeFormat("de-DE")

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

    locale: (pLocale = 'UTC') => {
        moment.locale(pLocale);
    },

    /**
     * Retorna número formatado
     *
     * @param {number} pValue Valor a ser formatado
     * @param {number} [pDecimals=2] Quantidades de cadas decimais
     * @param {boolean} [pSeparateThousand=false] Se separa o milhar
     * @param {boolean} [pShowCurrency=false] Se exibe o símbolo da moeda do país definido em formats.CURRENCY.
     * @returns Número formatado
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
        return pValue.toLocaleString(formats.LOCALE, xOptions);
    },

    /**
     * Formata inteiro com zeros a esquerda
     *
     * @param {number} pNumber
     * @param {number} [pSize=4]
     * @returns
     */
    formatLeadingZeros: (pNumber, pSize = 2) => {
        if (isEmpty(pNumber) || isEmpty(pSize) || !isNumber(pSize) || pSize < 2) {
            return '';
        }
        return ('0'.repeat(pSize) + pNumber).slice(-pSize);
    },

    /**
     * Retorna o número simplificado com 'mil', 'mi', 'bi', 'tri', 'quatri', 'quint', 'sext'
     *
     * @param {number} pValue Elemento a ser verificado
     * @param {number} [pDecimalPlaces=0] Quantidade de casas decimais
     * @param {boolean} [pShowCurrency=false] Se exibe o símbolo da moeda do país definido em formats.CURRENCY.
     * @return {string} Número formatado
     */
    friendlyNumber: (pValue, pDecimalPlaces = 0, pShowCurrency = false) => {
        return pvSimplify(formats.DIM_NUMBER, pValue, pDecimalPlaces, pShowCurrency);
    },

    /**
     * Retorna o número simplificado com 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'
     *
     * @param {number} pValue Elemento a ser verificado
     * @param {number} [pDecimalPlaces=0] Quantidade de casas decimais
     * @return {string} Número formatado
     */
    friendlyByte: (pValue, pDecimalPlaces = 0) => {
        return pvSimplify(formats.DIM_BYTE, pValue, pDecimalPlaces);
    },

    /**
     * Formata data no layout 'DD/MMM/YY'
     *
     * @param {Date} pDate
     * @returns {string}
     */
    formatDate: pDate => {
        return formats.formatDateCustom(pDate, 'DD/MMM/YY');
    },

    /**
     * Formatação simples de número de telefone
     *
     * @param {string | number} pNumber
     * @param {string | number}  [pDDD=""]
     * @param {string | number} [pDDI=""]
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
     * Formata data conforme layoyt de pFormat
     *
     * @param {Date} pDate Data
     * @param {string} pFormat Formato ex:DD/MM/YYYY
     * @returns {string}
     */
    formatDateCustom: (pDate, pFormat) => {
        return moment(pDate).format(pFormat);
    },

    /**
     * Retorna o tempo relativo.
     * Formato ex: 2 anos
     * keys: s: segundos, m: minuto, mm: minutos, h: hora, hh: horas, d: dia, dd:dias
     * M: mês, MM: meses, y: ano, yy: anos
     * @param {number} pValue
     * @param {string} pKey
     * @return {string}
     */
    getRelativeTime: (pValue, pKey = 'd') => {
        if (isEmpty(pValue) || !isNumber(pValue) || pValue < 1) {
            return '';
        }

        let xTime = '';
        const localeData = moment.localeData();
        xTime = localeData.relativeTime(pValue, false, pKey);

        return xTime;
    },

    /**
     * Retorna object {year, month} contendo o prazo por extenso.
     *
     * @param {number} pYear
     * @param {number} pMonth
     * @return {object}
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
     * Retorna string no formado x ano(s) e y (mês)es ou x mes(es) e y (dia)s ou ano(s) ou mes(es) ou dia(s).
     *
     * @param {number} pValue Quantidade de dias
     * @param {string} pType Tipo de entrada. d: dias, m: meses, y: anos
     * @returns
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
     * Retorna string no formado x ano(s) e/ou y (mês)es e/ou z dia(s).
     *
     * @param {string | Date} pDateI Data inicial
     * @param {string | Date} pDateF Data final
     * @returns
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
     * Retorna string no formato: há 4 anos atrás.
     *
     * @param {Date} pDate Data inicial
     * @param {boolean} pSuffix Sem sufixo
     * @returns
     */
    fromNow: (pDate, pSuffix = false) => {
        return moment(pDate).fromNow(pSuffix);
    },
    /**
     * Retorna string no formato: em 4 anos.
     *
     * @param {Date} pDate Data inicial
     * @param {boolean} pPrefix Sem sufixo
     * @returns
     */
    toNow: (pDate, pPrefix = false) => {
        return moment(pDate).toNow(pPrefix);
    },
    /** Retorna objeto con os valores data separados em:
     * year, month, day, hour, minute, second
     *
     * @param {Number} pValue // Um número em milesegundos
     * @returns {String} // 2 horas | poucos segundos segundos | 1 minuto
     */
    duration: pValue => {
        return moment.duration(pValue).humanize();
    }
};

module.exports = formats;

/**
 * Retorna o número simplificado
 *
 * @param {*} pDIM Dimensão
 * @param {*} pValue Valor a ser simplificado
 * @param {number} [pDecimals=2] Quantidade máxima de casas decimais
 * @param {boolean} [pShowCurrency=false] Se exibe o símbolo da moeda do país definido em formats.CURRENCY.
 * @returns {String} Valor formatado de forma simplificada
 */
const pvSimplify = (pDIM, pValue, pDecimals = 2, pShowCurrency = false) => {
    const xOptions = {
        minimumFractionDigits: 0,
        maximumFractionDigits: pDecimals,
        style: pShowCurrency ? 'currency' : 'decimal',
        currencyDisplay: 'symbol',
        currency: formats.CURRENCY
    };
    //Limite máximo do array
    const xMaxLenght = pDIM.VALUES.length * pDIM.BASE;
    //Converte para número e arredonda
    let xValueRounded = toNumber(pValue);
    //Salva o sinal
    const xSign = Math.sign(xValueRounded) || 1;
    //Retira o sinal
    xValueRounded = Math.abs(xValueRounded);

    //Tamanho de números inteiros
    let xIntLength = trunc(xValueRounded, 0).toString().length - 1;
    if (xIntLength == 0 && xValueRounded != 0) {
        return round(xValueRounded, pDecimals).toLocaleString(formats.LOCALE, xOptions);
    } else if (xIntLength > xMaxLenght) {
        //Limita simplify a quantidade máxima de dimensões
        xIntLength = xMaxLenght;
    }
    //Calcula quantidade de dígitos que serão reduzidos
    const xReducer = xIntLength - (xIntLength % pDIM.BASE);
    //Calcula parte inteira
    let xValueInt = xValueRounded / Math.pow(10, xReducer);
    //Adiciona o sufixo
    let xSuf = ' ' + pDIM.VALUES[trunc(xReducer / pDIM.BASE, 0)];
    //Restaura o sinal
    xValueInt *= xSign;
    //Configura formatação

    return xValueInt.toLocaleString(formats.LOCALE, xOptions) + xSuf.trimEnd();
};
