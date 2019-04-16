const invests = {
    pvif: pData => {
        let { i = 0, n = 0 } = pData;

        return Math.pow(1 + i, n);
    },

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

        return parseFloat(xPMT.toFixed(2));
    },

    fv: pData => {
        let { i = 0, n = 1, pmt = 0, pv = 0, type = 0 } = pData;
        let xFV;

        if (i === 0) {
            xFV = -1 * (pv + pmt * n);
        } else {
            i /= 100;
            // let xPVIF = Math.pow(1 + I, N);
            let xPVIF = invests.pvif({ ...pData, i: i });
            xFV = (pmt * (1 + i * type) * (1 - xPVIF)) / i - pv * xPVIF;
        }
        return parseFloat(xFV.toFixed(2));
    },

    fvs: pData => {
        let { n = 1 } = pData;
        let xFV;
        let xList = [];

        //Total economizado
        for (let x = 0; x <= n; x++) {
            xFV = invests.fv({ ...pData, n: x });
            xList.push({ value: xFV, label: x });
        }
        return xList;
    }
};

module.exports = invests;
