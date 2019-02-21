const dataModel = require('../hofs/dataModel');

// const responseModel = {
//     messages: { type: 'array', value: [] },
//     values: { type: 'array', value: [] }
// };

// module.exports = function() {
//     return new dataModel(responseModel, {
//         strict: true,
//         convert: false
//     });
// };

module.exports = function() {
    return new dataModel(
        {
            error: { type: 'object' },
            data: { type: 'object' },
            metadata: { type: 'object' },
            pages: { type: 'object' },
            includes: { type: 'object' }
        },
        {
            strict: true,
            convert: false
        }
    );
};
