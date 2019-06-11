const test = require('tape');

const numbers = require('../utils/numbers');

test('\nnumbers weightedMean', t => {
    t.equal(numbers.weightedMean([300, 100, 10], [10, 20, 50]), 68.75);
    t.end();
});

test('\nnumbers apart', t => {
    t.deepEqual(numbers.apart(1.12), { sign: '', int: '1', dec: '12' });
    t.deepEqual(numbers.apart(1.123456789012345678), {
        sign: '',
        int: '1',
        dec: '1234567890123457'
    });
    t.deepEqual(numbers.apart(-1.123456789012345678), {
        sign: '-',
        int: '1',
        dec: '1234567890123457'
    });
    t.end();
});

test('\nnumbers add', t => {
    t.equal(numbers.add(1.13, 1.12), 2.25);
    t.equal(numbers.add(1.000000013, 1.000000012), 2.000000025);
    t.equal(numbers.add(1234.5689012345, 4.5689012345), 1239.137802469);
    t.equal(numbers.add(-1.4689012345, -3314.5689012345), -3316.037802469);
    t.equal(numbers.add(0.00000000001, 0.1), 0.10000000001);
    t.equal(numbers.add(0.00000000001, 0.0000000001), 0.00000000011);
    t.equal(numbers.add(0.000000000013, -0.000000000014), 0);
    t.equal(numbers.add(1234567890.123, 1.12), 1234567891.243);
    t.end();
});

test('\nnumbers sub', t => {
    t.equal(numbers.sub(1.13, 1.12), 0.01);
    t.equal(numbers.sub(1.000000013, 1.000000012), 0.000000001);
    t.equal(numbers.sub(1234.5689012345, 4.5689012345), 1230);
    t.equal(numbers.sub(12.5689012345, -3314.5689012345), 3327.137802469);
    t.equal(numbers.sub(0.00000000001, 0.1), -0.09999999999);
    t.equal(numbers.sub(0.00000000001, -0.0000000001), 0.00000000011);
    t.equal(numbers.sub(0.000000000013, 0.000000000014), 0);
    t.equal(numbers.sub(-1234567890.123, 1.12), -1234567891.243);
    t.end();
});

test('\nnumbers mul', t => {
    t.equal(numbers.mul(-2.2, -2.1), 4.62);
    t.equal(numbers.mul(1.1, 1.1), 1.21);
    t.equal(numbers.mul(3, 0.15), 0.45);
    t.equal(numbers.mul(-0.000001, 1.01), -0.00000101);
    t.equal(numbers.mul(244.123, 13), 3173.599);
    t.equal(numbers.mul(1.123, 12), 13.476);
    t.equal(numbers.mul(12.4344, 1.1), 13.67784);
    t.equal(numbers.mul(0.4344, 0.0021), 0.00091224);
    t.equal(numbers.mul(10.4344, 0.00021), 0.002191224);
    t.equal(numbers.mul(2, 4.01), 8.02);
    t.equal(numbers.mul(12345679.012, 1.021), 12604938.271252);
    t.equal(numbers.mul(4.300000000000001, 5), 21.500000000000004);
    t.equal(numbers.mul(4.0001, 5.0002), 20.00130002);
    t.equal(numbers.mul(4.0001, 5.0002), 20.00130002);
    t.equal(numbers.mul(2357.12345679, 1234567), 2910026834.6788597); //2910026834.67886 = Se fosse bigDecimal
    t.equal(
        numbers.mul(-0.123456789012345678901, -1230.123456789012345678901),
        151.86709206351316
    ); //151.86709206393883 = Se fosse bigDecimal
    t.end();
});

test('\nnumbers div', t => {
    t.equal(numbers.div(1222.1, 0.00000001), 122210000000);
    t.equal(numbers.div(1.001, 1.1), 0.91);
    t.end();
});
