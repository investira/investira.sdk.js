const moment = require('moment');
const numbers = require('../utils/numbers');
const { isEmpty, isDate } = require('./validators');

const dates = {
    ONE_SECOND: 1e3, //1000,
    ONE_MINUTE: 6e4, //60 * 1000,
    ONE_HOUR: 36e5, //60 * 60 * 1000,
    ONE_DAY: 864e5, //24 * 60 * 60 * 1000,
    ONE_WEEK: 6048e5, //24 * 60 * 60 * 1000,
    ONE_MONTH: 30 * 24 * 60 * 60 * 1000,
    ONE_YEAR: 365 * 24 * 60 * 60 * 1000,

    localeData: () => {
        return { _holidays: [], _holidayFormat: '', ...moment.localeData() };
    },

    updateLocale: (pKey, pData) => {
        moment.updateLocale(pKey, pData);
    },

    isHoliday: pData => {
        const xLocale = dates.localeData();
        // if (xLocale._holidays) {
        //     if (
        //         xLocale._holidays.indexOf(
        //             this.format(xLocale._holidayFormat)
        //         ) >= 0
        //     )
        //         return true;
        // }

        // if (xLocale.holiday) {
        //   if (xLocale.holiday(this)) {
        // 	return true;
        //   }
        //   return false;
        // }

        return false;
    },
    /**
     * Converte um data ou string de uma data, em uma data no formato SQL para ser gravada no banco
     *
     * @param {*} pDate Data no formato date ou string
     * @returns Data no formato SQL
     */
    toSqlDate: pDate => {
        return new Date(Date.parse(pDate))
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');
    },

    /**
     * Quantidade de dias entre duas datas
     *
     * @param {*} pDate1
     * @param {*} pDate2
     * @returns
     */
    daysBetween: (pDate1, pDate2) => {
        return Math.round(
            Math.abs((pDate1.getTime() - pDate2.getTime()) / dates.ONE_DAY)
        );
    },

    /**
     * Quantidade de meses entre duas datas, desconsiderando o dia.
     *
     * @param {*} pDate1
     * @param {*} pDate2
     * @returns
     */
    monthsBetween: (pDate1, pDate2) => {
        return dates.absoulteMonths(pDate2) - dates.absoulteMonths(pDate1);
    },

    /**
     * Quantidade absoluta de meses de uma data, desconsiderando o dia.
     *
     * @param {*} pDate
     * @returns
     */
    absoulteMonths: pDate => {
        return Number(pDate.format('MM')) + Number(pDate.format('YYYY')) * 12;
    },

    /**
     * Quantidade de anos entre duas datas
     *
     * @param {*} pDate1
     * @param {*} pDate2
     * @returns
     */
    yearsBetween: (pDate1, pData2) => {
        return Math.abs(pData2.getTime() - pDate1.getTime()) / dates.ONE_YEAR;
    },

    /**
     * Verifica se data está espirada considerando o tempo de vida
     *
     * @param {*} pDate Data base
     * @param {*} pLife Tempo de vida em segundos, a partir da data base. ex:3600=1hr, 84.600=1dia
     * @returns
     */
    isExpired: (pDate, pLife) => {
        if (isEmpty(pDate) || isEmpty(pLife)) {
            throw Error('isExpired: parametros não informados');
        }
        let xDate;
        if (isDate(pDate)) {
            xDate = pDate;
        } else {
            xDate = Date.parse(pDate);
        }
        return Math.round((Date.now() - xDate) / dates.ONE_SECOND) > pLife;
    },

    /**
     *
     *
     * @param {Date} pDate
     * @returns
     */
    toUTC: pDate => {
        return moment(pDate).format();
    },

    /**
     * Retorna datacom acréscimo dos milisegundos informados
     *
     * @param {*} pDate
     * @param {*} pSeconds
     * @returns
     */
    addSeconds: (pDate, pSeconds) => {
        return new Date(pDate.getTime() + pSeconds * dates.ONE_SECOND);
    },

    /**
     * Retorna data com acréscimo de dias
     *
     * @param {*} pDate
     * @param {*} pSeconds
     * @returns
     */
    addDays: (pDate, pDays) => {
        return moment(pDate).add(pDays, 'days');
        // return new Date(pDate.getTime() + pDays * dates.ONE_DAY);
    },

    /**
     * Retorna data com acréscimo de meses
     *
     * @param {*} pDate
     * @param {*} pMonths
     * @returns
     */
    addMonths: (pDate, pMonths) => {
        return moment(pDate).add(pMonths, 'months');
    },

    /**
     * Retorna data com acréscimo de meses
     *
     * @param {*} pDate
     * @param {*} pYears
     * @returns
     */
    addYears: (pDate, pYears) => {
        return moment(pDate).add(pYears, 'years');
    },

    startOf: (pType, pDate = {}) => {
        return moment(pDate).startOf(pType);
    },

    /**
     * Retorna a quantidade de finais de semana(Sábados e Domingos) entre duas datas
     *
     * @param {*} pDate1
     * @param {*} pData2
     */
    getWeekends: (pDate1, pDate2) => {
        //Quantidade sábados e domingos entre a datas
        let xDateI = pDate1;
        let xDateF = pDate2;
        if (pDate1 > pDate2) {
            xDateI = pDate2;
            xDateF = pDate1;
        }
        let xWeekends = dates.daysBetween(xDateI, xDateF);
        const xSemanas = numbers.apart(numbers.div(xWeekends, 7));
        //Quantidade de semanas existentes entre as duas datas
        xWeekends = Number(xSemanas.int) * 2;
        const xWI = xDateI.getDay();
        const xDias = Math.trunc(Number('0.' + xSemanas.dec) * 7);
        const xWF = xWI + xDias;
        let xCalc = xWF - 5;
        if (xCalc > 0) {
            xWeekends += Math.min(2, xCalc);
        }
        if (xWI == 6) {
            xWeekends--;
        }
        return xWeekends;
    }
};
module.exports = dates;
