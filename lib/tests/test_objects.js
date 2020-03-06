const test = require('tape');
const objects = require('../utils/objects');
const object = {
    nome: 'investira',
    endereco: {
        logradouro: 'Praia de Botafogo',
        numero: 501
    },
    telefone: '(21) 2586-6322'
};

test('\ngetSize', t => {
    const xObject = { ...object };
    t.equal(objects.getSize(xObject), 3);
    t.end();
});
