const { dataHolidays } = require('investira.data');
// @ts-ignore
const moment = require('moment/min/moment-with-locales');
const numbers = require('../utils/numbers');
const { isEmpty, isNull, isNumber, isDate, isFunction } = require('./validators');
const { seekDate } = require('./arrays');

const HOLIDAY_FORMAT = 'YYYY-MM-DD';
const SCHEDULE_FORMAT = 'YYYYMMDDHH:mm';
const BASE_DATE = moment('0000-01-01', HOLIDAY_FORMAT);

moment.suppressDeprecationWarnings = true;

const dates = {
    ONE_SECOND: 1e3, //1000,
    ONE_MINUTE: 6e4, //60 * 1000,
    ONE_HOUR: 36e5, //60 * 60 * 1000,
    ONE_DAY: 864e5, //24 * 60 * 60 * 1000,
    ONE_WEEK: 6048e5, //24 * 60 * 60 * 1000 * 7,
    SCHEDULE_TYPE: ['D', 'W', 'M', 'Y'],
    WEEKENDS_DAYS: [0, 6],

    /**
     * Configura o locale atual
     *
     * @param {string} [pLocale='UTC']
     */
    locale: (pLocale = 'UTC') => {
        const xLocale = moment.locale();
        if (xLocale !== pLocale) {
            return moment.locale(pLocale);
        }
        return xLocale;
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
                if (xHolidayString.hasOwnProperty('date')) {
                    const xMMDD = xHolidayString.date.substring(4, 12);
                    for (let x = 1970; x <= 2090; x++) {
                        //Verifica se esta dentro do período de validade
                        if (
                            (!xHolidayString.since || x >= xHolidayString.since) &&
                            (!xHolidayString.until || x <= xHolidayString.until)
                        ) {
                            pvLoadDataPush(xHolidays, xKey, x + xMMDD);
                        }
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
     * Retorna as configurações da data local
     *
     * @returns {object}
     */
    intlOptions: () => {
        return Intl.DateTimeFormat().resolvedOptions();
    },

    /**
     * Retorna date UTC a partir de uma string no formato ISO 8601 YYYY-MM-DD HH:mm:ss.
     * - ATENÇÃO: Fora deste formato o resultado pode ser imprevisível.
     * - A informação dos segundos(ss) e, horas(hh) + minutos(mm) são opcionais.
     * @param {string | Date} [pDate=null] String no formato informado em pFormat ou, quando não informado, no formato YYYY-MM-DD HH:mm:ss. ss, HH:mm são opcionais
     * @param {string | Date} [pFormat=null] Formato que se encontra a data informada
     * @returns {Date} Date
     */
    toDate: (pDate = null, pFormat = null) => {
        //TODO: Implemantar possibilidade configuração do timeZone. ex new Date().toLocaleString("pt-BR", {timeZone: "America/Sao_Paulo"});
        // let xDate = null;
        // if (pDate) {
        //     if (pFormat) {
        //         xDate = moment(pDate, pFormat);
        //     } else {
        //         xDate = moment(pDate);
        //     }
        //     if (xDate && xDate.isValid()) {
        //         xDate = xDate.toDate();
        //     }
        //     return xDate;
        // }
        // return null;
        let xDate = null;
        if (!isNull(pFormat)) {
            if (!isEmpty(pDate)) {
                xDate = moment(pDate, pFormat);
            }
        } else {
            xDate = pDate ? moment(pDate) : moment();
        }
        if (xDate && xDate.isValid()) {
            return xDate.toDate();
        } else {
            return null;
        }
    },

    /**
     * Retorna timestemp a partir de uma string 'hh:mm:ss'
     *
     * @param {String} pTime
     * @returns {number}
     */
    toTime: pTime => {
        if (!pTime) {
            pTime = '00:00:00';
        }
        return dates.toDate(`1970-01-01T${pTime}Z`).getTime();
    },
    /**
     * Verifica se data é um feriado.
     * Fériados e finais de semana são informações distintas.
     * Isso posto:
     * Se feriado cair em um dia normalmente não útil(fim de semana), retornará false.
     * Para saber se é um dia útil considerando fim de semana, utilize isWorkingDay.
     * @param {Date} pDate
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
     * @param {Date} pDateStart Data inicial
     * @param {Date} pDateEnd Data final
     * @returns {number}
     */
    holidays: (pDateStart, pDateEnd) => {
        const xLocale = dates.localeData()._holidays;
        let xDateStart = dates.toDate(pDateStart);
        let xDateEnd = dates.toDate(pDateEnd);
        let xSign = 1;
        if (pDateEnd < pDateStart) {
            [xDateStart, xDateEnd] = [xDateEnd, xDateStart];
            xSign = -1;
        }

        //Procura feriado posterior mais próximo data inicial, desconsiderando a própria data
        const xI1 = seekDate(xLocale, pvToHolidayFormat(xDateStart), true);
        //Procura feriado anterior mais próximo a data final
        const xI2 = seekDate(xLocale, pvToHolidayFormat(xDateEnd), false);
        //A quantidade de feriados será a diferença de itens entre as duas datas.
        if (xI1 <= xI2) {
            return (xI2 - xI1 + 1) * xSign;
        } else {
            return 0;
        }
    },

    /**
     * Retorna se uma data e hora são iqual a outra.
     *
     * @param {Date} pDateTimeA
     * @param {Date} pDateTimeB
     * @returns {boolean}
     */
    areDateTimesEqual: (pDateTimeA, pDateTimeB) => {
        return +pDateTimeA === +pDateTimeB;
    },

    /**
     * Retorna se uma data é iqual a outra.
     * As horas, se informadas, serão desprezadas.
     *
     * @param {Date} pDateA
     * @param {Date} pDateB
     * @returns {boolean}
     */
    areDatesEqual: (pDateA, pDateB) => {
        return +dates.startOf('day', pDateA) === +dates.startOf('day', pDateB);
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
     * Retorna o offset em minutos do horário de verão local (Daylight Saving Time)
     *
     * @returns {number}
     */
    dstOffset: () => {
        const xYear = new Date().getFullYear();
        const xJan = new Date(xYear, 0, 1);
        const xJul = new Date(xYear, 6, 1);
        return xJul.getTimezoneOffset() - xJan.getTimezoneOffset();
    },

    /**
     * Retorna a data (local do Sistema) no formato SQL contendo somente a data para ser gravada no banco
     *
     * @param {Date} pDate Data
     * @returns {string} Data no formato SQL
     */
    toSqlDate: pDate => {
        try {
            return moment(pDate).format().slice(0, 10);
        } catch (rErr) {
            console.log(pDate, rErr);
            return null;
        }
    },

    /**
     * Retorna a hora no formato SQL contendo hora:minuto:segundo para ser gravada no banco
     *
     * @param {Date | number} pDate Data ou número em milisegundos
     * @returns {string} Data no formato SQL
     */
    toSqlTime: pDate => {
        try {
            if (isNumber(pDate)) {
                // @ts-ignore
                const xSeconds = Math.floor((pDate / ONE_SECOND) % 60);
                // @ts-ignore
                const xMinutes = Math.floor((pDate / ONE_MINUTE) % 60);
                // @ts-ignore
                const xHours = Math.floor((pDate / ONE_HOUR) % 24);
                return `${xHours}:${xMinutes}:${xSeconds}`;
            } else if (isDate(pDate)) {
                // @ts-ignore
                return pDate.toISOString().substring(11, 19);
            }
            return null;
        } catch (rErr) {
            console.log(pDate, rErr);
            return null;
        }
    },

    /**
     * Retorna a data no formato SQL contendo data e hora (local do Sistema) para ser gravada no banco
     *
     * @param {Date} pDate Data
     * @returns {string} Data no formato SQL
     */
    toSqlDatetime: pDate => {
        try {
            return moment(pDate).format().slice(0, 19).replace('T', ' ');
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
     * Se a data inicial for superior a data fi:nal, as datas serão invertidas
     * Exclui a data incial da contagem
     *
     * @param {Date} pDateStart
     * @param {Date} pDateEnd
     * @returns {number}
     */
    workingDaysBetween: (pDateStart, pDateEnd, pCountDateStart = false) => {
        //Força datas para o mesmo horário
        let xDateStart = dates.toDate(pDateStart);
        let xDateEnd = dates.toDate(pDateEnd);
        if (xDateStart.getTime() === xDateEnd.getTime()) {
            return 0;
        }
        let xSign = 1;
        if (pDateEnd < pDateStart) {
            xSign = -1;
        }

        //Calculo de dias entre duas datas
        let xDays = pvDaysDif(xDateStart, xDateEnd);
        if (!pCountDateStart) {
            if (xDateEnd > xDateStart) {
                //Desconsidera data inicial
                xDateStart.setDate(xDateStart.getDate() + 1);
            } else {
                //Desconsidera data inicial
                xDateStart.setDate(xDateStart.getDate() - 1);
            }
            if (xDateStart.getTime() === xDateEnd.getTime()) {
                xDays = dates.isWorkingDay(xDateEnd) ? 1 : 0;
                return xDays * xSign;
            }
        }
        //Quantidade de feriados entre as datas
        const xH = dates.holidays(xDateStart, xDateEnd);
        //Quantidade de finais de semana entre as datas
        const xW = dates.weekends(xDateStart, xDateEnd);
        //Subtrai quantidade de feriados e finais de semana
        xDays = xDays - xW - xH;
        return xDays;
    },
    /**
     * Retorna quantidade de dias do mês informado
     *
     * @param {Date} pDate
     * @returns {number}
     */
    workingDaysInMonth: pDate => {
        let xDate1 = dates.addDays(dates.startOf('month', dates.toUTCDate(pDate)), -1);
        let xDate2 = dates.endOf('month', dates.toUTCDate(pDate));
        return dates.workingDaysBetween(xDate1, xDate2);
    },
    /**
     * Retorna quantidade de dias do mês informado
     *
     * @param {Date} pDate
     * @returns {number}
     */
    workingDaysInYear: pDate => {
        let xDate1 = moment(pDate).utcOffset(0).startOf('year').add(-1, 'days').toDate();
        let xDate2 = moment(pDate).utcOffset(0).endOf('year').toDate();
        return dates.workingDaysBetween(xDate1, xDate2, true);
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
                .diff(moment(pDateStart).utcOffset(0).startOf(pUnit), pUnit);
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
            throw Error('isExpired: parameters not informed');
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
     * Retorna string no formato UTC ISO 8601
     *
     * @param {Date | Number} pDateOrYear
     * @param {Number} pMonth
     * @param {Number} pDay
     * @returns {Date}
     */
    toUTCDate: (pDateOrYear, pMonth = null, pDay = null) => {
        if (isNumber(pDateOrYear)) {
            // @ts-ignore
            return new Date(Date.UTC(pDateOrYear, pMonth, pDay, 0, 0, 0, 0));
        } else {
            return new Date(
                // @ts-ignore
                Date.UTC(pDateOrYear.getFullYear(), pDateOrYear.getMonth(), pDateOrYear.getDate(), 0, 0, 0, 0)
            );
        }
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
        //Força para procurar o próximo dia útil se dia atual for feriado
        if ((isNull(pDays) || pDays === 0) && !dates.isWorkingDay(pDate)) {
            pDays = 1;
        }

        //Adiciona a quantidade de dias para se aproximar a data alvo
        let xDate = dates.add('days', pDate, pDays);
        //Conta a quantidade de dias úteis entre a data inicial e a data alvo
        let xDays = dates.workingDaysBetween(pDate, xDate);
        //Se resultado for a quantidade de dias informada, retorna a data alvo
        if (xDays === pDays) {
            return xDate;
        } else {
            //Chada recursiva até encontrar a data alvo que contenha a quantidade de dias úteis informada
            const xDif = pDays - xDays;
            return dates.addWorkingDays(xDate, xDif);
        }
    },
    /**
     * Retorna a quantidade dias que são finais de semana(Sábados e Domingos) entre duas datas
     * A data início e a data fim são incluídas na contagem
     *
     * @param {Date} pDateStart
     * @param {Date} pDateEnd
     * @returns {number}
     */
    weekends: (pDateStart, pDateEnd) => {
        //Força datas para o mesmo horário
        let xDateStart = dates.toDate(pDateStart);
        let xDateEnd = dates.toDate(pDateEnd);
        let xSign = 1;
        if (pDateEnd < pDateStart) {
            [xDateStart, xDateEnd] = [xDateEnd, xDateStart];
            xSign = -1;
        }
        let xWeekends = 0;
        // Calcula TOTAL de dias entre as datas, incluido o próprio dia.
        // Ex: 01/01/2019 a 01/01/2019 = 1 dia
        let xDays = pvDaysDif(xDateStart, xDateEnd) + 1;
        // Ajusta contador se data inicial for sábado ou domingo
        const xStartWeekDay = xDateStart.getDay();
        const xEndWeekDay = xDateEnd.getDay();

        //Se data inicial for sábado ou data for domingo
        if (dates.WEEKENDS_DAYS.includes(xStartWeekDay) || dates.WEEKENDS_DAYS.includes(xEndWeekDay)) {
            if (xStartWeekDay === 6) {
                xDays -= 2;
                xWeekends += 2;
            }
            if (xEndWeekDay === 0) {
                xDays -= 2;
                xWeekends += 2;
            }
            if (xStartWeekDay === 0) {
                xDays -= 1;
                xWeekends += 1;
            }
            if (xEndWeekDay === 6) {
                xDays -= 1;
                xWeekends += 1;
            }
        } else if (xStartWeekDay > xEndWeekDay) {
            xDays -= 2;
            xWeekends += 2;
        }
        // Calcula número de finais de semana. Sábado e domingo
        xWeekends += Math.floor(xDays / 7) * 2;
        return xWeekends * xSign;
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
        return !dates.localeData()._notBusinessDays.includes(pDate.getDay()) && !dates.isHoliday(pDate);
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
        return moment(pDate).add(pQnt, pUnit).toDate();
    },

    /**
     * Retorna data de aniversário na data alvo
     * Caso o dia de aniversário seja maior que os dia do mês da data alvo, ajusta para o último dia do mês
     *
     * @param {Number} pAnniversaryDay
     * @param {Date} pTargetDate
     * @param {boolean} [pGreater=null] Proximidade do valor alvo:
     * - true: o posterior
     * - false: o anterior
     * - null: o próprio
     * @return {Date}
     */
    anniversary: (pAnniversaryDay, pTargetDate, pGreater = null) => {
        if (!isNumber(pAnniversaryDay)) {
            throw Error('anniversary: invalid number');
        }
        if (!isDate(pTargetDate)) {
            throw Error('anniversary: invalid date');
        }

        const xYear = pTargetDate.getFullYear();
        const xMonth = pTargetDate.getMonth();
        const xDataBase = dates.startOf('day', BASE_DATE);
        let xAnniversary = dates.addMonths(
            dates.addDays(dates.addYears(dates.startOf('day', xDataBase), xYear), pAnniversaryDay - 1),
            xMonth
        );
        if (pTargetDate.getDate() !== pAnniversaryDay && pGreater !== null) {
            xAnniversary = dates.addMonths(xAnniversary, pGreater ? 1 : -1);
        }
        return xAnniversary;
    },
    /**
     * Retorna data de aniversário do próximo mês
     * Ajusta datafim: Se dia inicial for maior que dia final
     *
     * @param {Date} pDate
     * @returns
     */
    nextMonthAnniversary: pDate => {
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
        return moment(pDate).startOf(pUnit).toDate();
    },

    /**
     * Retorna data fim conforma a unidade
     *
     * @param {string} pUnit year, quarter, month, week, day
     * @param {Date} [pDate={}]
     * @returns {Date}
     */
    endOf: (pUnit, pDate) => {
        return moment(pDate).endOf(pUnit).toDate();
    },

    /**
     * Verifica se string é uma hora válida
     *
     * @param {String} pTime
     * @returns {boolean}
     */
    isTime: pTime => {
        if (!pTime || pTime.length != 5) {
            return false;
        }
        return /^([01]\d|2[0-3]):?([0-5]\d)$/.test(pTime);
    },

    /**
     * Configura setInterval após executa imediatamente a função informada
     *
     * @param {function} pFunction
     * @param {number} pInterval
     * @return {*}
     */
    setIntervalAfterRun: (pFunction, pInterval) => {
        if (!isFunction(pFunction)) {
            return null;
        }
        pFunction();
        return setInterval(pFunction, pInterval);
    },
    /**
     * Agenda execução da função para a data e hora informada
     *
     * @param {Date} pDate Data e hora para inicio da execução
     * @param {function} pFunction Função a ser executada
     * @param {function} pCallback Função a ser executada ao final
     * @returns {number} setTimeout id
     */
    schedule: (pDate, pFunction, pCallback = () => {}) => {
        if (isNull(pDate)) {
            return null;
        }
        // @ts-ignore
        let xMilsec = pDate - dates.toDate();
        if (xMilsec < 0) {
            return null;
        }
        //Settimeout não permite intervalos maiores que 9.94 dias ou 2147483.646 milisegundos.
        //Este rotina, por segurança e simplificação, assumirá o limite de 7 dias.
        //Para resolver a esta limitação, é criado uma cadeia de schedules (limitados a 7 dias para cada) onde
        //o primeiro chamará o próximo, e assim sucessivamente até a data efetivamente agendada e a execução da função principal e callback.
        //Se for maior que 7 dias.
        if (xMilsec > dates.ONE_WEEK) {
            //Faz novo agendamento para a semana anterior a data limite
            const xPreviousWeek = new Date(pDate.getTime() - dates.ONE_WEEK);
            return dates.schedule(xPreviousWeek, function () {
                return dates.schedule(pDate, pFunction, pCallback);
            });
        } else {
            // @ts-ignore
            return setTimeout(() => {
                Promise.resolve(pFunction())
                    .then(rResult => {
                        pCallback(rResult);
                    })
                    .catch(rErr => {
                        pCallback(null, rErr);
                    });
            }, xMilsec);
        }
    },

    /** Retorna objeto con os valores data separados em:
     * year, month, day, hour, minute, second
     *
     * @param {Date} pDate
     * @returns {object}
     */
    dateToObject: pDate => {
        if (!isDate(pDate)) {
            throw Error('dateToObject: invalid date');
        }
        return {
            year: String(pDate.getFullYear()),
            month: String(pDate.getMonth() + 1).padStart(2, '0'),
            day: String(pDate.getDate()).padStart(2, '0'),
            hour: String(pDate.getHours()).padStart(2, '0'),
            minute: String(pDate.getMinutes()).padStart(2, '0'),
            second: String(pDate.getSeconds()).padStart(2, '0')
        };
    },

    /** Retorna objeto con os valores data separados em:
     * year, month, day, hour, minute, second
     *
     * @param {Date} pDate
     * @returns {object}
     */
    UTCDateToObject: pDate => {
        if (!isDate(pDate)) {
            throw Error('dateToObject: invalid date');
        }
        return {
            year: String(pDate.getUTCFullYear()),
            month: String(pDate.getUTCMonth() + 1).padStart(2, '0'),
            day: String(pDate.getUTCDate()).padStart(2, '0'),
            hour: String(pDate.getUTCHours()).padStart(2, '0'),
            minute: String(pDate.getUTCMinutes()).padStart(2, '0'),
            second: String(pDate.getUTCSeconds()).padStart(2, '0')
        };
    },
    // { "type": "D", "time": "08:00" },
    // { "type": "W", "time": "15:00", "weekday": 0 },
    // { "type": "M", "time": "10:00", "day": 1 },
    // { "type": "Y", "time": "10:00", "month": 1 }
    /**
     * Retorna data a partir dos parametros de schedule
     * @param {object} pSchedule Parametros do schedule
     * - type: **'D'**-Dia, **'W'**-Semana, **'M'**-Mês, **'Y'**-Ano.
     * - time: Hora que será executado.
     * - weekday: Dia da semana sendo de **0**-Domingo até **6**-Sábado. Somente válido quando *type* for **'W'**.
     * - day: Números do dia. Dia *99* representa o último dia do mês. Somente válido quando *type* for **'M'**.
     * - month: Número do mês. Somente válido quando *type* for **'Y'**.
     * - workingDay: Pula para próxima data útil se data encontrada for não útil.
     * @param {Date} [pBaseDate=null] Date base que será utilizado para calcular a próxima data.
     * 								  Quando não informada é utilizada a data atual.
     * @returns {Date} Próxima Data
     */
    scheduleToDate: (pSchedule, pBaseDate = null) => {
        if (
            !pSchedule ||
            !pSchedule.type ||
            !pSchedule.time ||
            !dates.SCHEDULE_TYPE.includes(pSchedule.type) ||
            !dates.isTime(pSchedule.time)
        ) {
            throw Error('scheduleToDate: parameters not informed');
        }
        const xCurrentDate = pBaseDate || dates.toDate();
        const xNow = dates.dateToObject(xCurrentDate);

        let xNextDate = null;
        pSchedule.type = pSchedule.type.toUpperCase();
        if (pSchedule.type === 'D') {
            xNextDate = dates.toDate(`${xNow.year}${xNow.month}${xNow.day}${pSchedule.time}`, SCHEDULE_FORMAT);
            if (xNextDate < xCurrentDate) {
                //Incrementa um dia
                xNextDate = dates.addDays(xNextDate, 1);
            }
        } else if (pSchedule.type === 'W') {
            if (!pSchedule.weekday) {
                pSchedule.weekday = 0;
            } else {
                const xWeekday = numbers.toNumber(pSchedule.weekday);
                if (xWeekday === null || xWeekday < 0 || xWeekday > 6) {
                    throw Error('scheduleToDate: invalid weekday');
                }
            }
            let xDif = pSchedule.weekday - xCurrentDate.getDay();
            //Adiciona os dias até ser o dia da semana desejado
            if (xDif < 0) {
                xDif = 7 - Math.abs(xDif);
            }
            xNextDate = dates.addDays(xCurrentDate, xDif);
            // const xNextDataObject = dates.dateToObject(new Date(xNextDate.tl()));
            xNextDate = dates.toDate(
                `${xNextDate.getFullYear()}${String(xNextDate.getMonth() + 1).padStart(2, '0')}${String(
                    xNextDate.getDate()
                ).padStart(2, '0')}${pSchedule.time}`,
                SCHEDULE_FORMAT
            );
            //Adiciona uma semana se data já tiver passado
            if (xNextDate < xCurrentDate) {
                //Incrementa uma semana
                xNextDate = dates.addDays(xNextDate, 7);
            }
        } else if (pSchedule.type === 'M') {
            if (!pSchedule.day) {
                pSchedule.day = 1;
            }
            let xNextDay = numbers.toNumber(pSchedule.day);
            if (xNextDay === null || xNextDay < 0 || (xNextDay > 31 && xNextDay !== 99)) {
                throw Error('scheduleToDate: invalid day');
            }
            xNextDay = ('0' + xNextDay).slice(-2);
            xNextDate = dates.toDate(`${xNow.year}${xNow.month}${xNextDay}${pSchedule.time}`, SCHEDULE_FORMAT);
            // @ts-ignore
            if (xNextDay === 99 || isNaN(xNextDate)) {
                const xTmpDate = dates.dateToObject(dates.endOf('month', xCurrentDate));
                xNextDate = dates.toDate(
                    `${xTmpDate.year}${xTmpDate.month}${xTmpDate.day}${pSchedule.time}`,
                    SCHEDULE_FORMAT
                );
            }
            if (xNextDate < xCurrentDate) {
                //Incrementa um mês
                xNextDate = dates.nextMonthAnniversary(xNextDate);
            }
        } else if (pSchedule.type === 'Y') {
            if (!pSchedule.month) {
                pSchedule.month = 1;
            }
            let xNextMonth = numbers.toNumber(pSchedule.month);
            if (xNextMonth === null || xNextMonth < 0 || xNextMonth > 12) {
                throw Error('scheduleToDate: invalid month');
            }
            xNextMonth = ('0' + xNextMonth).slice(-2);
            //Calcula data do primeiro dia no mês/ano selecionado
            xNextDate = dates.toDate(`${xNow.year}${xNextMonth}${'01'}${pSchedule.time}`, SCHEDULE_FORMAT);
            if (xNextDate < xCurrentDate) {
                //Incrementa um ano
                xNextDate = dates.addYears(xNextDate, 1);
            }
        }
        if (pSchedule.workingDay) {
            xNextDate = dates.addWorkingDays(xNextDate, 0);
        }
        return xNextDate;
    },
    /**
     * Retorna inteiro relativo a semana do mês
     * @param {Date} pDate
     * @returns
     */
    weekOfMonth: (pDate, pAbsolute = false) => {
        if (isNull(pDate)) {
            return 0;
        }

        if (pAbsolute) {
            return moment(pDate).week() - moment(pDate).startOf('month').week() + 1;
        }

        const xDay = moment(pDate).date();
        const xWeek = Math.ceil(xDay / 7);
        return xWeek;
    },

    /**
     * Retorna inteiro relativo a semana do ano
     * @param {Date} pDate
     * @returns
     */
    weekOfYear: pDate => {
        if (isNull(pDate)) {
            return 0;
        }

        return moment(pDate).week();
    },

    /**
     * Retorna objeto com os inteiros referentes a semana do mês ou do ano.
     * @param {Date} pDate Data
     * @returns {Object} Semana do mês ou do ano
     * @example
     * dates.weekOf(new Date(2020, 1, 1)); // 1
     * dates.weekOf(new Date(2020, 1, 8)); // 2
     **/
    weekOf: (pDate, pAbsolute = false) => {
        if (isNull(pDate)) {
            return {};
        }
        const xResult = { month: dates.weekOfMonth(pDate, pAbsolute), year: dates.weekOfYear(pDate) };

        return xResult;
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

const pvDaysDif = (pDateStart, pDateEnd) => {
    const xDateStart = dates.toUTCDate(pDateStart);
    const xDateEnd = dates.toUTCDate(pDateEnd);
    let xDays = Math.floor((xDateEnd.getTime() - xDateStart.getTime()) / dates.ONE_DAY);
    return xDays;
};
//Carrega informações dos feriados
dates.loadData();
