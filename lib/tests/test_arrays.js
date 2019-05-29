const test = require('tape');
const arrays = require('../utils/arrays');
const dates = require('../utils/dates');
const arrayNumber = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
const arrayDate = [
    new Date('2000-01-01'),
    new Date('2000-02-01'),
    new Date('2000-03-01'),
    new Date('2000-04-01'),
    new Date('2000-05-01'),
    new Date('2000-06-01'),
    new Date('2000-07-01'),
    new Date('2000-08-01'),
    new Date('2000-09-01'),
    new Date('2000-10-01')
];
const arrayDateString = [
    '2000-01-01',
    '2000-02-01',
    '2000-03-01',
    '2000-04-01',
    '2000-05-01',
    '2000-06-01',
    '2000-07-01',
    '2000-08-01',
    '2000-09-01',
    '2000-10-01'
];
const arrayString = ['A', 'D', 'G', 'J', 'K', 'N', 'Q', 'T', 'W', 'Z'];

test('\narrays seek number', t => {
    //O mais próximo
    t.equal(arrays.seek(arrayNumber, 30), arrayNumber.indexOf(30));
    //O anterior mais próximo
    t.equal(arrays.seek(arrayNumber, 30, false), arrayNumber.indexOf(30));
    //O posterior mais próximo
    t.equal(arrays.seek(arrayNumber, 30, true), arrayNumber.indexOf(30));

    //O mais próximo
    t.equal(arrays.seek(arrayNumber, 31), arrayNumber.indexOf(30));
    //O anterior mais próximo
    t.equal(arrays.seek(arrayNumber, 31, false), arrayNumber.indexOf(30));
    //O posterior mais próximo
    t.equal(arrays.seek(arrayNumber, 31, true), arrayNumber.indexOf(40));

    //O mais próximo
    t.equal(arrays.seek(arrayNumber, 29), arrayNumber.indexOf(30));
    //O anterior mais próximo
    t.equal(arrays.seek(arrayNumber, 29, false), arrayNumber.indexOf(20));
    //O posterior mais próximo
    t.equal(arrays.seek(arrayNumber, 29, true), arrayNumber.indexOf(30));

    //O posterior mais próximo
    t.equal(arrays.seek(arrayNumber, 1000), arrayNumber.indexOf(90));
    //O anterior mais próximo
    t.equal(arrays.seek(arrayNumber, 1000, false), arrayNumber.indexOf(90));
    //O posterior mais próximo
    t.equal(arrays.seek(arrayNumber, 1000, true), arrayNumber.indexOf(90));

    //O posterior mais próximo
    t.equal(arrays.seek(arrayNumber, -1000), arrayNumber.indexOf(0));
    //O anterior mais próximo
    t.equal(arrays.seek(arrayNumber, -1000, false), arrayNumber.indexOf(0));
    //O posterior mais próximo
    t.equal(arrays.seek(arrayNumber, -1000, true), arrayNumber.indexOf(0));
    t.end();
});

test('\narrays seek date', t => {
    //O mais próximo
    t.equal(arrays.seek(arrayDate, new Date('2000-05-15')), 4);
    //O anterior mais próximo
    t.equal(arrays.seek(arrayDate, new Date('2000-05-15'), false), 4);
    //O posterior mais próximo
    t.equal(arrays.seek(arrayDate, new Date('2000-05-15'), true), 5);

    //O mais próximo
    t.equal(arrays.seek(arrayDate, new Date('2010-05-15')), 9);
    //O anterior mais próximo
    t.equal(arrays.seek(arrayDate, new Date('2010-05-15'), false), 9);
    //O posterior mais próximo
    t.equal(arrays.seek(arrayDate, new Date('2010-05-15'), true), 9);

    //O mais próximo
    t.equal(arrays.seek(arrayDate, new Date('1999-05-15')), 0);
    //O anterior mais próximo
    t.equal(arrays.seek(arrayDate, new Date('1999-05-15'), false), 0);
    //O posterior mais próximo
    t.equal(arrays.seek(arrayDate, new Date('1999-05-15'), true), 0);
    t.end();
});

test('\narrays seek date string', t => {
    //O mais próximo
    t.equal(
        arrays.seekDate(arrayDateString, '2000-05-15'),
        arrayDateString.indexOf('2000-05-01')
    );
    // //O anterior mais próximo
    t.equal(
        arrays.seekDate(arrayDateString, '2000-05-15', false),
        arrayDateString.indexOf('2000-05-01')
    );
    //O posterior mais próximo
    t.equal(
        arrays.seekDate(arrayDateString, '2000-05-15', true),
        arrayDateString.indexOf('2000-06-01')
    );

    //O mais próximo
    t.equal(
        arrays.seekDate(arrayDateString, '2010-05-15'),
        arrayDateString.indexOf('2000-10-01')
    );
    //O anterior mais próximo
    t.equal(
        arrays.seekDate(arrayDateString, '2010-05-15', false),
        arrayDateString.indexOf('2000-10-01')
    );
    //O posterior mais próximo
    t.equal(
        arrays.seekDate(arrayDateString, '2010-05-15', true),
        arrayDateString.indexOf('2000-10-01')
    );

    //O mais próximo
    t.equal(
        arrays.seekDate(arrayDateString, '1999-05-15'),
        arrayDateString.indexOf('2000-01-01')
    );
    //O anterior mais próximo
    t.equal(
        arrays.seekDate(arrayDateString, '1999-05-15', false),
        arrayDateString.indexOf('2000-01-01')
    );
    //O posterior mais próximo
    t.equal(
        arrays.seekDate(arrayDateString, '1999-05-15', true),
        arrayDateString.indexOf('2000-01-01')
    );
    t.end();
});
