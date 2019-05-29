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
const arrayString = ['A', 'D', 'G', 'J', 'K', 'N', 'Q', 'T', 'W', 'Z'];

test('\narrays goalSeekDate', t => {
    //O mais perto
    t.equal(arrays.seek(arrayNumber, 30), 30);
    //O anterior mais perto
    t.equal(arrays.seek(arrayNumber, 30, false), 30);
    //O próximo mais perto
    t.equal(arrays.seek(arrayNumber, 30, true), 30);

    //O mais perto
    t.equal(arrays.seek(arrayNumber, 31), 30);
    //O anterior mais perto
    t.equal(arrays.seek(arrayNumber, 31, false), 30);
    //O próximo mais perto
    t.equal(arrays.seek(arrayNumber, 31, true), 40);

    //O mais perto
    t.equal(arrays.seek(arrayNumber, 29), 30);
    //O anterior mais perto
    t.equal(arrays.seek(arrayNumber, 29, false), 20);
    //O próximo mais perto
    t.equal(arrays.seek(arrayNumber, 29, true), 30);

    //O próximo mais perto
    t.equal(arrays.seek(arrayNumber, 1000), 90);
    //O anterior mais perto
    t.equal(arrays.seek(arrayNumber, 1000, false), 90);
    //O próximo mais perto
    t.equal(arrays.seek(arrayNumber, 1000, true), 90);

    //O próximo mais perto
    t.equal(arrays.seek(arrayNumber, -1000), 0);
    //O anterior mais perto
    t.equal(arrays.seek(arrayNumber, -1000, false), 0);
    //O próximo mais perto
    t.equal(arrays.seek(arrayNumber, -1000, true), 0);
    t.end();
});

test('\narrays goalSeekNumber', t => {
    //O mais perto
    t.equal(
        dates.compare(
            arrays.seek(arrayDate, new Date('2000-05-15')),
            new Date('2000-05-01')
        ),
        true
    );
    //O anterior mais próximo
    t.equal(
        dates.compare(
            arrays.seek(arrayDate, new Date('2000-05-15'), false),
            new Date('2000-05-01')
        ),
        true
    );
    //O posterior mais próximo
    t.equal(
        dates.compare(
            arrays.seek(arrayDate, new Date('2000-05-15'), true),
            new Date('2000-06-01')
        ),
        true
    );

    //O mais perto
    t.equal(
        dates.compare(
            arrays.seek(arrayDate, new Date('2010-05-15')),
            new Date('2000-10-01')
        ),
        true
    );
    //O anterior mais próximo
    t.equal(
        dates.compare(
            arrays.seek(arrayDate, new Date('2010-05-15'), false),
            new Date('2000-10-01')
        ),
        true
    );
    //O posterior mais próximo
    t.equal(
        dates.compare(
            arrays.seek(arrayDate, new Date('2010-05-15'), true),
            new Date('2000-10-01')
        ),
        true
    );

    //O mais perto
    t.equal(
        dates.compare(
            arrays.seek(arrayDate, new Date('1999-05-15')),
            new Date('2000-01-01')
        ),
        true
    );
    //O anterior mais próximo
    t.equal(
        dates.compare(
            arrays.seek(arrayDate, new Date('1999-05-15'), false),
            new Date('2000-01-01')
        ),
        true
    );
    //O posterior mais próximo
    t.equal(
        dates.compare(
            arrays.seek(arrayDate, new Date('1999-05-15'), true),
            new Date('2000-01-01')
        ),
        true
    );
    t.end();
});
