function message(pLevel, pCode, pText) {
    this.level = pLevel;
    this.code = pCode;
    this.text = pText;
}

const dataModel = require('../hofs/dataModel');

module.exports = function(pCode = 500, pText = '', pStack = {}) {
    const TESTE = ['Abc', 'xpy'];
    return new dataModel(
        {
            code: { type: 'number', value: pCode },
            text: { type: 'string', value: pText },
            stack: { type: 'array', value: [] }
        },
        {
            strict: true,
            convert: false
        }
    );
};
