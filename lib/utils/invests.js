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
     * @param {*} pData {i:,n:,pmt:,fv:,decimals:}
     * @returns
     */
    pv: pData => {
        let { i = 0, n = 0, pmt = 0, fv = 0, decimals = 2 } = pData;
        let xPV = 0;
        if (i == 0) {
            xPV = -(fv + pmt * n);
        } else {
            i /= 100;
            let x = Math.pow(1 + i, -n);
            let y = Math.pow(1 + i, n);
            xPV = -(x * (fv * i - pmt + y * pmt)) / i;
        }
        return numbers.round(xPV, decimals);
    },

    /**
     *
     *
     * @param {object} pData {i:,pmt:,pv:,fv:,type:}
     * @returns
     */
    nper: pData => {
        let { i = 0.0, pmt = 0.0, pv = 0.0, fv = 0.0, type = 0 } = pData;
        let xN;
        if (i == 0.0) {
            xN = -(fv + pv) / pmt;
        } else {
            i /= 100.0;
            let xNum = pmt * (1 + i * type) - fv * i;
            let xDen = pv * i + pmt * (1 + i * type);
            xN = Math.log(xNum / xDen) / Math.log(1 + i);
        }
        return numbers.round(xN, 0);
    },

    /**
     *
     *
     * @param {object} pData {n:,pmt:,pv:,fv:,type:,decimals:}
     * @returns
     */
    i: pData => {
        let { n = 0, pmt = 0.0, pv = 0.0, decimals = 8 } = pData;
        let xI = ((2.0 * (n * -pmt + pv)) / (pv * n)) * 100;
        let xCount = 0.0;
        let xMax = xI * 10.0;
        let xMin = 0.0;
        while (true) {
            xCount++;
            let xPmt = invests.pmt({ ...pData, i: xI, decimals: 5 });
            if (xPmt == pmt) {
                break;
            } else if (xPmt < pmt) {
                //Diminuir
                xMax = xI;
            } else if (xPmt > pmt) {
                //Aumentar
                xMin = xI;
            }
            xI = (xMax + xMin) / 2.0;
            if (xCount > 100) {
                throw Error(`Aborted after ${xCount} tries`);
            }
        }
        return numbers.round(xI, decimals);
    },

    /**
     *
     *
     * @param {object} pData {i:,n:,pv:,fv:,type:,decimals:}
     * @returns
     */
    pmt: pData => {
        let {
            i = 0.0,
            n = 1,
            pv = 0.0,
            fv = 0.0,
            type = 0,
            decimals = 8
        } = pData;
        let xPMT;

        if (i == 0.0) {
            xPMT = -(pv + fv) / n;
        } else {
            i /= 100;
            let xPVIF = invests.pvif({ ...pData, i: i });
            xPMT = (i / (xPVIF - 1)) * -(pv * xPVIF + fv);
            if (type === 1) {
                xPMT /= 1 + i;
            }
        }
        return numbers.round(xPMT, decimals);
    },

    /**
     *
     *
     * @param {object} pData {i:,n:,pmt:,pv:,type:,decimals:}
     * @returns
     */
    fv: pData => {
        let {
            i = 0.0,
            n = 1,
            pmt = 0.0,
            pv = 0.0,
            type = 0,
            decimals = 8
        } = pData;
        let xFV;

        if (i == 0) {
            xFV = -1 * (pv + pmt * n);
        } else {
            i /= 100;
            let xPVIF = invests.pvif({ ...pData, i: i });
            xFV = (pmt * (1 + i * type) * (1 - xPVIF)) / i - pv * xPVIF;
        }
        return numbers.round(xFV, decimals);
    },

    /**
     * @param {object} pData {i:,n:,pmt:,pv:,type:,decimals:}
     * @param {function} [pAbort] Callback abort function
     * @returns
     */
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
