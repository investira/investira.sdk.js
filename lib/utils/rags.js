/**
 * @typedef {Object} RagAliasOptions
 * @property {boolean} [numeric=true] - Ativa aliases derivados de números longos.
 * @property {boolean} [date=true] - Ativa aliases derivados de datas.
 * @property {boolean} [alphanumericCode=true] - Ativa aliases canônicos para códigos com separadores.
 * @property {boolean} [accent=false] - Ativa aliases sem acentuação para tokens acentuados.
 * @property {number} [maxAliases=20] - Limite global de aliases anexados ao texto.
 * @property {number} [maxAlphanumericCodeAliases=8] - Peso proporcional para aliases alfanuméricos.
 * @property {number} [maxDateAliases=8] - Peso proporcional para aliases de datas.
 * @property {number} [maxNumericAliases=8] - Peso proporcional para aliases numéricos.
 * @property {number} [maxAccentAliases=4] - Peso proporcional para aliases sem acento.
 */

/**
 * @typedef {Object} RagAliasGroup
 * @property {string[]} aliases - Aliases normalizados de um tipo.
 * @property {number} limit - Peso proporcional do tipo na lista final.
 */

/**
 * Utilitários para normalização e enriquecimento textual em RAG.
 */
const rags = {
    /**
     * Enriquecimento textual para embedding.
     *
     * Preserva o texto principal e acrescenta uma linha `aliases:` com variações
     * úteis para busca semântica. Os aliases são extraídos por tipo, normalizados
     * sem duplicidade local e mesclados proporcionalmente pelos pesos configurados.
     *
     * Os campos `max*Aliases` por tipo funcionam como pesos de distribuição. Eles
     * ajudam a manter a proporção entre tipos, enquanto `maxAliases` define o
     * limite global final. Quando um tipo acaba, os demais continuam preenchendo o
     * espaço restante em novas passagens.
     *
     * @param {*} pText - Texto base
     * @param {RagAliasOptions} [pOptions] - Opções de extração e distribuição
     * @returns {string} Texto normalizado ou texto normalizado com bloco de aliases
     */
    extractAliases: (pText, pOptions = {}) => {
        // Centraliza os defaults para permitir sobrescrever só o necessário.
        const xOptions = {
            numeric: true,
            date: true,
            alphanumericCode: true,
            accent: false,
            maxAliases: 20,
            maxAlphanumericCodeAliases: 8,
            maxDateAliases: 8,
            maxNumericAliases: 8,
            maxAccentAliases: 4,
            ...pOptions
        };

        // O texto base precisa passar pela mesma normalização dos aliases.
        const xBaseText = rags.clearText(String(pText || ''));
        if (!xBaseText) {
            return '';
        }

        // Mapeia valores já presentes no texto para não repetir no bloco de aliases.
        const xExistingValues = pvExtractExistingValuesFromText(xBaseText);

        // Cada tipo mantém sua própria lista para permitir mesclagem proporcional.
        const xAliasGroups = [];

        /**
         * A ordem dos grupos define o desempate quando dois tipos estão com a
         * mesma taxa de preenchimento proporcional.
         */
        if (xOptions.alphanumericCode) {
            xAliasGroups.push({
                aliases: pvNormalizeAliasList(rags.extractAlphanumericCodeAliases(xBaseText), xBaseText, xExistingValues),
                limit: xOptions.maxAlphanumericCodeAliases
            });
        }

        if (xOptions.date) {
            xAliasGroups.push({
                aliases: pvNormalizeAliasList(rags.extractDateAliases(xBaseText), xBaseText, xExistingValues),
                limit: xOptions.maxDateAliases
            });
        }

        if (xOptions.numeric) {
            xAliasGroups.push({
                aliases: pvNormalizeAliasList(rags.extractNumericAliases(xBaseText), xBaseText, xExistingValues),
                limit: xOptions.maxNumericAliases
            });
        }

        if (xOptions.accent) {
            xAliasGroups.push({
                aliases: pvNormalizeAliasList(rags.extractAccentlessAliases(xBaseText), xBaseText, xExistingValues),
                limit: xOptions.maxAccentAliases
            });
        }

        // A lista final respeita o limite global e remove duplicados entre grupos.
        const xAliases = pvMergeAliasGroupsProportionally(xAliasGroups, xOptions.maxAliases);

        if (!xAliases.length) {
            return xBaseText;
        }

        // Mantém o texto original normalizado como conteúdo principal do embedding.
        return [
            xBaseText,
            '',
            `aliases: ${xAliases.join(' ')}`
        ].join('\n');
    },


    /**
     * Extrai aliases sem acentuação.
     * Útil para aproximar buscas que chegam sem diacríticos, por exemplo
     * `crédito` -> `credito`. Tokens de um caractere são ignorados para evitar
     * aliases com pouco valor semântico.
     *
     * @param {string} pText - Texto base
     * @returns {string[]} Aliases sem acento
     */
    extractAccentlessAliases: (pText) => {
        const xAliases = new Set();

        // Tokeniza palavras/códigos antes de remover acentos para preservar limites.
        const xTokens = String(pText || '').toLocaleLowerCase('pt-BR').match(/[\p{L}\p{N}_/-]+/gu) || [];

        for (const xToken of xTokens) {
            // Se o token não tem marca diacrítica, não há alias a gerar.
            if (!/\p{M}|\p{Diacritic}/u.test(xToken.normalize('NFD'))) {
                continue;
            }

            // NFD separa letra e acento, permitindo remover apenas a marca.
            const xAccentlessToken = xToken
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');

            // Evita aliases vazios, idênticos ou curtos demais.
            if (xAccentlessToken && xAccentlessToken !== xToken && xAccentlessToken.length > 1) {
                xAliases.add(xAccentlessToken);
            }
        }

        return [...xAliases];
    },

    /**
     * Extrai aliases numéricos.
     * Considera números com quatro ou mais dígitos, com ou sem separadores de
     * milhar, e gera a versão apenas com dígitos. Anos isolados entre 1900 e
     * 2199 são ignorados para evitar colisão com aliases de datas.
     *
     * @param {string} pText - Texto base
     * @returns {string[]} Aliases numéricos
     */
    extractNumericAliases: (pText) => {
        const xAliases = new Set();
        const xText = String(pText || '').toLocaleLowerCase('pt-BR');

        // Captura números grandes com separadores de milhar ou sequência contínua.
        const xMatches = xText.matchAll(/\b(?:\d{1,3}(?:[.\s]\d{3})+|\d{4,})\b/g);

        for (const xMatch of xMatches) {
            const xToken = String(xMatch?.[0] || '').trim();

            // A versão canônica remove qualquer pontuação ou espaço.
            const xDigits = xToken.replace(/[^\d]/g, '');
            if (xDigits.length < 4) {
                continue;
            }

            // Anos soltos são tratados pelo extrator de datas, não pelo numérico.
            const xIsIsolatedYear =
                /^\d{4}$/.test(xToken) &&
                Number(xToken) >= 1900 &&
                Number(xToken) <= 2199;

            if (xIsIsolatedYear) {
                continue;
            }

            // Garante busca tanto por número digitado puro quanto por variações.
            xAliases.add(xDigits);

            /*
             * Evita formatar identificadores longos como milhares.
             * Exemplo evitado: 05152025033100031 -> 5.152.025.033.100.031.
             * Mantém útil para valores menores como 5202 -> 5.202.
             */
            if (xDigits.length <= 8) {
                xAliases.add(
                    pvFormatThousandsWithDelimiter(xDigits, '.')
                );
            }
        }
        return [...xAliases];
    },

    /**
     * Extrai aliases de datas.
     * Aceita os formatos `DD/MM/YYYY`, `DD-MM-YYYY`, `DD.MM.YYYY` e equivalentes
     * iniciados por ano. Cada data encontrada é validada antes de gerar aliases.
     *
     * @param {string} pText - Texto base
     * @returns {string[]} Aliases de datas
     */
    extractDateAliases: (pText) => {
        const xAliases = new Set();
        const xText = String(pText || '').toLocaleLowerCase('pt-BR');

        // Datas no padrão brasileiro: DD/MM/YYYY, DD-MM-YYYY ou DD.MM.YYYY.
        for (const xMatch of xText.matchAll(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/g)) {
            pvBuildDateAliasesFromParts({
                day: xMatch?.[1],
                month: xMatch?.[2],
                year: xMatch?.[3]
            }).forEach((pAlias) => xAliases.add(pAlias));
        }

        // Datas iniciadas por ano: YYYY/MM/DD, YYYY-MM-DD ou YYYY.MM.DD.
        for (const xMatch of xText.matchAll(/\b(\d{4})[./-](\d{1,2})[./-](\d{1,2})\b/g)) {
            pvBuildDateAliasesFromParts({
                day: xMatch?.[3],
                month: xMatch?.[2],
                year: xMatch?.[1]
            }).forEach((pAlias) => xAliases.add(pAlias));
        }

        return [...xAliases];
    },

    /**
     * Extrai aliases canônicos para códigos alfanuméricos com separadores.
     * Remove separadores internos de códigos com letras e números, preservando a
     * forma canônica para melhorar busca por identificadores digitados sem
     * pontuação. Quando a forma canônica tem acento, também inclui a versão sem
     * acento.
     *
     * Exemplos:
     * - NTN-B -> ntnb
     * - BOA-FÉ -> boafé
     * - LCI-2029 -> lci2029
     *
     * @param {string} pText - Texto base
     * @returns {string[]} Aliases de códigos
     */
    extractAlphanumericCodeAliases: (pText) => {
        const xAliases = new Set();
        const xText = String(pText || '').toLocaleLowerCase('pt-BR');

        // Busca códigos com ao menos uma letra e algum separador interno.
        const xMatches = xText.matchAll(/(?<![\p{L}\p{N}])(?=[\p{L}\p{N}./-]*\p{L})[\p{L}\p{N}]+(?:[-./][\p{L}\p{N}]+)+(?![\p{L}\p{N}])/gu);
        // const xMatches = xText.matchAll(/\b(?=[\p{L}\p{N}./-]*\p{L})[\p{L}\p{N}]+(?:[-./][\p{L}\p{N}]+)+\b/gu);

        for (const xMatch of xMatches) {
            const xToken = String(xMatch?.[0] || '').trim();

            // Forma canônica: remove separadores comuns sem alterar letras/números.
            const xCanonicalToken = xToken.replace(/[-./]/g, '');

            if (xCanonicalToken && xCanonicalToken !== xToken) {
                xAliases.add(xCanonicalToken);

                // Também permite encontrar códigos com acento digitados sem acento.
                const xAccentlessToken = xCanonicalToken
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');

                if (xAccentlessToken && xAccentlessToken !== xCanonicalToken && xAccentlessToken.length > 1) {
                    xAliases.add(xAccentlessToken);
                }
            }
        }

        return [...xAliases];
    },

    /**
     * Normaliza texto para embedding, RAG e busca semântica.
     * A normalização aplica NFKC, minúsculas em `pt-BR`, remoção de HTML,
     * entidades, caracteres inválidos e espaços excedentes.
     *
     * @param {*} pValue - Texto de entrada
     * @returns {string} Texto normalizado
     */
    clearText: (pValue) => {
        // NFKC aproxima formas Unicode equivalentes antes das demais limpezas.
        const xText = String(pValue || '')
            .normalize('NFKC')
            .toLocaleLowerCase('pt-BR');

        // A ordem remove ruído primeiro e só depois compacta pontuação/espaços.
        return pvNormalizeSpaces(
            pvNormalizePunctuation(
                pvRemoveInvalidChars(
                    pvRemoveHtmlEntities(
                        pvRemoveHtml(xText)
                    )
                )
            )
        );
    }
};

/**
 * Extrai valores já existentes no texto normalizado para evitar repetição
 * desnecessária na lista de aliases.
 *
 * @private
 * @param {string} pText - Texto base normalizado
 * @returns {Set<string>} Valores presentes no texto
 */
const pvExtractExistingValuesFromText = (pText) => {
    const xValues = new Set();
    const xText = String(pText || '').trim();

    if (!xText) {
        return xValues;
    }

    // Guarda o texto completo e também os tokens equivalentes aos formatos de alias.
    xValues.add(xText);
    for (const xToken of xText.match(/[\p{L}\p{N}./-]+/gu) || []) {
        xValues.add(xToken);
    }

    return xValues;
};

/**
 * Normaliza aliases e remove duplicados dentro do próprio tipo.
 * Também descarta aliases vazios ou iguais ao texto base, pois eles não agregam
 * novos termos ao embedding.
 *
 * @private
 * @param {string[]} pAliases - Aliases extraídos
 * @param {string} pBaseText - Texto base normalizado
 * @param {Set<string>} [pExistingValues] - Valores já presentes no texto base
 * @returns {string[]} Aliases normalizados
 */
const pvNormalizeAliasList = (pAliases, pBaseText, pExistingValues = new Set()) => {
    // Set mantém a ordem de inserção e remove duplicados do mesmo tipo.
    const xAliases = new Set();

    for (const xAlias of pAliases || []) {
        const xNormalizedAlias = rags.clearText(xAlias);

        // Aliases vazios, iguais ao texto completo ou já presentes no texto base
        // não ajudam a busca.
        if (
            !xNormalizedAlias ||
            xNormalizedAlias === pBaseText ||
            pExistingValues.has(xNormalizedAlias)
        ) {
            continue;
        }

        xAliases.add(xNormalizedAlias);
    }

    return [...xAliases];
};

/**
 * Mescla grupos de aliases proporcionalmente aos limites de cada tipo.
 * A seleção usa a razão `aliasesIncluidos / pesoDoTipo`: em cada rodada entra o
 * grupo menos preenchido proporcionalmente. Isso permite preencher `maxAliases`
 * com várias passagens, sem concentrar a sobra no primeiro grupo disponível.
 *
 * @private
 * @param {RagAliasGroup[]} pAliasGroups - Grupos de aliases por tipo
 * @param {number} pMaxAliases - Limite global de aliases
 * @returns {string[]} Aliases finais
 */
const pvMergeAliasGroupsProportionally = (pAliasGroups, pMaxAliases) => {
    // Limite inválido vira zero, evitando loops para entradas inesperadas.
    const xMaxAliases = pvNormalizeAliasLimit(pMaxAliases);
    const xAliases = [];
    const xUsedAliases = new Set();

    // Prepara metadados de cursor e peso para cada grupo habilitado.
    const xGroups = (pAliasGroups || [])
        .map((pAliasGroup, pIndex) => {
            const xGroupAliases = Array.isArray(pAliasGroup?.aliases) ? pAliasGroup.aliases : [];
            const xGroupLimit = pvNormalizeAliasLimit(pAliasGroup?.limit);

            return {
                aliases: xGroupAliases,
                added: 0,
                cursor: 0,
                order: pIndex,
                /**
                 * O peso considera o limite configurado e o volume real disponível,
                 * evitando que grupos pequenos distorçam a proporção.
                 */
                weight: Math.min(xGroupLimit, xGroupAliases.length)
            };
        })
        .filter((pAliasGroup) => pAliasGroup.weight > 0 && pAliasGroup.aliases.length);

    // Cada iteração escolhe o grupo proporcionalmente menos preenchido.
    while (xAliases.length < xMaxAliases) {
        const xAliasGroup = pvSelectNextAliasGroup(xGroups);
        if (!xAliasGroup) {
            break;
        }

        // Duplicados globais são descartados sem consumir espaço na lista final.
        const xAlias = pvTakeNextUniqueAlias(xAliasGroup, xUsedAliases);
        if (!xAlias) {
            continue;
        }

        xUsedAliases.add(xAlias);
        xAliases.push(xAlias);
        xAliasGroup.added++;
    }

    return xAliases;
};

/**
 * Seleciona o próximo grupo com menor preenchimento proporcional.
 * Em empate, preserva a ordem original dos grupos para manter saída estável.
 *
 * @private
 * @param {Object[]} pAliasGroups - Grupos de aliases
 * @returns {Object|null} Grupo selecionado
 */
const pvSelectNextAliasGroup = (pAliasGroups) => {
    return (pAliasGroups || [])
        // Grupos sem aliases pendentes não participam da rodada atual.
        .filter((pAliasGroup) => pAliasGroup.cursor < pAliasGroup.aliases.length)
        .reduce((pSelectedGroup, pAliasGroup) => {
            if (!pSelectedGroup) {
                return pAliasGroup;
            }

            // Menor razão significa menor preenchimento relativo ao peso do tipo.
            const xSelectedRatio = pSelectedGroup.added / pSelectedGroup.weight;
            const xCurrentRatio = pAliasGroup.added / pAliasGroup.weight;

            if (xCurrentRatio < xSelectedRatio) {
                return pAliasGroup;
            }

            if (xCurrentRatio > xSelectedRatio) {
                return pSelectedGroup;
            }

            return pAliasGroup.order < pSelectedGroup.order ? pAliasGroup : pSelectedGroup;
        }, null);
};

/**
 * Retorna o próximo alias ainda não usado de um grupo.
 * O cursor avança mesmo quando encontra duplicados, garantindo que aliases
 * repetidos entre tipos sejam pulados sem travar a mesclagem.
 *
 * @private
 * @param {Object} pAliasGroup - Grupo de aliases
 * @param {Set<string>} pUsedAliases - Aliases já incluídos
 * @returns {string|null} Alias único
 */
const pvTakeNextUniqueAlias = (pAliasGroup, pUsedAliases) => {
    while (pAliasGroup.cursor < pAliasGroup.aliases.length) {
        const xAlias = pAliasGroup.aliases[pAliasGroup.cursor];

        // O cursor avança antes do teste para pular duplicados definitivamente.
        pAliasGroup.cursor++;

        if (!pUsedAliases.has(xAlias)) {
            return xAlias;
        }
    }

    return null;
};

/**
 * Normaliza limites para inteiros positivos.
 *
 * @private
 * @param {number} pLimit - Limite informado
 * @returns {number} Limite normalizado
 */
const pvNormalizeAliasLimit = (pLimit) => {
    // Aceita limites recebidos como string numérica sem quebrar a chamada.
    const xLimit = Number(pLimit);
    if (!Number.isFinite(xLimit) || xLimit <= 0) {
        return 0;
    }

    return Math.floor(xLimit);
};

/**
 * Formata números com delimitador de milhares.
 * Remove caracteres não numéricos antes de aplicar o delimitador.
 *
 * @private
 * @param {string|number} pDigits - Dígitos
 * @param {string} [pDelimiter='.'] - Delimitador
 * @returns {string} Número formatado
 */
const pvFormatThousandsWithDelimiter = (pDigits, pDelimiter = '.') => {
    // Garante que a formatação trabalhe apenas sobre dígitos.
    const xRawDigits = String(pDigits || '').replace(/[^\d]/g, '');
    if (xRawDigits.length < 4) {
        return xRawDigits;
    }

    // Remove zeros à esquerda sem apagar o último dígito significativo.
    const xNormalizedDigits = xRawDigits.replace(/^0+(\d)/, '$1');
    return xNormalizedDigits.replace(/\B(?=(\d{3})+(?!\d))/g, pDelimiter);
};

/**
 * Constrói aliases de datas.
 * Retorna variações ISO, brasileiras e compactas para uma data válida.
 *
 * @private
 * @param {Object} pParts - Partes da data
 * @param {string} pParts.day - Dia
 * @param {string} pParts.month - Mês
 * @param {string} pParts.year - Ano
 * @returns {string[]} Aliases de datas
 */
const pvBuildDateAliasesFromParts = ({ day, month, year }) => {
    const xAliases = new Set();

    // Primeiro valida se dia e mês são inteiros com tamanho esperado.
    const xDayNumber = /^\d{1,2}$/.test(String(day || '')) ? Number(day) : null;
    const xMonthNumber = /^\d{1,2}$/.test(String(month || '')) ? Number(month) : null;
    const xRawYear = String(year || '').trim();

    if (!Number.isInteger(xDayNumber) || !Number.isInteger(xMonthNumber)) {
        return [];
    }

    if (xDayNumber < 1 || xDayNumber > 31 || xMonthNumber < 1 || xMonthNumber > 12) {
        return [];
    }

    // Aceita ano com dois ou quatro dígitos; outros formatos são descartados.
    const xYearLength = xRawYear.length === 2 || xRawYear.length === 4 ? xRawYear.length : 0;
    if (!xYearLength || !/^\d+$/.test(xRawYear)) {
        return [];
    }

    // Anos curtos são tratados como 20XX para manter comportamento previsível.
    const xFullYear = xYearLength === 2 ? Number(`20${xRawYear}`) : Number(xRawYear);
    const xDate = new Date(Date.UTC(xFullYear, xMonthNumber - 1, xDayNumber));

    // Date corrige datas inválidas automaticamente; essa checagem impede isso.
    const xIsValidDate =
        xDate.getUTCFullYear() === xFullYear &&
        xDate.getUTCMonth() === xMonthNumber - 1 &&
        xDate.getUTCDate() === xDayNumber;

    if (!xIsValidDate) {
        return [];
    }

    const xDay = String(xDayNumber).padStart(2, '0');
    const xMonth = String(xMonthNumber).padStart(2, '0');
    const xYear = String(xFullYear);

    // Gera formatos comuns para cobrir buscas ISO, BR e compactas.
    //xAliases.add(`${xYear}-${xMonth}-${xDay}`);
    xAliases.add(`${xYear}/${xMonth}/${xDay}`);
    // xAliases.add(`${xYear}.${xMonth}.${xDay}`);
    //xAliases.add(`${xYear}${xMonth}${xDay}`);
    //xAliases.add(`${xDay}-${xMonth}-${xYear}`);
    xAliases.add(`${xDay}/${xMonth}/${xYear}`);
    //xAliases.add(`${xDay}.${xMonth}.${xYear}`);
    //xAliases.add(`${xDay}${xMonth}${xYear}`);

    return [...xAliases];
};

/**
 * Remove tags HTML.
 *
 * @private
 * @param {string} pText - Texto de entrada
 * @returns {string} Texto sem HTML
 */
const pvRemoveHtml = (pText) => {
    // Substitui por espaço para não colar palavras separadas por tags.
    return String(pText || '').replace(/<[^>]*>/g, ' ');
};

/**
 * Remove entidades HTML.
 *
 * @private
 * @param {string} pText - Texto de entrada
 * @returns {string} Texto sem entidades HTML
 */
const pvRemoveHtmlEntities = (pText) => {
    // Entidades viram espaço porque podem representar ruído textual ou HTML.
    return String(pText || '').replace(/&[a-z0-9#]+;/gi, ' ');
};

/**
 * Remove caracteres inválidos, preservando símbolos úteis.
 *
 * @private
 * @param {string} pText - Texto de entrada
 * @returns {string} Texto limpo
 */
const pvRemoveInvalidChars = (pText) => {
    // Preserva letras, números, moeda, pontuação e separadores úteis para aliases.
    return String(pText || '').replace(
        /[^\p{L}\p{N}\p{Sc}\p{Pd}\p{Pc}\p{Zs}\n\r\t.,!?;:/\\()[\]{}"'`@#$%^&*+=<>|~%-]/gu,
        ' '
    );
};

/**
 * Reduz pontuação repetida.
 *
 * @private
 * @param {string} pText - Texto de entrada
 * @returns {string} Texto com pontuação normalizada
 */
const pvNormalizePunctuation = (pText) => {
    // Reduz sequências como "!!!" ou "..." para uma ocorrência.
    return String(pText || '').replace(/([.,!?;:])\1{2,}/g, '$1');
};

/**
 * Normaliza espaços.
 *
 * @private
 * @param {string} pText - Texto de entrada
 * @returns {string} Texto com espaços normalizados
 */
const pvNormalizeSpaces = (pText) => {
    // Compacta espaços preservando quebras duplas como separação de blocos.
    return String(pText || '')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\s+\n/g, '\n')
        .replace(/\n\s+/g, '\n')
        .trim();
};

module.exports = rags;
