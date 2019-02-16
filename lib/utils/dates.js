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
            .replace("T", " ");
    }
};
module.exports = dates;
