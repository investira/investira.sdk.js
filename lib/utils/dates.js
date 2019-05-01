const moment = require('moment');
const { isEmpty, isDate } = require('./validators');

const dates = {
    ONE_SECOND: 1000,
    ONE_MINUTE: 60 * this.ONE_SECOND,
    ONE_HOUR: 60 * this.ONE_MINUTE,
    ONE_DAY: 24 * this.ONE_HOUR,
    ONE_MONTH: 30 * this.ONE_DAY,
    ONE_YEAR: 365 * this.ONE_DAY,

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
    daysBetween(pDate1, pDate2) {
        return Math.round(
            Math.abs((pDate1.getTime() - pDate2.getTime()) / dates.ONE_DAY)
        );
    },

    /**
     * Quantidade de anos entre duas datas
     *
     * @param {*} pDate1
     * @param {*} pDate2
     * @returns
     */
    yearsBetween(pDate1, pData2) {
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
    getWeekends: (pDate1, pData2) => {
        //Quantidade sábados e domingos entre a datas
		const xSemanas = Math.abs(dates.daysBetween(pDate1, pData2));
		const xDias = 
        //  (((DBSDate.getDateDif(xDataBase,pDate1)+1)/7)-0.001); //Quantidade de semanas existentes na data inicio
        // xDiasF = (((DBSDate.getDateDif(xDataBase,pData2)+1)/7)-0.001); //Quantidade de semanas existenstes na data fim
    }
    // public static int getWeekends(Date pDate1, Date pData2){
    // 	Double xDiasI;
    // 	Double xDiasF;
    // 	int xDias;
    // 	Date xDataBase;
    // 	xDataBase = DBSDate.toDate(01,01,1900);
    // 	//Quantidade sábados e domingos entre a datas
    // 	xDiasI = (((DBSDate.getDateDif(xDataBase,pDate1)+1)/7)-0.001); //Quantidade de semanas existentes na data inicio
    // 	xDiasF = (((DBSDate.getDateDif(xDataBase,pData2)+1)/7)-0.001); //Quantidade de semanas existenstes na data fim
    // 	xDias = (xDiasF.intValue() - xDiasI.intValue()) * 2; //Quantidade de dias(sábados e domingos);
    // 	xDias = Math.abs(xDias);
    // 	// Ajusta os dias caso as data seja um final de semana
    // 	if (pData2.compareTo(pDate1) > 0) {
    // 		// Ajusta os dias se as datas forem iguais a sábado
    // 		if (DBSDate.toCalendar(pDate1).get(Calendar.DAY_OF_WEEK) == 7){
    // 			xDias--;
    // 		}
    // 		if (DBSDate.toCalendar(pData2).get(Calendar.DAY_OF_WEEK) == 7){
    // 			xDias++;
    // 		}
    // 	} else {
    // 		// Ajusta os dias se as datas forem iguais a domingo
    // 		if (DBSDate.toCalendar(pDate1).get(Calendar.DAY_OF_WEEK) == 1){
    // 			xDias--;
    // 		}
    // 		if (DBSDate.toCalendar(pData2).get(Calendar.DAY_OF_WEEK) == 1){
    // 			xDias++;
    // 		}
    // 	}

    // 	return xDias;
    // }
};
module.exports = dates;
