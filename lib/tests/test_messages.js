const test = require('tape');

const { CreatedMessage } = require('../messages/Success');
const { BasicMessageSuccess } = require('../messages/BasicMessages');

console.log(new CreatedMessage() instanceof BasicMessageSuccess);

test('\nmessage', t => {
    t.equal(new CreatedMessage() instanceof BasicMessageSuccess, true);
    t.end();
});
