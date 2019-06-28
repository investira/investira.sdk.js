const { round, trunc, toNumber } = require('./numbers');
const {
    startOf,
    addDays,
    addMonths,
    addYears,
    toDate,
    daysBetween,
    monthsBetween,
    yearsBetween,
    daysInMonth
} = require('./dates');
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
    formatNumber: (
        pValue,
        pDecimals = 2,
        pSeparateThousand = false,
        pShowCurrency = false
    ) => {
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
     * @param {number} pId
     * @param {number} [pSize=4]
     * @returns
     */
    formatId: (pId, pSize = 2) => {
        if (isEmpty(pId) || isEmpty(pSize) || !isNumber(pSize) || pSize < 2) {
            return '';
        }
        return ('0'.repeat(pSize) + pId).slice(-pSize);
    },

    /**
     * Retorna o número simplificado com 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'
     *
     * @param {number} pValue Elemento a ser verificado
     * @param {number} [pDecimalPlaces=0] Quantidade de casas decimais
     * @param {boolean} [pShowCurrency=false] Se exibe o símbolo da moeda do país definido em formats.CURRENCY.
     * @return {string} Número formatado
     */
    friendlyNumber: (pValue, pDecimalPlaces = 0, pShowCurrency = false) => {
        return pvSimplify(
            formats.DIM_NUMBER,
            pValue,
            pDecimalPlaces,
            pShowCurrency
        );
    },

    /**
     * Retorna o número simplificado com 'mil', 'mi', 'bi', 'tri', 'quatri', 'quint', 'sext'
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
     * Retorna object {year, month} contendo o prazo por extenso.
     *
     * @param {number} pYear
     * @param {number} pMonth
     * @return {object}
     */
    slugPeriod: (pYear = 0, pMonth = 0, pDay = 0) => {
        return {
            year: pYear > 1 ? `${pYear} anos` : pYear === 1 ? `1 ano` : '',
            month: pMonth > 1 ? `${pMonth} meses` : pMonth === 1 ? `1 mês` : '',
            day: pDay > 1 ? `${pDay} dias` : pDay === 1 ? `1 dia` : ''
        };
    },

    /**
     * Retorna string no formado x ano(s) e y (mês)es ou x mes(es) e y (dia)s ou ano(s) ou mes(es) ou dia(s).
     *
     * @param {number} pValue Quantidade de dias
     * @returns
     */
    friendlyDate: pValue => {
        if (isEmpty(pValue) || !isNumber(pValue) || pValue < 1) {
            return '';
        }
        const xData1 = new Date();
        const xData2 = addDays(xData1, pValue);
        return formats.friendlyBetweenDates(xData1, xData2);
    },

    /**
     * Retorna string no formado x ano(s) e/ou y (mês)es e/ou z dia(s).
     *
     * @param {string | Date} pDate1 Data inicial
     * @param {string | Date} pDate2 Data final
     * @returns
     */
    friendlyBetweenDates: (pDate1, pDate2) => {
        let xPeriod = '';
        if (isEmpty(pDate1) || isEmpty(pDate2)) {
            return xPeriod;
        }

        let xDate1 = pDate1;
        let xDate2 = pDate2;

        if (isString(pDate1)) {
            xDate1 = toDate(xDate1);
        }
        if (isString(pDate2)) {
            xDate2 = toDate(xDate2);
        }
        xDate1 = startOf('day', xDate1);
        xDate2 = startOf('day', xDate2);

        if (daysBetween(xDate1, xDate2) == 0) {
            return '';
        }

        const xYears = Math.floor(yearsBetween(xDate1, xDate2));
        xDate2 = addYears(xDate2, -xYears);
        const xMonths = Math.floor(monthsBetween(xDate1, xDate2));
        xDate2 = addMonths(xDate2, -xMonths);
        const xDays = daysBetween(xDate1, xDate2, true);
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
 * @returns Valor formatado de forma simplificada
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
        return round(xValueRounded, pDecimals).toLocaleString(
            formats.LOCALE,
            xOptions
        );
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

    return (
        xValueInt.toLocaleString(formats.LOCALE, xOptions) + xSuf.trimRight()
    );
};
