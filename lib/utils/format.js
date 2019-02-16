import { round } from "./numbers";

const formats = {
    /**
     * Retorna o número simplificado com mil, mi, bi, tri, quatri.
     *
     * @constructor
     * @param {int} pValue Elemento a ser verificado
     * @param {string} pLocale Região para formatar o número
     * @param {string} pCurrencyLabel Símbolo monetário
     * @return {string} Número formatado
     */
    friendlyNumberFormat: (pValue, pLocale, pCurrencyLabel) => {
        let xValue = round(pValue, 2);
        let xValueInt = Number.parseInt(xValue);
        let xValueLength = xValueInt.toString().length;
        let xValueReduce =
            xValue / Math.pow(10, xValueLength - 1 - ((xValueLength - 1) % 3));
        let xValueLocated = xValueReduce.toLocaleString(pLocale);
        let xSufix = "";

        if (xValueLength > 15) {
            xSufix = "quatri";
        } else if (xValueLength > 12) {
            xSufix = "tri";
        } else if (xValueLength > 9) {
            xSufix = "bi";
        } else if (xValueLength > 6) {
            xSufix = "mi";
        } else if (xValueLength > 3) {
            xSufix = "mil";
        } else {
            xSufix = "";
        }

        let xValueFormated =
            xValueLocated < 1
                ? Number(xValueLocated).toFixed(2)
                : `${xValueLocated} ${xSufix}`;

        return pCurrencyLabel
            ? `${pCurrencyLabel} ${xValueFormated}`
            : xValueFormated;
    },

    slugPeriod: (pYear, pMonth) => {
        this.year = pYear > 1 ? `${pYear} anos` : `${pYear} ano`;
        this.month = pMonth > 1 ? `${pMonth} meses` : `${pMonth} mês`;
    },

    friendlyDate: pMonths => {
        let xYears = Math.floor(pMonths / 12);
        let xMonths = pMonths % 12;
        let slugs = new slugPeriod(xYears, xMonths);

        let xPeriod =
            xMonths > 0 ? `${slugs.year} e ${slugs.month}` : slugs.year;

        return xPeriod;
    }
};

module.exports = formats;
