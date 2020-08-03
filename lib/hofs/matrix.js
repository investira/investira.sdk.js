function matrix() {
    const xRows = [];
    const xCols = [];
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
    this.get = (pRow, pCol) => {
        return xRows[pRow][pCol];
    };
    this.rows = () => {
        return Object.freeze(xRows);
    };
    this.cols = () => {
        return Object.freeze(xCols);
    };
}

module.exports = matrix;
