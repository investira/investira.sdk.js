const numbers = require('../utils/numbers');
const { InvalidData, DataNotFound } = require('../messages/DataErrors');
const { BasicMessageError } = require('../messages/BasicMessages');

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
        return numbers.round(xPMT, 2);
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
        return numbers.round(xFV, 2);
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
    },
    /**
     * Cálculo de aposentadoria
     *
     * @param {object} pData {eco:{pv,pmt,n,i},sac:{pv,pmt,n,i}}
     * @param {object} pTarget Qual dos valores de pData será calculado
     * @param {function} pAbort callback para verificar se cálculo deve ser abordado
     * @return {Promise} {target, meta, chart}
     */
    aposentadoria: async (pData, pTarget, pAbort = () => false) => {
        try {
            return pvAtingirMeta(pData, pTarget, pAbort);
        } catch (pErr) {
            return new BasicMessageError(pErr.message, 500);
        }
    }
};

module.exports = invests;

function pvAtingirMeta(pData, pTarget, pAbort) {
    let xMenorValor =
        pTarget == pData.eco.pv ||
        pTarget == pData.eco.pmt ||
        pTarget == pData.eco.n ||
        pTarget == pData.eco.i ||
        pTarget == pData.eco.fv;
    let xMax = pTarget.max;
    let xMin = pTarget.min;
    let xCount = 0;
    let xCalculo = null;
    let xVP;
    let xFV;
    let xDif;

    //Se for Sac PV
    if (pTarget == pData.sac.pv) {
        pTarget.value = 0;
        xCalculo = pvCalcula(pData);
        pTarget.value = xCalculo.chart[xCalculo.length - 1].value;
    } else {
        while (true && !pAbort()) {
            xCount++;
            if (xMenorValor) {
                //				pProps[pProps.target].value = dbsfaces.math.round(xMin + ((xMax - xMin) / 2), xTargetSliderData.dp);
                pTarget.value = numbers.round(xMin + (xMax - xMin) / 2, 6);
            } else {
                //				pProps[pProps.target].value = dbsfaces.math.trunc(xMin + ((xMax - xMin) / 2), xTargetSliderData.dp);
                pTarget.value = numbers.trunc(xMin + (xMax - xMin) / 2, 6);
            }
            xCalculo = pvCalcula(pData);
            if (xCalculo.chart.length > pData.eco.n.value) {
                //FV no final geral
                xFV = xCalculo.chart[xCalculo.chart.length - 1].value;
                xVP = pData.sac.pv.value;
                if (xMenorValor) {
                    xDif = xFV - xVP;
                } else {
                    xDif = xVP - xFV;
                }
                if (xDif == 0) {
                    break;
                } else if (xDif > 0) {
                    if (xMax == pTarget.value) {
                        break;
                    } else {
                        xMax = pTarget.value;
                    }
                } else {
                    if (xMin == pTarget.value) {
                        break;
                    } else {
                        xMin = pTarget.value;
                    }
                }
            } else {
                xMax = pTarget.value;
            }
            if (xCount > 200) {
                throw new InvalidData();
            }
        }
    }
    return { target: pTarget, ...xCalculo };
}

function pvCalcula(pData) {
    let xFV = 0;
    //Lista crédito
    let xList = invests.fvs({
        pv: -pData.eco.pv.value,
        pmt: -pData.eco.pmt.value,
        i: pData.eco.i.value,
        n: pData.eco.n.value,
        type: 0
    });
    if (xList.length > 0) {
        //Salva FV antes de excluí-lo da lista
        xFV = xList[xList.length - 1].value;
        //Exclui último item da lista
        xList.pop();
    }

    //Lista débito
    let xListSac = invests.fvs({
        pv: -xFV,
        pmt: pData.sac.pmt.value,
        i: pData.eco.i.value,
        n: pData.sac.n.value,
        type: 0
    });
    for (let i = 0; i < xListSac.length; i++) {
        xList.push({ value: xListSac[i].value, label: xList.length });
    }
    return { meta: xFV, chart: xList };
}
