const { round, trunc, toNumber } = require('./numbers');
const { isEmpty, isNumber } = require('./validators');
const moment = require('moment');

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
     *
     *
     * @param {Date} pDate
     * @returns
     */
    formatDate: pDate => {
        return moment(pDate).format('DD/MMM/YY');
    },

    /**
     *
     *
     * @param {Date} pDate
     * @returns
     */
    formatDateCustom: (pDate, pFormat) => {
        return moment(pDate).format(pFormat);
    },

    /**
     *
     *
     * @param {number} pYear
     * @param {number} pMonth
     */
    slugPeriod: (pYear, pMonth) => {
        return {
            year: pYear > 1 ? `${pYear} anos` : `${pYear} ano`,
            month: pMonth > 1 ? `${pMonth} meses` : `${pMonth} mês`
        };
    },

    /**
     * Retorna string no formado x ano(s) e y (mês)es.
     *
     * @param {number} pMonths Quantidade de meses
     * @returns
     */
    friendlyDate: pMonths => {
        if (isEmpty(pMonths) || !isNumber(pMonths) || pMonths < 1) {
            return '';
        }
        const xYears = Math.floor(pMonths / 12);
        const xMonths = pMonths % 12;
        const slugs = formats.slugPeriod(xYears, xMonths);

        let xPeriod = '';

        if (xYears === 0) {
            xPeriod = slugs.month;
        } else if (xYears > 0 && xMonths > 0) {
            xPeriod = `${slugs.year} e ${slugs.month}`;
        } else {
            xPeriod = slugs.year;
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
        return round(xValueRounded, pDecimals);
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
    const xOptions = {
        minimumFractionDigits: 0,
        maximumFractionDigits: pDecimals,
        style: pShowCurrency ? 'currency' : 'decimal',
        currencyDisplay: 'symbol',
        currency: formats.CURRENCY
    };
    return (
        xValueInt.toLocaleString(formats.LOCALE, xOptions) + xSuf.trimRight()
    );
};
