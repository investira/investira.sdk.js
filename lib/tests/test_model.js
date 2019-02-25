const dataModel = require('../hofs/dataModel');
const xA = {
    campo_string: { type: 'string' },
    campo_number: { type: 'number' },
    campo: {},
    campo_json: { type: 'json' },
    campo_data: { type: 'date' }
};
const xB = {
    campo_string: 'dado1',
    campo_number: 2,
    campo_novo: 'dado3',
    campo_json:
        '{"username":"teste@gmail.com","name_first":"teste","name_middle":null,"name_last":"novo","password":"teste123"}',
    campo_data: '05/09/1968'
};
const xModelA = dataModel(xA, { convert: true });
//TODO: teste se datamodel já um datamodel
// const xModelB = dataModel(xModelA);
Object.assign(xModelA, xB);
// console.log(xModelA.campo_string);
// console.log(xModelA.campo_number);
// console.log(xModelA.campo);
// console.log(xModelA.campo_json);
console.log(xModelA);
// console.log(Object.keys(xB));
