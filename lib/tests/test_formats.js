const test = require('tape');

const formats = require('../utils/formats');
formats.LOCALE = 'pt-BR';
formats.CURRENCY = 'BRL'; //'EUR';

// const a = formats.friendlyNumber(0, 3, false);

// console.log(formats.formatNumber(123, 2));
// console.log(formats.friendlyByte(123));
// console.log(formats.friendlyNumber(123456789));
// console.log(formats.friendlyNumber(123456789012, 3));
// console.log(formats.friendlyNumber(0, 2));
// console.log(formats.friendlyNumber(100, 0, true)); // R$100
// console.log(formats.friendlyNumber(1200, 0, true)); // R$ 1,2 mil
// console.log(formats.friendlyNumber(71200, 0, true)); // R$71,2 mil
// console.log(formats.friendlyNumber(123456, 2, true)); // R$123,46 mil
test('\nfriendlyNumber', t => {
    t.equal(formats.friendlyNumber(123, 0, true), 'R$123');
    t.equal(formats.friendlyNumber(123, 0, false), '123');
    t.equal(formats.friendlyNumber(123, 0, true), 'R$123');
    t.equal(formats.friendlyNumber(123, 0, false), '123');
    t.equal(formats.friendlyNumber(1234567, 0, false), '1 mi');
    t.equal(formats.friendlyNumber(1234567, 1, false), '1.2 mi');
    t.equal(formats.friendlyNumber(1234567, 2, false), '1.23 mi');
    t.equal(formats.friendlyNumber(1234567, 3, false), '1.235 mi');
    t.equal(formats.friendlyNumber(1234000, 0, false), '1 mi');
    t.equal(formats.friendlyNumber(1234000, 1, false), '1.2 mi');
    t.equal(formats.friendlyNumber(1234000, 2, false), '1.23 mi');
    t.equal(formats.friendlyNumber(1234000, 3, false), '1.234 mi');
    t.equal(formats.friendlyNumber(1234000, 0, true), 'R$1 mi');
    t.equal(formats.friendlyNumber(1234000, 1, true), 'R$1.2 mi');
    t.equal(formats.friendlyNumber(1234000, 2, true), 'R$1.23 mi');
    t.equal(formats.friendlyNumber(1234000, 3, true), 'R$1.234 mi');
    t.equal(formats.friendlyNumber(-1234000, 3, false), '-1.234 mi');
    t.equal(formats.friendlyNumber(0, 3, false), '0');
    t.end();
});

test('\nformats.friendlyDate', t => {
    t.equal(formats.friendlyDate(8), '8 meses');
    t.equal(formats.friendlyDate(12), '1 ano');
    t.equal(formats.friendlyDate(13), '1 ano e 1 mês');
    t.equal(formats.friendlyDate(14), '1 ano e 2 meses');
    t.equal(formats.friendlyDate(26), '2 anos e 2 meses');
    //@ts-ignore
    t.equal(formats.friendlyDate('d'), '');
    t.equal(formats.friendlyDate(null), '');
    t.end();
});
