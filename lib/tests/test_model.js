const dataModel = require('../hofs/dataModel');
const xA = {
    campo_string: { type: 'string' },
    campo_number: { type: 'number' },
    campo: {},
    campo_json: { type: 'json' },
    campo_data: { type: 'date' },
};
const xB = {
    // campo_string: 'dado1',
    campo_number: '2',
    campo_novo: 'dado3',
    campo_json:
        '{"username":"campeao.avila@gmail.com","name_first":"José Alberto","name_middle":null,"name_last":"Ávila","password":"teste123","cpf":null,"cnpj":null,"type":"us","phone":null,"mobile":null}',
    campo_data: '05/09/1968',
};
const xModelA = dataModel(xA);
const xModelB = dataModel(xModelA);
Object.assign(xModelA, xB);
// console.log(xModelA.campo_string);
// console.log(xModelA.campo_number);
// console.log(xModelA.campo);
// console.log(xModelA.campo_json);
console.log(xModelA);
// console.log(Object.keys(xB));
