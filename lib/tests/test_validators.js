const test = require('tape');

const validators = require('../utils/validators');

test('\nvalidators.isEmail', t => {
    t.equal(validators.isEmail('12345678'), false);
    t.equal(validators.isEmail('1234@5678'), false);
    t.equal(validators.isEmail('1234@5678.'), false);
    t.equal(validators.isEmail('1234@5678.v'), false);
    t.equal(validators.isEmail('1234@5678.vc'), true);
    t.equal(validators.isEmail('1234@5678.us'), true);
    t.equal(validators.isEmail('123@asdocm.com.br'), true);
    t.equal(validators.isEmail('wedweasdocm.com.br'), false);
    t.end();
});
