const dataModel = require('../hofs/dataModel');

module.exports = function(pCode = 500, pText = '', pStack = []) {
    //@ts-ignore
    return new dataModel(
        {
            code: { type: 'number', value: pCode },
            text: { type: 'string', value: pText },
            stack: { type: 'array', value: pStack }
        },
        {
            strict: true,
            convert: false
        }
    );
};
