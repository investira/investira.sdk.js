const test = require('tape');

const strings = require('../utils/strings');

test('\nsplitFullName', t => {
    t.deepEqual(strings.splitFullName('Robert Mariano de faria silva e souza'), {
        first: 'Robert',
        middle: 'Mariano de Faria Silva e',
        last: 'Souza'
    });
    t.deepEqual(strings.splitFullName('Investira Soluções'), {
        first: 'Investira',
        middle: null,
        last: 'Soluções'
    });
    t.end();
});

test('\nquerystringToObject', t => {
    t.deepEqual(strings.querystringToObject('api/v1/metas/?meta_status=A,I,R&page=1&size=8'), {
        meta_status: 'A,I,R',
        page: '1',
        size: '8'
    });
    t.end();
});

test('\ntoTitleCase', t => {
    t.deepEqual(strings.toTitleCase('Robert mariano de faria silva e souza'), 'Robert Mariano de Faria Silva e Souza');
    t.deepEqual(strings.toTitleCase('Investira soluções'), 'Investira Soluções');
    t.deepEqual(strings.toTitleCase('maRtin lutHer king III'), 'Martin Luther King III');
    t.deepEqual(strings.toTitleCase('maRtin lutHer king iv'), 'Martin Luther King IV');
    t.deepEqual(strings.toTitleCase('joão adalberto da silva álves'), 'João Adalberto da Silva Álves');
    t.end();
});

test('\nwhitespacesCleaner', t => {
    t.deepEqual(
        strings.whitespacesCleaner(' Robert     mariano de     faria  silva e  souza '),
        'Robert mariano de faria silva e souza'
    );
    t.end();
});
