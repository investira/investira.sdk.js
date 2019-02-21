const dataModel = require('../hofs/dataModel');

// const responseModel = {
//     messages: { type: 'array', value: [] },
//     values: { type: 'array', value: [] }
// };

// function responseModel() {
//     this.messages = { type: 'array', value: [] };
//     this.values = { type: 'array', value: [] };
//     // this.name = function() {return this.firstName + " " + this.lastName;};
// }

class responseModel {
    constructor() {
        this.messages = { type: 'array', value: [] };
        this.values = { type: 'array', value: [] };
    }
}

// class responseModel {
//     // messages = { type: 'array', value: [] };
//     // values = { type: 'array', value: [] };
//     constructor() {
//         Object.assign(
//             this,
//             new dataModel(
//                 {
//                     messages: { type: 'array', value: [] },
//                     values: { type: 'array', value: [] }
//                 },
//                 {
//                     strict: true,
//                     convert: false
//                 }
//             )
//         );
//     }
// }

// module.exports = dataModel(new responseModel, {
//     strict: true,
//     convert: false
// });
module.exports = responseModel;
