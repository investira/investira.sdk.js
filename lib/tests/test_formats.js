const test = require('tape');

const formats = require('../utils/formats');
formats.LOCALE = 'pt-BR';
formats.CURRENCY = 'BRL'; //'EUR';

// test('\nfriendlyNumber', t => {
//     t.equal(formats.friendlyNumber(123, 0, true), 'R$123');
//     t.equal(formats.friendlyNumber(123, 0, false), '123');
//     t.equal(formats.friendlyNumber(123, 0, true), 'R$123');
//     t.equal(formats.friendlyNumber(123, 0, false), '123');
//     t.equal(formats.friendlyNumber(1234567, 0, false), '1 mi');
//     t.equal(formats.friendlyNumber(1234567, 1, false), '1.2 mi');
//     t.equal(formats.friendlyNumber(1234567, 2, false), '1.23 mi');
//     t.equal(formats.friendlyNumber(1234567, 3, false), '1.235 mi');
//     t.equal(formats.friendlyNumber(1234000, 0, false), '1 mi');
//     t.equal(formats.friendlyNumber(1234000, 1, false), '1.2 mi');
//     t.equal(formats.friendlyNumber(1234000, 2, false), '1.23 mi');
//     t.equal(formats.friendlyNumber(1234000, 3, false), '1.234 mi');
//     t.equal(formats.friendlyNumber(1234000, 0, true), 'R$1 mi');
//     t.equal(formats.friendlyNumber(1234000, 1, true), 'R$1.2 mi');
//     t.equal(formats.friendlyNumber(1234000, 2, true), 'R$1.23 mi');
//     t.equal(formats.friendlyNumber(1234000, 3, true), 'R$1.234 mi');
//     t.equal(formats.friendlyNumber(-1234000, 3, false), '-1.234 mi');
//     t.equal(formats.friendlyNumber(0, 3, false), '0');
//     t.equal(formats.friendlyNumber(0.9123123424, 2, false), '0.91');
//     t.equal(formats.friendlyNumber(0.9123123424, 2, true), 'R$0.91');
//     t.end();
// });

test('\nformats.friendlyBetweenDates', t => {
    t.equal(
        formats.friendlyBetweenDates(
            '2019-06-24T14:05:20.000Z',
            '2025-12-31T14:05:20.000Z'
        ),
        '6 anos e 6 meses'
    );
    t.equal(
        formats.friendlyBetweenDates(
            '2019-06-24T14:05:20.000Z',
            '2022-10-30T14:05:20.000Z'
        ),
        '3 anos e 4 meses'
    );
    t.equal(
        formats.friendlyBetweenDates(
            '2019-06-24T14:05:20.000Z',
            '2021-06-24T14:05:20.000Z'
        ),
        '2 anos'
    );
    t.equal(
        formats.friendlyBetweenDates(
            '2019-06-24T14:05:20.000Z',
            '2020-06-24T14:05:20.000Z'
        ),
        '1 ano'
    );
    t.equal(
        formats.friendlyBetweenDates(
            '2019-06-24T14:05:20.000Z',
            '2019-12-24T14:05:20.000Z'
        ),
        '6 meses e 1 dia'
    );
    t.equal(
        formats.friendlyBetweenDates(
            '2019-02-28T14:05:20.000Z',
            '2019-03-28T14:05:20.000Z'
        ),
        '1 mês'
    );

    t.equal(
        formats.friendlyBetweenDates(
            '2019-02-28T14:05:20.000Z',
            '2019-03-05T14:05:20.000Z'
        ),
        '5 dias'
    );

    t.equal(
        formats.friendlyBetweenDates(
            '2019-06-24T14:05:20.000Z',
            '2019-06-29T14:05:20.000Z'
        ),
        '5 dias'
    );

    t.equal(
        formats.friendlyBetweenDates(
            '2019-06-24T14:05:20.000Z',
            '2019-06-25T14:05:20.000Z'
        ),
        '1 dia'
    );

    t.equal(
        formats.friendlyBetweenDates(
            '2019-06-24T14:05:20.000Z',
            '2019-06-24T14:05:20.000Z'
        ),
        ''
    );

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
