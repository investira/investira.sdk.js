const numbers = require('./numbers');

const invests = {
    /**
     *
     *
     * @param {object} pData {i:,n:}
     * @returns
     */
    pvif: pData => {
        let { i = 0, n = 0 } = pData;

        return Math.pow(1 + i, n);
    },

    /**
     *
     *
     * @param {object} pData {i:,n:,pv:,fv:,type:}
     * @returns
     */
    pmt: pData => {
        let { i = 0, n = 1, pv = 0, fv = 0, type = 0 } = pData;
        let xPMT;

        if (i === 0) {
            xPMT = -(pv + fv) / n;
        } else {
            i /= 100;
            let xPVIF = invests.pvif({ ...pData, i: i });
            xPMT = (i / (xPVIF - 1)) * -(pv * xPVIF + fv);
            if (type === 1) {
                xPMT /= 1 + i;
            }
        }
        return numbers.round(xPMT, 2);
    },

    /**
     *
     *
     * @param {object} pData {i:,n:,pmt:,pv:,type:}
     * @returns
     */
    fv: pData => {
        let { i = 0, n = 1, pmt = 0, pv = 0, type = 0 } = pData;
        let xFV;

        if (i === 0) {
            xFV = -1 * (pv + pmt * n);
        } else {
            i /= 100;
            let xPVIF = invests.pvif({ ...pData, i: i });
            xFV = (pmt * (1 + i * type) * (1 - xPVIF)) / i - pv * xPVIF;
        }
        return numbers.round(xFV, 2);
    },

    fvs: (
        pData,
        pAbort = _ => {
            return false;
        }
    ) => {
        let { n = 1 } = pData;
        let xFV;
        let xList = [];

        //Total economizado
        for (let x = 0; x <= n; x++) {
            xFV = invests.fv({ ...pData, n: x });
            xList.push({ value: xFV, label: x });
            if (pAbort({ fv: xFV, n: x })) {
                break;
            }
        }
        return xList;
    }
};

module.exports = invests;
