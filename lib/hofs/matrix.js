function matrix() {
    const xRows = [];
    const xCols = [];

    /**
     * Setar o valor de uma celula
     *
     * @param {number} pRow
     * @param {number} pCol
     * @param {object} pValue
     */
    this.set = (pRow, pCol, pValue) => {
        if (xRows[pRow] && xRows[pRow][pCol]) {
            xRows[pRow][pCol].value = pValue;
            return;
        }

        const xValue = { value: pValue };

        //Controle de linha e respectrivas colunas
        let xDif = pRow + 1 - xRows.length;
        if (xDif > 0) {
            for (let i = 0; i < xDif; i++) {
                xRows.push([,]);
            }
        }
        xRows[pRow][pCol] = xValue;

        //Controle de colunas e respectivas linhas
        xDif = pCol + 1 - xCols.length;
        if (xDif > 0) {
            for (let i = 0; i < xDif; i++) {
                xCols.push([,]);
            }
        }
        xCols[pCol][pRow] = xValue;
    };

    /**
     * Ler o valor de uma célula
     *
     * @param {number} pRow
     * @param {number} pCol
     * @return {object}
     */
    this.get = (pRow, pCol) => {
        return xRows[pRow][pCol];
    };

    /**
     * Ler os valores de uma linha
     *
     * @param {number} pRow
     * @return {array}
     */
    this.row = (pRow = 0) => {
        if (pRow <= xRows.length) {
            return Object.freeze(xRows[pRow]);
        } else {
            return null;
        }
    };
    /**
     * Ler os valores de uma coluna
     *
     * @param {number} pCol
     * @return {array}
     */
    this.col = (pCol = 0) => {
        if (pCol <= xCols.length) {
            return Object.freeze(xCols[pCol]);
        } else {
            return null;
        }
    };

    /**
     * Ler os valores de uma coluna
     *
     * @return {object}
     */
    this.matrix = () => {
        return Object.freeze(xRows);
    };
}

module.exports = matrix;
