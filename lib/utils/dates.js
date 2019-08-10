const { dataHolidays } = require('investira.data');
const moment = require('moment/min/moment-with-locales');
const numbers = require('../utils/numbers');
const { isEmpty, isNull } = require('./validators');
const { seekDate } = require('./arrays');

const HOLIDAY_FORMAT = 'YYYY-MM-DD';

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
            for (let xHolidayString of dataHolidays[xKey].holidays) {
                //Se for feriado fixo - que se repete todos os anos -  configura o ano
                if (xHolidayString.startsWith('X')) {
                    const xMMDD = xHolidayString.substring(4, 12);
                    for (let x = 1970; x <= 2080; x++) {
                        xHolidayString = x + xMMDD;
                        pvLoadDataPush(xHolidays, xKey, xHolidayString);
                    }
                } else {
                    pvLoadDataPush(xHolidays, xKey, xHolidayString);
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
     * Retorna date UTC a partir de uma string no formato ISO 8601 yyyy-mm-dd hh:mm:ss.
     * - ATENÇÃO: Fora deste formato o resultado pode ser imprevisível.
     * - A informação dos segundos(ss) e, horas(hh) + minutos(mm) são opcionais.
     * @param {string} pDate String no formato informado em pFormat ou, quando não informado, no formato yyyy-mm-dd hh:mm:ss. ss, hh:mm são opcionais
     * @param {string} pFormat Formato que se encontra a data informada
     * @returns {Date} Date
     */
    toDate: (pDate, pFormat = null) => {
        if (!isNull(pFormat)) {
            if (isEmpty(pDate)) {
                return null;
            } else {
                return moment(pDate, pFormat).toDate();
            }
        } else {
            return moment(pDate).toDate();
        }
    },

    /**
     * Verifica se data é um feriado.
     * Fériados e finais de semana são informações distintas.
     * Isso posto:
     * Se feriado cair em um dia normalmente não útil(fim de semana), retornará false.
     * Para saber se é um dia útil considerando fim de semana, utilize isWorkingDay.
     * @param {Date} pData
     * @returns {boolean}
     */
    isHoliday: pDate => {
        const xLocale = dates.localeData();
        const xDateYMD = pvToHolidayFormat(pDate);
        return xLocale._holidays && xLocale._holidays.indexOf(xDateYMD) >= 0;
    },

    /**
     * Retorna quantidade de dias que são feriados.
     * Feriados que caem em dia não util não são considerados.
     *
     * @param {Date} pDateStart
     * @param {Date} pDateEnd
     * @returns {number}
     */
    holidays: (pDateStart, pDateEnd) => {
        const xLocale = dates.localeData()._holidays;
        //Procura feriado posterior mais próximo data inicial, desconsiderando a própria data
        const xI1 = seekDate(xLocale, pvToHolidayFormat(dates.addDays(pDateStart, 1)), true);
        //Procura feriado anterior mais próximo a data final
        const xI2 = seekDate(xLocale, pvToHolidayFormat(pDateEnd), false);
        //A quantidade de feriados será a diferença de itens entre as duas datas.
        if (xI1 <= xI2) {
            return xI2 - xI1 + 1;
        } else {
            return 0;
        }
    },

    /**
     * Retorna se uma data é iqual a outra.
     *
     * @param {Date} pDateA
     * @param {Date} pDateB
     * @returns
     */
    compare: (pDateA, pDateB) => {
        return +pDateA == +pDateB;
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
     * Retorna a data no formato SQL contendo somente a data para ser gravada no banco
     *
     * @param {Date} pDate Data
     * @returns {string} Data no formato SQL
     */
    toSqlDate: pDate => {
        try {
            return pDate.toISOString().slice(0, 10);
        } catch (rErr) {
            console.log(pDate, rErr);
            return null;
        }
    },
    /**
     * Retorna a data no formato SQL contendo data e hora para ser gravada no banco
     *
     * @param {Date} pDate Data
     * @returns {string} Data no formato SQL
     */
    toSqlDatetime: pDate => {
        try {
            return pDate
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');
        } catch (rErr) {
            console.log(pDate, rErr);
            return null;
        }
    },
    /**
     * Quantidade de segundos entre duas datas.
     *
     * @param {Date} pDateStart
     * @param {Date} pDateEnd
     * @param {boolean} [pAbsolute=false]  Cálculo será efetuado:
     * - true: Considerando somente os segundos, desprezando o valor dos milisegundos. ex:
     * -- A quantidade de segundos entre 01:01:0159 e 01:01:0200 será 1, mesmo o intervalo sendo de apenas 1 décimo.
     * - false: Considerando todo o intervalo
     * @returns {number}
     */
    secondsBetween: (pDateStart, pDateEnd, pAbsolute = false) => {
        return dates.diff('second', pDateStart, pDateEnd, pAbsolute);
    },

    /**
     * Quantidade de minutos entre duas datas.
     *
     * @param {Date} pDateStart
     * @param {Date} pDateEnd
     * @param {boolean} [pAbsolute=false]  Cálculo será efetuado:
     * - true: Considerando somente os minuntos, desprezando o valor dos segundos. ex:
     * -- A quantidade de minutos entre 01:01:59 e 01:02:01 será 1, mesmo o intervalo sendo de apenas 2 segundos.
     * - false: Considerando todo o intervalo
     * @returns {number}
     */
    minutesBetween: (pDateStart, pDateEnd, pAbsolute = false) => {
        return dates.diff('minute', pDateStart, pDateEnd, pAbsolute);
    },
    /**
     * Quantidade de horas entre duas datas.
     *
     * @param {Date} pDateStart
     * @param {Date} pDateEnd
     * @param {boolean} [pAbsolute=false]  Cálculo será efetuado:
     * - true: Considerando somente as horas, desprezando o valor dos minutos. ex:
     * -- A quantidade de horas entre 01:59:00 e 02:01:00 será 1, mesmo o intervalo sendo de apenas 2 minutos.
     * - false: Considerando todo o intervalo
     * @returns {number}
     */
    hoursBetween: (pDateStart, pDateEnd, pAbsolute = false) => {
        return dates.diff('hour', pDateStart, pDateEnd, pAbsolute);
    },

    /**
     * Quantidade de dias entre duas datas.
     *
     * @param {Date} pDateStart
     * @param {Date} pDateEnd
     * @param {boolean} [pAbsolute=false]  Cálculo será efetuado:
     * - true: Considerando somente os dias, desprezando o valor das horas. ex:
     * -- A quantidade de dias entre 2019-12-31 23:59  e 2020-01-01 00:01 será 1, mesmo o intervalo sendo de apenas 2 minutos.
     * - false: Considerando todo o intervalo
     * @returns {number}
     */
    daysBetween: (pDateStart, pDateEnd, pAbsolute = false) => {
        return dates.diff('day', pDateStart, pDateEnd, pAbsolute);
    },

    /**
     * Quantidade de meses entre duas datas.
     *
     * @param {Date} pDateStart
     * @param {Date} pDateEnd
     * @param {boolean} [pAbsolute=false]  Cálculo será efetuado:
     * - true: Considerando somente s meses, desprezando o valor dos dias. ex:
     * -- A quantidade de meses entre 2019-11-30 e 2019-12-01 será 1, mesmo o intervalo sendo de apenas 1 dia.
     * - false: Considerando todo o intervalo
     * @returns {number}
     */
    monthsBetween: (pDateStart, pDateEnd, pAbsolute = false) => {
        return dates.diff('month', pDateStart, pDateEnd, pAbsolute);
    },

    /**
     * Quantidade de anos entre duas datas, desconsiderando o mês.
     *
     * @param {Date} pDateStart
     * @param {Date} pDateEnd
     * @param {boolean} [pAbsolute=false]  Cálculo será efetuado:
     * - true: Considerando somente os anos, desprezando o valor dos meses. ex:
     * -- A quantidade de anos entre 2019-12-31 e 2020-01-01 será 1, mesmo o intervalo sendo de apenas 1 dia.
     * - false: Considerando todo o intervalo
     * @returns {number}
     */
    yearsBetween: (pDateStart, pDateEnd, pAbsolute = false) => {
        return dates.diff('year', pDateStart, pDateEnd, pAbsolute);
    },

    /**
     * Quantidade de dias úteis entre duas datas.
     *
     * @param {Date} pDateStart
     * @param {Date} pDateEnd
     * @returns {number}
     */
    workingDaysBetween: (pDateStart, pDateEnd) => {
        let xDateStart = pDateStart;
        let xDateEnd = pDateEnd;
        let xD = 0;
        if (pDateStart > pDateEnd) {
            xDateEnd = pDateStart;
            xDateStart = pDateEnd;
            if (dates.isWorkingDay(xDateStart)) {
                xD += 1;
            }
            if (dates.isWorkingDay(xDateEnd)) {
                xD -= 1;
            }
        }
        xD += dates.diff('day', xDateStart, xDateEnd, true);
        const xW = dates.weekends(xDateStart, xDateEnd);
        const xH = dates.holidays(xDateStart, xDateEnd);
        return xD - xW - xH;
    },
    /**
     * Retorna quantidade de dias do mês informado
     *
     * @param {Date} pDate
     * @returns {number}
     */
    workingDaysInMonth: pDate => {
        let xDate1 = moment(pDate)
            .utcOffset(0)
            .startOf('month')
            .add(-1, 'days')
            .toDate();
        let xDate2 = moment(pDate)
            .utcOffset(0)
            .endOf('month')
            .toDate();
        return dates.workingDaysBetween(xDate1, xDate2);
    },
    /**
     * Retorna quantidade de dias do mês informado
     *
     * @param {Date} pDate
     * @returns {number}
     */
    workingDaysInYear: pDate => {
        let xDate1 = moment(pDate)
            .utcOffset(0)
            .startOf('year')
            .add(-1, 'days')
            .toDate();
        let xDate2 = moment(pDate)
            .utcOffset(0)
            .endOf('year')
            .toDate();
        return dates.workingDaysBetween(xDate1, xDate2);
    },
    /**
     * Retorna diferença entre duas data conforma a unidade informada.
     *
     * @param {string} pUnit Unidade, year, quarter, month, week, day, hour, second
     * @param {Date} pDateStart
     * @param {Date} pDateEnd
     * @param {boolean} [pAbsolute=false]  Cálculo será efetuado:
     * - true: Considerando somente a unidade, desprezando o valor da unidade menor. ex:
     * -- A quantidade de anos entre 2019-12-31 e 2020-01-01 será 1, mesmo o intervalo sendo de apenas 1 dia.
     * -- A quantidade de dias entre 2019-12-31 23:59 e 2020-01-01 00:01 será 1, mesmo o intervalo sendo de apenas 2 minutos.
     * - false: Considerando todo o intervalo
     * @returns {number}
     */
    diff: (pUnit, pDateStart, pDateEnd, pAbsolute = false) => {
        if (pAbsolute) {
            return moment(pDateEnd)
                .utcOffset(0)
                .startOf(pUnit)
                .diff(
                    moment(pDateStart)
                        .utcOffset(0)
                        .startOf(pUnit),
                    pUnit
                );
        } else {
            return moment(pDateEnd).diff(moment(pDateStart), pUnit, true);
        }
    },

    /**
     * Retorna quantidade de dias do mês data informado
     *
     * @param {Date} pDate
     * @returns {number}
     */
    daysInMonth: pDate => {
        return moment(pDate).daysInMonth();
    },

    /**
     * Retorna quantidade de dias do ano data informado
     *
     * @param {Date} pDate
     * @returns {number}
     */

    daysInYear: pDate => {
        return moment(pDate).daysInYear();
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
        return Math.round((Date.now() - pDate.getTime()) / dates.ONE_SECOND) > pLife;
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
     * Retorna data com acréscimo de dias úteis.
     * Se quantidade de dias não for informada ou for zero,
     * retorna a mesma data enviada se ela for dia útil, ou a
     * a próxida data útil.
     * @param {Date} pDate
     * @param {number} pDays
     * @returns {Date}
     */
    addWorkingDays: (pDate, pDays) => {
        if ((isNull(pDays) || pDays === 0) && !dates.isWorkingDay(pDate)) {
            pDays = 1;
        }
        let xDate = dates.add('days', pDate, pDays);
        let xDays = dates.workingDaysBetween(pDate, xDate);

        if (xDays === Math.abs(pDays)) {
            return xDate;
        } else {
            const xDif = pDays - xDays;
            return dates.addWorkingDays(xDate, xDif);
        }
    },
    /**
     * Verifica se data é um dia útil.
     *
     * @param {Date} pDate
     * @returns {boolean}
     */
    isWorkingDay: pDate => {
        if (isNull(pDate)) {
            return null;
        }
        return !dates.localeData()._notBusinessDays.includes(pDate.getUTCDay()) && !dates.isHoliday(pDate);
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
     * Retorna data de aniversário do próximo mês
     *
     * @param {Date} pDate
     * @returns
     */
    nextMonthAniversary: pDate => {
        //Próximo período
        let xDataFim = dates.addMonths(pDate, 1);
        //Ajusta datafim: Se dia inicial for maior que dia final,
        //indica que próximo tem um total de dias menor que o atual.
        //Adiciona 1 dia para considerar integralmente próximo mês.
        if (pDate.getUTCDate() > xDataFim.getUTCDate()) {
            xDataFim = dates.addDays(xDataFim, 1);
        }
        return xDataFim;
    },

    /**
     * Retorna data inicio conforma a unidade
     *
     * @param {string} pUnit year, quarter, month, week, day, hour
     * @param {Date} [pDate={}]
     * @returns {Date}
     */
    startOf: (pUnit, pDate) => {
        return moment(pDate)
            .utcOffset(0)
            .startOf(pUnit)
            .toDate();
    },

    /**
     * Retorna data fim conforma a unidade
     *
     * @param {string} pUnit year, quarter, month, week, day
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
     * @param {Date} pDateStart
     * @param {Date} pData2
     * @returns {number}
     */
    weekends: (pDateStart, pDateEnd) => {
        //Quantidade sábados e domingos entre a datas
        let xDateI = pDateStart;
        let xDateF = pDateEnd;
        if (pDateStart > pDateEnd) {
            xDateI = pDateEnd;
            xDateF = pDateStart;
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
        if (xWI === 6) {
            xWeekends--;
        }
        return xWeekends;
    },
    /**
     * Agenda execução da função para a data e hora informada
     *
     * @param {Date} pDate Data e hora para inicio da execução
     * @param {function} pFunction Função a ser executada
     * @returns {number} setTimeout id
     */
    schedule: (pDate, pFunction) => {
        // @ts-ignore
        let xMilsec = pDate - new Date();
        if (xMilsec < 0) {
            return null;
        }
        // @ts-ignore
        return setTimeout(() => {
            pFunction();
        }, xMilsec);
    }
};

module.exports = dates;

/**
 * Formata data conforme layoyt de pFormat
 *
 * @param {Date} pDate Data
 * @returns {string}
 */
const pvToHolidayFormat = pDate => {
    return moment(pDate).format(HOLIDAY_FORMAT);
};

/**
 *
 *
 * @param {array} pHolidays
 * @param {string} pKey
 * @param {string} pHolidayString
 */
const pvLoadDataPush = (pHolidays, pKey, pHolidayString) => {
    let xHolidayDate = new Date(pHolidayString + 'T00:00Z');
    //Exclui da lista feriado que cair em dia não considerado útil
    if (dataHolidays[pKey].notBusinessDays.indexOf(xHolidayDate.getUTCDay()) == -1) {
        pHolidays.push(pHolidayString);
    }
};
//Carrega informações dos feriados
dates.loadData();
