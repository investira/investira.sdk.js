const { stringify } = require('flatted');
const { isString, isEmpty } = require('./validators');
//@ts-ignore
const { toArray } = require('./arrays');

const { InvalidData } = require('../messages/DataErrors');

/**
 * Estrutura retornada pela separação de nome completo.
 *
 * @typedef {object} SplitFullNameResult
 * @property {string} first Primeiro nome já formatado.
 * @property {string|null} middle Nomes intermediários já formatados.
 * @property {string} last Último nome já formatado.
 */

const toTitleCaseIgnore = [
    'de',
    'da',
    'do',
    'd',
    'a',
    'as',
    'e',
    'os',
    'o',
    'aos',
    'ao',
    'a',
    'of',
    'até',
    'para',
    'sobre',
    'sob',
    'em',
    'como',
    'for',
    'and'
];
const toTitleCaseFullUpperCase = [
    'i',
    'ii',
    'iii',
    'iv',
    'v',
    'vi',
    'vii',
    'viii',
    'ix',
    'x',
    'xi',
    'xii',
    'xiii',
    'xiv',
    'xv',
    'xvi',
    'xvii',
    'xviii',
    'xix',
    'xx'
];

const toTitleCaseSeparators = ["'", '`', '.', '-', '(', ')', ':', ',', ';', '\\', '/'];

/**
 * Utilitários para tratamento e formatação de strings.
 *
 * O módulo concentra operações simples de normalização textual, serialização
 * e preparação de conteúdo para buscas, HTML e expressões regulares.
 */
const strings = {
    /**
     * Substitui a ocorrência de uma string por outra
     *
     * @param {string} pSource String origem
     * @param {string} pOld String antiga
     * @param {string} pNew String nova
     * @returns {string} String com todas as ocorrências substituídas.
     */
    replaceAll: (pSource, pOld, pNew) => {
        if (!isString(pSource)) {
            return pSource;
        }
        return pSource.replace(new RegExp(strings.escapeRegExp(pOld), 'g'), pNew);
    },

    /**
     * Escapa caracteres especiais em uma string para uso em expressões regulares
     *
     * @param {string} pSource Texto que será usado em uma expressão regular.
     * @returns {string} Texto com os caracteres especiais escapados.
     */
    escapeRegExp: pSource => {
        return pSource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    /**
     * Escapa caracteres especiais para uso seguro em HTML.
     *
     * Converte os caracteres `&`, `<`, `>`, `"` e `'` para suas entidades HTML.
     *
     * @param {string} pValue Texto original.
     * @returns {string} Texto seguro para interpolação em HTML.
     */
    escapeHtml: pValue => {
        return String(pValue || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    /**
     * Converte um valor para string com trim, retornando um valor padrão se o valor for null ou undefined
     *
     * @param {*} pValue Valor a ser convertido.
     * @param {*} pNullValue Valor de retorno quando `pValue` for `null` ou `undefined`.
     * @returns {string}
     */
    toString: (pValue, pNullValue = null) => {
        if (pValue === null || pValue === undefined) {
            return pNullValue;
        }
        return String(pValue).trim();
    },

    /**
     * Remove primeiro e último caracter da string
     *
     * @param {string} pString
     * @returns {string} String sem o primeiro e o último caractere.
     */
    removeEnclosure: pString => {
        if (!isString(pString)) {
            throw new InvalidData('[string.removeEnclosure] is not a string [' + JSON.stringify(pString) + ']');
        }
        if (pString.length < 2) {
            return pString;
        }
        return pString.slice(1, -1);
    },
    /**
     * Retorna objeto contendo as partes do nome já formatadas como nome próprio.
     *
     * Quando houver apenas dois nomes, `middle` será `null`.
     *
     * @param {string} pFullName Nome completo a ser dividido.
     * @returns {SplitFullNameResult}
     */
    splitFullName: pFullName => {
        let xName = {
            first: '',
            middle: '',
            last: ''
        };
        if (isEmpty(pFullName)) {
            return xName;
        }
        if (!isString(pFullName)) {
            throw new InvalidData('[string.splitFullName] is not a string [' + JSON.stringify(pFullName) + ']');
        }
        let xSplit = strings.toTitleCase(pFullName).split(' ');
        if (xSplit.length >= 1) {
            xName.first = xSplit[0];
            xSplit.shift();
        }
        if (xSplit.length >= 2) {
            xName.last = xSplit[xSplit.length - 1];
            xSplit.pop();
            xName.middle = xSplit.join(' ');
        } else if (xSplit.length >= 1) {
            xName.last = xSplit[0];
            xName.middle = null;
        }
        return xName;
    },

    /**
     * Retorna uma string formatada como nome próprio.
     *
     * A primeira letra de cada palavra fica em maiúscula e as demais em minúscula,
     * preservando palavras especiais em caixa alta e conectivos comuns em minúsculo.
     *
     * @param {string} pString Texto a ser formatado.
     * @returns {string}
     */
    toTitleCase: pString => {
        if (isEmpty(pString)) {
            return pString;
        }
        if (!isString(pString)) {
            throw new InvalidData('[string.toTitleCase] is not a string [' + JSON.stringify(pString) + ']');
        }
        let xString = pvtoTitleCase(pString);
        for (const xSepatator of toTitleCaseSeparators) {
            xString = pvtoTitleCase(xString, xSepatator);
        }
        return xString;
    },
    /**
     * Converte a querystring de uma URL em objeto simples.
     *
     * Considera apenas o trecho após `?` e não faz tratamento para chaves repetidas.
     *
     * @param {string} pString URL ou querystring completa.
     * @returns {object} Objeto no formato `{ chave: valor }`.
     */
    querystringToObject: pString => {
        if (isEmpty(pString)) {
            return {};
        }
        if (!isString(pString)) {
            throw new InvalidData('[strings.querystringToObject] is not a string [' + JSON.stringify(pString) + ']');
        }

        const xQueryParams = decodeURI(pString).split('?')[1].split('&');
        let xParams = {};

        xQueryParams.forEach(pParam => {
            const xParam = pParam.split('=');
            xParams[xParam[0]] = xParam[1];
        });

        return xParams;
    },

    /**
     * Retorna a string sem espaços no início e fim e sem múltiplos espaços internos.
     *
     * @param {string} pString Texto original.
     * @returns {string}
     */
    whitespacesCleaner: pString => {
        if (isEmpty(pString)) {
            return pString;
        }
        return pString.trim().replace(/\s+/g, ' ');
    },

    /**
     * Retorna somente caracteres alfabéticos e espaços.
     *
     * Remove números, pontuação, acentos não ASCII e normaliza os espaços.
     *
     * @param {string} pString Texto original.
     * @return {string}
     */
    onlyAlphas: pString => {
        if (!pString) {
            return null;
        }
        return pString
            .replace(/[^a-zA-Z\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    },

    /**
     * Retorna array com palavras ou frases para serem utlizadas em condição LIKE.
     * Frases devem ser separadas por vígula.
     * ex:
     * - "abc def" = ['%abc%','%def%']
     * - "abc def," = ['%abc def%']
     * - "abc def,ghi" = ['%abc def%','%ghi%']
     *
     * @param {string} pString Texto que será convertido.
     * @returns {Array} Array preparado para uso em filtros `LIKE`.
     */
    stringToQuery: pString => {
        return toArray(pString, ',', '%', '%');
    },

    /**
     * Retorna `stringify` resiliente para objetos com referências circulares.
     *
     * @param {object} pValue Valor a ser serializado.
     * @param {object} pReplacer Função ou mapa de substituição.
     * @param {number} pSpace Quantidade de espaços usada na identação.
     * @returns {string}
     */
    stringify: (pValue, pReplacer, pSpace) => {
        return stringify(pValue, pReplacer, pSpace);
    },

    /**
     * Junta palavras com separador padrão e separador específico para o último item.
     *
     * Exemplo: `['A', 'B', 'C']` resulta em `A, B e C`.
     *
     * @param {Array} pWords Lista de palavras.
     * @param {string} [pSeparator=', ']
     * @param {string} [pLastSeparator=' e ']
     * @returns {String}
     */
    joinWords: (pWords, pSeparator = ', ', pLastSeparator = ' e ') => {
        if (!Array.isArray(pWords) || pWords.length === 0) {
            return '';
        }
        if (pWords.length === 1) {
            return pWords[0];
        }
        const xAllTheRest = pWords.slice(0, -1);
        const xLastWord = pWords[pWords.length - 1];
        return xAllTheRest.join(pSeparator) + (pLastSeparator || ' ') + xLastWord;
    }
};

module.exports = strings;

/**
 * Formata uma string como nome próprio considerando um separador específico.
 *
 * Quando `pSplit` não é informado, a string base é convertida para minúsculas
 * antes da aplicação das regras de capitalização.
 *
 * @param {string} pString A string a ser formatada.
 * @param {string} [pSplit=' '] Separador utilizado para dividir a string.
 * @returns {string} String formatada como nome próprio.
 */
const pvtoTitleCase = (pString, pSplit) => {
    // No fluxo principal, normalizamos a base para minúsculas antes de reaplicar as regras.
    if (!pSplit) {
        pSplit = ' ';
        pString = pString.toLocaleLowerCase();
    }
    // Separa a primeira palavra para garantir capitalização do início da frase.
    const xPalavras = pString.split(pSplit);
    const xPrimeira = xPalavras.shift();
    // Aplica regras especiais para conectivos e numerais romanos.
    const xPalavrasFormatadas = xPalavras.map(pWord => {
        if (pSplit === ' ' && toTitleCaseIgnore.includes(pWord)) {
            // Mantém conectivos comuns em minúsculas quando usados entre palavras.
            return pWord;
        } else if (toTitleCaseFullUpperCase.includes(pWord)) {
            // Mantém numerais romanos e siglas curtas em caixa alta.
            return pWord.toUpperCase();
        } else {
            // Regra padrão de capitalização.
            return pWord.charAt(0).toUpperCase() + pWord.slice(1);
        }
    });
    // Recompõe a string final usando o mesmo separador informado.
    return [xPrimeira.charAt(0).toUpperCase() + xPrimeira.slice(1), ...xPalavrasFormatadas].join(pSplit);
};
