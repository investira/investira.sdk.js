const test = require('tape');

const strings = require('../utils/strings');

console.log(strings.splitFullName('Ricardo Mariano de faria silva e souza'));
test('\nfriendlyNumber', t => {
    t.equal(strings.splitFullName('Ricardo Mariano de faria silva e souza'), {
        first: 'Ricardo',
        middle: 'Mariano de Faria Silva e',
        last: 'Souza'
    });
    t.end();
});
