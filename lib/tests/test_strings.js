const test = require('tape');

const strings = require('../utils/strings');

test('\nsplitFullName', t => {
    t.deepEqual(
        strings.splitFullName('Robert Mariano de faria silva e souza'),
        {
            first: 'Robert',
            middle: 'Mariano de Faria Silva e',
            last: 'Souza'
        }
    );
    t.deepEqual(strings.splitFullName('Investira Soluções'), {
        first: 'Investira',
        middle: null,
        last: 'Soluções'
    });
    t.end();
});

test('\ntoTitleCase', t => {
    t.deepEqual(
        strings.toTitleCase('Robert mariano de faria silva e souza'),
        'Robert Mariano de Faria Silva e Souza'
    );
    t.deepEqual(
        strings.toTitleCase('Investira soluções'),
        'Investira Soluções'
    );
    t.deepEqual(
        strings.toTitleCase('maRtin lutHer king III'),
        'Martin Luther King III'
    );
    t.deepEqual(
        strings.toTitleCase('maRtin lutHer king iv'),
        'Martin Luther King IV'
    );
    t.deepEqual(
        strings.toTitleCase('josé alberto de andrade ávila'),
        'José Alberto de Andrade Ávila'
    );
    t.end();
});
