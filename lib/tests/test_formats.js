const test = require('tape');

const formats = require('../utils/formats');
formats.LOCALE = 'pt-BR';
formats.CURRENCY = 'BRL'; //'EUR';

formats.locale('pt-BR');

test('\nformats.formatPhone', t => {
    t.equal(formats.formatPhone('12345678', '21', '55'), '+55 (21) 1234-5678');
    t.equal(formats.formatPhone(12345678, '21', 55), '+55 (21) 1234-5678');
    t.equal(formats.formatPhone(12345678, '21'), '(021) 1234-5678');
    t.end();
});

test('\nformats.friendlyNumber', t => {
    t.equal(formats.friendlyNumber(123, 0, true), 'R$ 123');
    t.equal(formats.friendlyNumber(123, 0, false), '123');
    t.equal(formats.friendlyNumber(123, 0, true), 'R$ 123');
    t.equal(formats.friendlyNumber(123, 0, false), '123');
    t.equal(formats.friendlyNumber(1234567, 0, false), '1 mi');
    t.equal(formats.friendlyNumber(1234567, 1, false), '1,2 mi');
    t.equal(formats.friendlyNumber(1234567, 2, false), '1,23 mi');
    t.equal(formats.friendlyNumber(1234567, 3, false), '1,235 mi');
    t.equal(formats.friendlyNumber(1234000, 0, false), '1 mi');
    t.equal(formats.friendlyNumber(1234000, 1, false), '1,2 mi');
    t.equal(formats.friendlyNumber(1234000, 2, false), '1,23 mi');
    t.equal(formats.friendlyNumber(1234000, 3, false), '1,234 mi');
    t.equal(formats.friendlyNumber(1234000, 0, true), 'R$ 1 mi');
    t.equal(formats.friendlyNumber(1234000, 1, true), 'R$ 1,2 mi');
    t.equal(formats.friendlyNumber(1234000, 2, true), 'R$ 1,23 mi');
    t.equal(formats.friendlyNumber(1234000, 3, true), 'R$ 1,234 mi');
    t.equal(formats.friendlyNumber(-1234000, 3, false), '-1,234 mi');
    t.equal(formats.friendlyNumber(0, 3, false), '0');
    t.equal(formats.friendlyNumber(0.9123123424, 2, false), '0,91');
    t.equal(formats.friendlyNumber(0.9123123424, 2, true), 'R$ 0,91');
    t.end();
});

test('\nformats.friendlyBetweenDates', t => {
    t.equal(formats.friendlyBetweenDates('2019-06-24T14:05:20.000Z', '2025-12-31T14:05:20.000Z'), '6 anos e 6 meses');
    t.equal(formats.friendlyBetweenDates('2019-06-24T14:05:20.000Z', '2022-10-30T14:05:20.000Z'), '3 anos e 4 meses');
    t.equal(formats.friendlyBetweenDates('2019-06-24T14:05:20.000Z', '2021-06-24T14:05:20.000Z'), '2 anos');
    t.equal(formats.friendlyBetweenDates('2019-06-24T14:05:20.000Z', '2020-06-24T14:05:20.000Z'), 'um ano');
    t.equal(formats.friendlyBetweenDates('2019-06-24T14:05:20.000Z', '2019-12-24T14:05:20.000Z'), '6 meses');
    t.equal(formats.friendlyBetweenDates('2019-02-28T14:05:20.000Z', '2019-03-28T14:05:20.000Z'), 'um mês');

    t.equal(formats.friendlyBetweenDates('2019-02-28T14:05:20.000Z', '2019-03-05T14:05:20.000Z'), '5 dias');

    t.equal(formats.friendlyBetweenDates('2019-06-24T14:05:20.000Z', '2019-06-29T14:05:20.000Z'), '5 dias');

    t.equal(formats.friendlyBetweenDates('2019-06-24T14:05:20.000Z', '2019-06-25T14:05:20.000Z'), 'um dia');

    t.equal(formats.friendlyBetweenDates('2019-06-24T14:05:20.000Z', '2019-06-24T14:05:20.000Z'), '');

    t.end();
});

test('\nformats.friendlyDate', t => {
    t.equal(formats.friendlyDate(8), '8 dias');
    t.equal(formats.friendlyDate(365), 'um ano');
    t.equal(formats.friendlyDate(366), 'um ano e um dia');
    t.equal(formats.friendlyDate(370), 'um ano e 5 dias');
    t.equal(formats.friendlyDate(430), 'um ano e 2 meses');
    t.equal(formats.friendlyDate(770), '2 anos e um mês');
    t.equal(formats.friendlyDate(800), '2 anos e 2 meses');
    //@ts-ignore
    t.equal(formats.friendlyDate('d'), '');
    t.equal(formats.friendlyDate(null), '');
    t.end();
});

test('\nformats.duration', t => {
    t.equal(formats.duration(100), 'poucos segundos');
    t.equal(formats.duration(1000), 'poucos segundos');
    t.equal(formats.duration(30000), 'poucos segundos');
    t.equal(formats.duration(59999), 'um minuto');
    t.equal(formats.duration(60000), 'um minuto');
    t.equal(formats.duration(3600000), 'uma hora');
    t.equal(formats.duration(86400000), 'um dia');
    t.end();
});
