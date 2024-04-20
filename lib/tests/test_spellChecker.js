const test = require('tape');

const spellChecker = require('../utils/spellChecker');

spellChecker.locale = 'br';
test('\ncheck', t => {
    t.equal(spellChecker.check('Volnor Industria E Comercio Sa'), 'Volnor Indústria e Comércio S.A.');
    t.equal(
        spellChecker.check('Viver Incorp. E Construtora S.a.- Em Recuperação Judicial'),
        'Viver Incorp. e Construtora S.A. em Recuperação Judicial'
    );
    t.equal(
        spellChecker.check('Xx De Novembro Investimentos E Participações S.a'),
        'XX de Novembro Investimentos e Participações S.A.'
    );
    t.equal(
        spellChecker.check('Banco Do Estado De Sao Paulo S.a. - Banespa'),
        'Banco do Estado de São Paulo S.A. - Banespa'
    );
    t.equal(spellChecker.check('Sperb Do Ne Sa Ind Textil'), 'Sperb do Ne S.A. Indústria Têxtil');
    t.equal(
        spellChecker.check('São Carlos Empreends E Participações S.a'),
        'São Carlos Empreendimentos e Participações S.A.'
    );
    t.equal(spellChecker.check('Inds De Bebs Joaquim T A F Sa'), 'Indústria de Bebidas Joaquim T A F S.A.');
    t.equal(
        spellChecker.check('Cia Indl Schlosser Sa - Em Recuperação Judicial'),
        'Cia Industrial Schlosser S.A. - em Recuperação Judicial'
    );
    t.end();
});
