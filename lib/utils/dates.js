const moment = require('moment');
const numbers = require('../utils/numbers');
const { isEmpty } = require('./validators');

const dates = {
    ONE_SECOND: 1e3, //1000,
    ONE_MINUTE: 6e4, //60 * 1000,
    ONE_HOUR: 36e5, //60 * 60 * 1000,
    ONE_DAY: 864e5, //24 * 60 * 60 * 1000,
    ONE_WEEK: 6048e5, //24 * 60 * 60 * 1000,
    ONE_MONTH: 30 * 24 * 60 * 60 * 1000,
    ONE_YEAR: 365 * 24 * 60 * 60 * 1000,

    locale: (pLocale = 'UTC') => {
        moment.locale(pLocale);
    },
    localeData: () => {
        return { _holidays: [], _holidayFormat: '', ...moment.localeData() };
    },

    updateLocale: (pKey, pData) => {
        moment.updateLocale(pKey, pData);
    },

    /**
     * Retorna objeto {future,past,s,ss,m,mm,h,hh,d,dd,M,MM,y,yy} com as extensões
     * para dia, mes, ano, hora, minuto, segundo, passado, futuro.
     *
     * @returns {object} {future,past,s,ss,m,mm,h,hh,d,dd,M,MM,y,yy}
     */
    dateNames: () => {
        // @ts-ignore
        return dates.localeData()._relativeTime;
    },
    /**
     * Retorna array com nome dos meses conforme a linguagem definida em locate
     *
     * @returns {array}
     */
    monthNames: () => {
        // @ts-ignore
        return dates.localeData()._months;
    },
    /**
     * Retorna array com nome reduzido dos meses conforme a linguagem definida em locate
     *
     * @returns {array}
     */
    monthShortNames: () => {
        // @ts-ignore
        return dates.localeData()._monthsShort;
    },
    /**
     * Retorna array com nome das semanas conforme a linguagem definida em locate
     *
     * @returns {array}
     */
    weekNames: () => {
        // @ts-ignore
        return dates.localeData()._weekdays;
    },
    /**
     * Retorna array com nome reduzido das semanas conforme a linguagem definida em locate
     *
     * @returns {array}
     */
    weekShortNames: () => {
        // @ts-ignore
        return dates.localeData()._weekdaysShort;
    },
    /**
     * Retorna date UTC a partir de uma string no formato ISO 8601 yyyy-mm-dd hh:mm:ss.
     * - ATENÇÃO: Fora deste formato o resultado pode ser imprevisível.
     * - A informação dos segundos(ss) e, horas(hh) + minutos(mm) são opcionais.
     * @param {string} pDate String no formato yyyy-mm-dd hh:mm:ss. ss, hh:mm são opcionais
     * @returns {Date} Date
     */
    toDate: pDate => {
        return moment(pDate).toDate();
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
     * @param {string} pDate Data no formato date ou string
     * @returns {string} Data no formato SQL
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
     * @param {Date} pDate1
     * @param {Date} pDate2
     * @returns {number}
     */
    daysBetween: (pDate1, pDate2) => {
        return Math.round(
            Math.abs((pDate1.getTime() - pDate2.getTime()) / dates.ONE_DAY)
        );
    },

    /**
     * Quantidade de meses entre duas datas, desconsiderando o dia.
     *
     * @param {Date} pDate1
     * @param {Date} pDate2
     * @returns {number}
     */
    monthsBetween: (pDate1, pDate2) => {
        return dates.absoulteMonths(pDate2) - dates.absoulteMonths(pDate1);
    },

    /**
     * Quantidade absoluta de meses de uma data, desconsiderando o dia.
     *
     * @param {Date} pDate
     * @returns {number}
     */
    absoulteMonths: pDate => {
        return (
            Number(moment(pDate).format('MM')) +
            Number(moment(pDate).format('YYYY')) * 12
        );
    },

    /**
     * Quantidade de anos entre duas datas
     *
     * @param {Date} pDate1
     * @param {Date} pDate2
     * @returns
     */
    yearsBetween: (pDate1, pData2) => {
        return Math.abs(pData2.getTime() - pDate1.getTime()) / dates.ONE_YEAR;
    },

    /**
     * Verifica se data está espirada considerando o tempo de vida
     *
     * @param {Date} pDate Data base
     * @param {number} pLife Tempo de vida em segundos, a partir da data base. ex:3600=1hr, 84.600=1dia
     * @returns {boolean}
     */
    isExpired: (pDate, pLife) => {
        if (isEmpty(pDate) || isEmpty(pLife)) {
            throw Error('isExpired: parametros não informados');
        }
        return (
            Math.round((Date.now() - pDate.getTime()) / dates.ONE_SECOND) >
            pLife
        );
    },

    /**
     * Retorna string no formato UTC ISO 8601
     *
     * @param {Date} pDate
     * @returns {string}
     */
    toUTC: pDate => {
        return pDate.toISOString();
    },

    /**
     * Retorna datacom acréscimo dos milisegundos informados
     *
     * @param {Date} pDate
     * @param {number} pSeconds
     * @returns {Date}
     */
    addSeconds: (pDate, pSeconds) => {
        return new Date(pDate.getTime() + pSeconds * dates.ONE_SECOND);
    },

    /**
     * Retorna data com acréscimo de dias
     *
     * @param {Date} pDate
     * @param {number} pSeconds
     * @returns {Date}
     */
    addDays: (pDate, pDays) => {
        return moment(pDate)
            .add(pDays, 'days')
            .toDate();
    },

    /**
     * Retorna data com acréscimo de meses
     *
     * @param {Date} pDate
     * @param {number} pMonths
     * @returns {Date}
     */
    addMonths: (pDate, pMonths) => {
        return moment(pDate)
            .add(pMonths, 'months')
            .toDate();
    },

    /**
     * Retorna data com acréscimo de meses
     *
     * @param {Date} pDate
     * @param {number} pYears
     * @returns {Date}
     */
    addYears: (pDate, pYears) => {
        return moment(pDate)
            .add(pYears, 'years')
            .toDate();
    },

    /**
     * Retorna data inicio conforma a unidade
     *
     * @param {*} pUnit year, month, week, day
     * @param {Date} [pDate={}]
     * @returns {Date}
     */
    startOf: (pUnit, pDate) => {
        return moment(pDate)
            .startOf(pUnit)
            .toDate();
    },

    /**
     * Retorna a quantidade de finais de semana(Sábados e Domingos) entre duas datas
     *
     * @param {Date} pDate1
     * @param {Date} pData2
     * @returns {number}
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
        const xWI = xDateI.getUTCDay();
        //Artifício para não precisar fazer cálculo
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
