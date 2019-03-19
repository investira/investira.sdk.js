const { isEmpty, isDate } = require('./validators');
const oneDay = 24 * 60 * 60 * 1000;

const dates = {
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
            Math.abs((pDate1.getTime() - pDate2.getTime()) / oneDay)
        );
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
        return Math.round((Date.now() - xDate) / 1000) > pLife;
    },

    /**
     * Retorna datacom acréscimo dos milisegundos informados
     *
     * @param {*} pDate
     * @param {*} pSeconds
     * @returns
     */
    addSeconds: (pDate, pSeconds) => {
        return new Date(pDate.getTime() + pSeconds * 1000);
    }
};
module.exports = dates;
