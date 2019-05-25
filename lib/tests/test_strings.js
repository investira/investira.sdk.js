const test = require('tape');

const strings = require('../utils/strings');

test('\nfriendlyNumber', t => {
    t.deepEqual(
        strings.splitFullName('Robert Mariano de faria silva e souza'),
        {
            first: 'Robert',
            middle: 'Mariano de Faria Silva e',
            last: 'Souza'
        }
    );
    t.end();
});
