const test = require('tape');
const invests = require('../utils/invests');

test('\ninvests - i', t => {
    let xData = {};
    xData = { n: 24, pv: 2500000, pmt: -217972.55, fv: 0, type: 0 };
    t.equal(invests.i(xData), 6.9999999);
    xData = { n: 24, pv: 2500000, pmt: -217972.55, fv: 1000000, type: 0 };
    t.equal(invests.i(xData), 5.94256711);
    xData = { n: 24, pv: 1000000, pmt: -217972.55, fv: 0, type: 0 };
    t.equal(invests.i(xData), 21.59763755);
    t.end();
});

test('\ninvests - fv', t => {
    let xData = {};
    xData = { n: 12, pv: 400, pmt: -1040, i: 3, type: 0 };
    t.equal(invests.fv(xData), 14189.40638926);
    xData = { n: 12, pv: 0, pmt: -1040, i: 3, type: 0 };
    t.equal(invests.fv(xData), 14759.710744);
    xData = { n: 12, pv: 0, pmt: -1040, i: -3, type: 0 };
    t.equal(invests.fv(xData), 10613.46481882);
    xData = { n: 12, pv: 400, pmt: 1040, i: 3, type: 0 };
    t.equal(invests.fv(xData), -15330.01509874);
    t.end();
});
