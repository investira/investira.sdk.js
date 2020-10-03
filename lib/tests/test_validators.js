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

test('\nvalidators.isTrue', t => {
    t.equal(validators.isTrue('1'), true);
    t.equal(validators.isTrue('-1'), true);
    t.equal(validators.isTrue(-1), true);
    t.equal(validators.isTrue(1), true);
    t.equal(validators.isTrue(true), true);
    t.equal(validators.isTrue('true'), true);
    t.equal(validators.isTrue('True'), true);
    t.equal(validators.isTrue(2), false);
    t.equal(validators.isTrue(), false);
    t.equal(validators.isTrue(null), false);
    t.equal(validators.isTrue(0), false);
    t.equal(validators.isTrue('0'), false);
    t.equal(validators.isTrue({}), false);
    t.equal(validators.isTrue(undefined), false);
    t.equal(validators.isTrue('-12'), false);
    t.equal(validators.isTrue('false'), false);
    t.equal(validators.isTrue(false), false);
    t.end();
});

test('\nvalidators.isNumber', t => {
    t.equal(validators.isNumber(1), true);
    t.equal(validators.isNumber(-1), true);
    t.equal(validators.isNumber(0), true);
    t.equal(validators.isNumber('1'), false);
    t.equal(validators.isNumber('-1'), false);
    t.equal(validators.isNumber(1.5), true);
    t.equal(validators.isNumber('1.5'), false);
    t.equal(validators.isNumber('1,5'), false);
    t.equal(validators.isNumber(NaN), false);
    t.end();
});