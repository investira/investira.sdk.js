const moment = require('moment');
const numbers = require('../utils/numbers');
const { formatDateCustom } = require('../utils/formats');
const { isEmpty } = require('./validators');
const { dataHolidays } = require('investira.data');

const dates = {
    ONE_SECOND: 1e3, //1000,
    ONE_MINUTE: 6e4, //60 * 1000,
    ONE_HOUR: 36e5, //60 * 60 * 1000,
    ONE_DAY: 864e5, //24 * 60 * 60 * 1000,
    ONE_WEEK: 6048e5, //24 * 60 * 60 * 1000,

    /**
     * Configura o locale atual
     *
     * @param {string} [pLocale='UTC']
     */
    locale: (pLocale = 'UTC') => {
        moment.locale(pLocale);
    },

    /**
     * Retorna os dados internos
     *
     * @returns
     */
    localeData: () => {
        return { _holidays: [], _notBusinessDays: [], ...moment.localeData() };
    },

    /**
     * Atualiza dados a partir do investira.data.
     * Obs: Esta rotina é chamada automatimante no final deste arquivo
     *
     */
    loadData: () => {
        for (const xKey of Object.keys(dataHolidays)) {
            let xHolidays = [];
            //Le todos os feriados cadastrados
            for (let xDate of dataHolidays[xKey].holidays) {
                //Se for feriado fixo - que se repete todos os anos -  configura o ano
                if (xDate.startsWith('X')) {
                    xDate =
                        new Date().getUTCFullYear() + xDate.substring(4, 12);
                }
                let xHoliday = new Date(xDate + 'T00:00Z');
                //Exclui da lista feriado que cair em dia não considerado útil
                if (
                    dataHolidays[xKey].notBusinessDays.indexOf(
                        xHoliday.getUTCDay()
                    ) == -1
                ) {
                    xHolidays.push(xDate);
                }
            }
            xHolidays.sort();
            //Salva dados
            dates.updateLocale(dataHolidays[xKey].locale.toLowerCase(), {
                notBusinessDays: dataHolidays[xKey].notBusinessDays,
                holidays: xHolidays
            });
        }
    },

    /**
     * Atualiza os dados internos
     *
     * @param {string} pKey
     * @param {object} pData
     */
    updateLocale: (pKey, pData) => {
        moment.updateLocale(pKey, pData);
    },

    /**
     * Verifica se data é um feriado
     *
     * @param {Date} pData
     * @returns {boolean}
     */
    isHoliday: pDate => {
        const xLocale = dates.localeData();
        const xDateMD = formatDateCustom(pDate, 'YYYY-MM-DD');
        return xLocale._holidays && xLocale._holidays.indexOf(xDateMD) >= 0;
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

    /**
     * Retorna a data no formato SQL para ser gravada no banco
     *
     * @param {Date} pDate Data
     * @returns {string} Data no formato SQL
     */
    toSqlDate: pDate => {
        return pDate
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');
    },
    /**
     * Quantidade de segundos entre duas datas.
     *
     * @param {Date} pDate1
     * @param {Date} pDate2
     * @param {boolean} [pAbsolute=false]  Cálculo será efetuado:
     * - true: Considerando somente os segundos, desprezando o valor dos milisegundos. ex:
     * -- A quantidade de segundos entre 01:01:0159 e 01:01:0200 será 1, mesmo o intervalo sendo de apenas 1 décimo.
     * - false: Considerando todo o intervalo
     * @returns {number}
     */
    secondsBetween: (pDate1, pDate2, pAbsolute = false) => {
        return dates.diff('second', pDate1, pDate2, pAbsolute);
    },

    /**
     * Quantidade de minutos entre duas datas.
     *
     * @param {Date} pDate1
     * @param {Date} pDate2
     * @param {boolean} [pAbsolute=false]  Cálculo será efetuado:
     * - true: Considerando somente os minuntos, desprezando o valor dos segundos. ex:
     * -- A quantidade de minutos entre 01:01:59 e 01:02:01 será 1, mesmo o intervalo sendo de apenas 2 segundos.
     * - false: Considerando todo o intervalo
     * @returns {number}
     */
    minutesBetween: (pDate1, pDate2, pAbsolute = false) => {
        return dates.diff('minute', pDate1, pDate2, pAbsolute);
    },
    /**
     * Quantidade de horas entre duas datas.
     *
     * @param {Date} pDate1
     * @param {Date} pDate2
     * @param {boolean} [pAbsolute=false]  Cálculo será efetuado:
     * - true: Considerando somente as horas, desprezando o valor dos minutos. ex:
     * -- A quantidade de horas entre 01:59:00 e 02:01:00 será 1, mesmo o intervalo sendo de apenas 2 minutos.
     * - false: Considerando todo o intervalo
     * @returns {number}
     */
    hoursBetween: (pDate1, pDate2, pAbsolute = false) => {
        return dates.diff('hour', pDate1, pDate2, pAbsolute);
    },
    /**
     * Quantidade de dias entre duas datas.
     *
     * @param {Date} pDate1
     * @param {Date} pDate2
     * @param {boolean} [pAbsolute=false]  Cálculo será efetuado:
     * - true: Considerando somente os dias, desprezando o valor das horas. ex:
     * -- A quantidade de dias entre 2019-12-31 23:59  e 2020-01-01 00:01 será 1, mesmo o intervalo sendo de apenas 2 minutos.
     * - false: Considerando todo o intervalo
     * @returns {number}
     */
    daysBetween: (pDate1, pDate2, pAbsolute = false) => {
        return dates.diff('day', pDate1, pDate2, pAbsolute);
    },

    /**
     * Quantidade de meses entre duas datas.
     *
     * @param {Date} pDate1
     * @param {Date} pDate2
     * @param {boolean} [pAbsolute=false]  Cálculo será efetuado:
     * - true: Considerando somente s meses, desprezando o valor dos dias. ex:
     * -- A quantidade de meses entre 2019-11-30 e 2019-12-01 será 1, mesmo o intervalo sendo de apenas 1 dia.
     * - false: Considerando todo o intervalo
     * @returns {number}
     */
    monthsBetween: (pDate1, pDate2, pAbsolute = false) => {
        return dates.diff('month', pDate1, pDate2, pAbsolute);
    },

    /**
     * Quantidade de anos entre duas datas, desconsiderando o mês.
     *
     * @param {Date} pDate1
     * @param {Date} pDate2
     * @param {boolean} [pAbsolute=false]  Cálculo será efetuado:
     * - true: Considerando somente os anos, desprezando o valor dos meses. ex:
     * -- A quantidade de anos entre 2019-12-31 e 2020-01-01 será 1, mesmo o intervalo sendo de apenas 1 dia.
     * - false: Considerando todo o intervalo
     * @returns
     */
    yearsBetween: (pDate1, pDate2, pAbsolute = false) => {
        return dates.diff('year', pDate1, pDate2, pAbsolute);
    },

    /**
     * Retorna diferença entre duas data conforma a unidade informada.
     *
     * @param {*} pUnit Unidade, year, quarter, month, week, day, hour, second
     * @param {Date} pDate1
     * @param {Date} pDate2
     * @param {boolean} [pAbsolute=false]  Cálculo será efetuado:
     * - true: Considerando somente a unidade, desprezando o valor da unidade menor. ex:
     * -- A quantidade de anos entre 2019-12-31 e 2020-01-01 será 1, mesmo o intervalo sendo de apenas 1 dia.
     * -- A quantidade de dias entre 2019-12-31 23:59 e 2020-01-01 00:01 será 1, mesmo o intervalo sendo de apenas 2 minutos.
     * - false: Considerando todo o intervalo
     * @returns {number}
     */
    diff: (pUnit, pDate1, pDate2, pAbsolute = false) => {
        if (pAbsolute) {
            return moment(pDate2)
                .startOf(pUnit)
                .diff(moment(pDate1).startOf(pUnit), pUnit);
        } else {
            return moment(pDate2).diff(moment(pDate1), pUnit, true);
        }
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
        // return new Date(pDate.getTime() + pSeconds * dates.ONE_SECOND);
        return dates.add('seconds', pDate, pSeconds);
    },

    /**
     * Retorna data com acréscimo de dias
     *
     * @param {Date} pDate
     * @param {number} pDays
     * @returns {Date}
     */
    addDays: (pDate, pDays) => {
        return dates.add('days', pDate, pDays);
    },

    /**
     * Retorna data com acréscimo de meses
     *
     * @param {Date} pDate
     * @param {number} pMonths
     * @returns {Date}
     */
    addMonths: (pDate, pMonths) => {
        return dates.add('months', pDate, pMonths);
    },

    /**
     * Retorna data com acréscimo de meses
     *
     * @param {Date} pDate
     * @param {number} pYears
     * @returns {Date}
     */
    addYears: (pDate, pYears) => {
        return dates.add('years', pDate, pYears);
    },

    /**
     * Retorna data acréscida do prazo conforme a unidade
     *
     * @param {Date} pDate Data
     * @param {number} pQnt Quantidade
     * @returns {Date}
     */
    add: (pUnit, pDate, pQnt) => {
        return moment(pDate)
            .add(pQnt, pUnit)
            .toDate();
    },

    /**
     * Retorna data inicio conforma a unidade
     *
     * @param {*} pUnit year, quarter, month, week, day, hour
     * @param {Date} [pDate={}]
     * @returns {Date}
     */
    startOf: (pUnit, pDate) => {
        return moment(pDate)
            .startOf(pUnit)
            .toDate();
    },

    /**
     * Retorna data fim conforma a unidade
     *
     * @param {*} pUnit year, quarter, month, week, day
     * @param {Date} [pDate={}]
     * @returns {Date}
     */
    endOf: (pUnit, pDate) => {
        return moment(pDate)
            .endOf(pUnit)
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

//Carrega informações dos feriados
dates.loadData();
