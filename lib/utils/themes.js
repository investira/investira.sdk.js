/**
 * Estrutura mínima esperada para um tema derivado.
 *
 * @typedef {object} ThemePalette
 * @property {string} primary Cor principal usada como base da identidade visual.
 * @property {string} primary_dark Variação mais escura da cor principal.
 * @property {string} primary_soft Variação suave da cor principal para fundos e destaques leves.
 * @property {string} primary_soft_border Variação suave pensada para bordas.
 * @property {string} panel Cor de fundo para painéis e superfícies secundárias.
 * @property {string} text Cor principal de texto.
 * @property {string} text_muted Cor de texto secundário.
 * @property {string} link Cor aplicada a links e ações de navegação.
 */

/**
 * Opções aceitas na geração de tema.
 *
 * Campos permitidos:
 * - `background_mode`: define explicitamente `'light'` ou `'dark'` em snake_case.
 * - `dark_background`: quando `true`, força a base escura em snake_case.
 *
 * Quando mais de um campo for informado, qualquer flag escura tem prioridade
 * e o tema de referência escuro passa a ser utilizado.
 *
 * @typedef {object} BuildThemeOptions
 * @property {'light'|'dark'} [background_mode] Informa explicitamente o modo de fundo em snake_case.
 * @property {boolean} [dark_background] Indica se o tema base deve considerar fundo escuro em snake_case.
 */

/**
 * Tema de referência padrão para interfaces claras.
 *
 * Mantém as relações de contraste e saturação usadas como base
 * para derivar novas paletas a partir de outra cor principal.
 *
 * @type {ThemePalette}
 */
const wDEFAULT_THEME_REFERENCE = {
    primary: '#03C4A0',
    primary_dark: '#028B73',
    primary_soft: '#E8FBF7',
    primary_soft_border: '#BFEFE4',
    panel: '#F7FFFD',
    text: '#16352F',
    text_muted: '#4A6F67',
    link: '#03C4A0'
};
/**
 * Tema de referência padrão para interfaces escuras.
 *
 * Mantém os mesmos papéis semânticos do tema claro, porém com
 * equilíbrio de contraste adequado para superfícies escuras.
 *
 * @type {ThemePalette}
 */
const wDEFAULT_THEME_REFERENCE_DARK = {
    primary: '#03C4A0',
    primary_dark: '#028B73',
    primary_soft: '#10342D',
    primary_soft_border: '#1E6154',
    panel: '#091412',
    text: '#E8FBF7',
    text_muted: '#A7C6BE',
    link: '#33D6B4'
};

/**
 * Utilitários para derivação de temas a partir de uma cor primária.
 *
 * A estratégia do módulo é preservar a distância visual entre a cor
 * principal do tema informado e suas variações semânticas, replicando
 * essa relação em uma nova paleta.
 */
const themes = {
    DEFAULT_THEME_REFERENCE: {
        ...wDEFAULT_THEME_REFERENCE
    },
    DEFAULT_THEME_REFERENCE_DARK: {
        ...wDEFAULT_THEME_REFERENCE_DARK
    },

    /**
     * Deriva um tema completo preservando a relação visual do tema de referência.
     *
     * @param {string} pPrimaryColor Cor primária base em hexadecimal.
     * @param {ThemePalette} [pThemeReference=wDEFAULT_THEME_REFERENCE] Tema de referência para as variações.
     * @param {BuildThemeOptions} [pOptions={}] Opções de geração do tema.
     * Atributos permitidos em `pOptions`:
     * - `background_mode`: `'light'` ou `'dark'`.
     * - `dark_background`: `true` para forçar referência escura.
     *
     * Exemplos:
     * - `buildThemeFromPrimaryColor('#03C4A0', { background_mode: 'dark' })`
     * - `buildThemeFromPrimaryColor('#03C4A0', wTheme, { dark_background: true })`
     * @returns {ThemePalette}
     */
    buildThemeFromPrimaryColor: (pPrimaryColor, pThemeReference = wDEFAULT_THEME_REFERENCE, pOptions = {}) => {
        return pvBuildThemeFromPrimaryColor(pPrimaryColor, pThemeReference, pOptions);
    },

    /**
     * Normaliza uma cor hexadecimal.
     *
     * @param {string} pColor Cor em hexadecimal.
     * @param {string} [pFallback='#000000'] Cor de fallback.
     * @returns {string}
     */
    normalizeHexColor: (pColor, pFallback = '#000000') => {
        return pvNormalizeHexColor(pColor, pFallback);
    },

    /**
     * Converte uma cor hexadecimal para HSL.
     *
     * @param {string} pColor Cor em hexadecimal.
     * @returns {{h:number,s:number,l:number}} Objeto HSL normalizado com hue entre 0 e 360.
     */
    hexToHsl: pColor => {
        return pvHexToHsl(pColor);
    },

    /**
     * Converte uma cor HSL para hexadecimal.
     *
     * @param {{h:number,s:number,l:number}} pColor Cor HSL.
     * @returns {string} Cor em hexadecimal no formato `#RRGGBB`.
     */
    hslToHex: pColor => {
        return pvHslToHex(pColor);
    }
};

module.exports = themes;

/**
 * Deriva um tema completo preservando a relação visual do tema de referência.
 *
 * @param {string} pPrimaryColor Cor primária base em hexadecimal.
 * @param {ThemePalette} pThemeReference Tema de referência para as variações.
 * @param {BuildThemeOptions} [pOptions={}] Opções de geração do tema.
 * Atributos permitidos em `pOptions`: `background_mode` e `dark_background`.
 * @returns {ThemePalette}
 */
function pvBuildThemeFromPrimaryColor(pPrimaryColor, pThemeReference, pOptions = {}) {
    const xArgs = pvResolveBuildThemeArgs(pThemeReference, pOptions);
    const xThemeReference = pvNormalizeThemeReference(xArgs.theme_reference, xArgs.options);
    const xPrimaryColor = pvNormalizeHexColor(pPrimaryColor, xThemeReference.primary);
    const xPrimaryHsl = pvHexToHsl(xPrimaryColor);
    const xReferencePrimaryHsl = pvHexToHsl(xThemeReference.primary);

    return {
        // A cor principal sempre reflete exatamente a cor recebida já normalizada.
        primary: xPrimaryColor,
        primary_dark: pvBuildThemeVariationColor(xPrimaryHsl, xReferencePrimaryHsl, xThemeReference.primary_dark),
        primary_soft: pvBuildThemeVariationColor(xPrimaryHsl, xReferencePrimaryHsl, xThemeReference.primary_soft),
        primary_soft_border: pvBuildThemeVariationColor(
            xPrimaryHsl,
            xReferencePrimaryHsl,
            xThemeReference.primary_soft_border
        ),
        panel: pvBuildThemeVariationColor(xPrimaryHsl, xReferencePrimaryHsl, xThemeReference.panel),
        text: pvBuildThemeVariationColor(xPrimaryHsl, xReferencePrimaryHsl, xThemeReference.text),
        text_muted: pvBuildThemeVariationColor(xPrimaryHsl, xReferencePrimaryHsl, xThemeReference.text_muted),
        link: pvBuildThemeVariationColor(xPrimaryHsl, xReferencePrimaryHsl, xThemeReference.link)
    };
}

/**
 * Resolve a combinação de referência e opções aceitando atalho pelo segundo parâmetro.
 *
 * @param {ThemePalette|BuildThemeOptions} pThemeReference Tema de referência ou opções.
 * @param {BuildThemeOptions} pOptions Opções explícitas.
 * @returns {{theme_reference: ThemePalette|object, options: BuildThemeOptions|object}}
 */
function pvResolveBuildThemeArgs(pThemeReference, pOptions) {
    const xThemeReference =
        pThemeReference && typeof pThemeReference === 'object' && !Array.isArray(pThemeReference)
            ? pThemeReference
            : {};
    const xOptions = pOptions && typeof pOptions === 'object' && !Array.isArray(pOptions) ? pOptions : {};

    if (pvLooksLikeBuildThemeOptions(xThemeReference) && !pvLooksLikeThemeReference(xThemeReference)) {
        // Permite o atalho `buildThemeFromPrimaryColor(cor, { background_mode: 'dark' })`.
        return {
            theme_reference: {},
            options: xThemeReference
        };
    }

    return {
        theme_reference: xThemeReference,
        options: xOptions
    };
}

/**
 * Garante que o tema de referência tenha todos os atributos necessários.
 *
 * @param {ThemePalette|object} pThemeReference Tema informado.
 * @param {BuildThemeOptions} [pOptions={}] Opções de geração do tema.
 * @returns {ThemePalette}
 */
function pvNormalizeThemeReference(pThemeReference, pOptions = {}) {
    const xThemeReference =
        pThemeReference && typeof pThemeReference === 'object' && !Array.isArray(pThemeReference)
            ? pThemeReference
            : {};
    const xOptions = pOptions && typeof pOptions === 'object' && !Array.isArray(pOptions) ? pOptions : {};
    const xDefaultThemeReference = pvResolveDefaultThemeReference(xOptions);

    return {
        primary: pvNormalizeHexColor(xThemeReference.primary, xDefaultThemeReference.primary),
        primary_dark: pvNormalizeHexColor(xThemeReference.primary_dark, xDefaultThemeReference.primary_dark),
        primary_soft: pvNormalizeHexColor(xThemeReference.primary_soft, xDefaultThemeReference.primary_soft),
        primary_soft_border: pvNormalizeHexColor(
            xThemeReference.primary_soft_border,
            xDefaultThemeReference.primary_soft_border
        ),
        panel: pvNormalizeHexColor(xThemeReference.panel, xDefaultThemeReference.panel),
        text: pvNormalizeHexColor(xThemeReference.text, xDefaultThemeReference.text),
        text_muted: pvNormalizeHexColor(xThemeReference.text_muted, xDefaultThemeReference.text_muted),
        link: pvNormalizeHexColor(xThemeReference.link, xDefaultThemeReference.link)
    };
}

/**
 * Resolve o tema de referência padrão conforme o tipo de fundo.
 *
 * @param {BuildThemeOptions|object} pOptions Opções de geração do tema.
 * @returns {ThemePalette}
 */
function pvResolveDefaultThemeReference(pOptions) {
    const xOptions = pOptions && typeof pOptions === 'object' && !Array.isArray(pOptions) ? pOptions : {};
    const xBackgroundMode = pvResolveBackgroundMode(xOptions);

    return xBackgroundMode === 'dark' ? wDEFAULT_THEME_REFERENCE_DARK : wDEFAULT_THEME_REFERENCE;
}

/**
 * Identifica se o objeto parece conter opções de geração.
 *
 * @param {BuildThemeOptions|object} pOptions Objeto recebido.
 * @returns {boolean} `true` quando o objeto aparenta ser um conjunto de opções do gerador.
 */
function pvLooksLikeBuildThemeOptions(pOptions) {
    return Boolean(
        pOptions &&
        (pOptions.hasOwnProperty('background_mode') ||
            pOptions.hasOwnProperty('backgroundMode') ||
            pOptions.hasOwnProperty('dark_background') ||
            pOptions.hasOwnProperty('darkBackground'))
    );
}

/**
 * Identifica se o objeto parece ser um tema de referência.
 *
 * @param {ThemePalette|object} pThemeReference Objeto recebido.
 * @returns {boolean} `true` quando o objeto aparenta ser um tema de referência.
 */
function pvLooksLikeThemeReference(pThemeReference) {
    return Boolean(
        pThemeReference &&
        (pThemeReference.hasOwnProperty('primary') ||
            pThemeReference.hasOwnProperty('primary_dark') ||
            pThemeReference.hasOwnProperty('primary_soft') ||
            pThemeReference.hasOwnProperty('primary_soft_border') ||
            pThemeReference.hasOwnProperty('panel') ||
            pThemeReference.hasOwnProperty('text') ||
            pThemeReference.hasOwnProperty('text_muted') ||
            pThemeReference.hasOwnProperty('link'))
    );
}

/**
 * Resolve o modo de fundo a partir das opções recebidas.
 *
 * A presença de qualquer flag escura tem prioridade e força o retorno `dark`.
 *
 * @param {BuildThemeOptions|object} pOptions Opções de geração do tema.
 * @returns {'light'|'dark'}
 */
function pvResolveBackgroundMode(pOptions) {
    const xBackgroundMode = String(pOptions.background_mode || pOptions.backgroundMode || '')
        .trim()
        .toLowerCase();
    const xDarkBackground =
        pOptions.dark_background === true || pOptions.darkBackground === true || xBackgroundMode === 'dark';

    // Qualquer indicação explícita de fundo escuro prevalece sobre o valor padrão.
    return xDarkBackground ? 'dark' : 'light';
}

/**
 * Replica a diferença visual entre a cor base original e uma cor derivada.
 *
 * @param {object} pCurrentBaseHsl HSL da nova cor base.
 * @param {object} pReferenceBaseHsl HSL da cor base de referência.
 * @param {string} pReferenceTargetColor Cor derivada de referência.
 * @returns {string} Cor derivada no formato `#RRGGBB`.
 */
function pvBuildThemeVariationColor(pCurrentBaseHsl, pReferenceBaseHsl, pReferenceTargetColor) {
    const xReferenceTargetHsl = pvHexToHsl(pReferenceTargetColor);
    const xTargetHsl = {
        // Replica o deslocamento de hue da cor de referência sobre a nova base.
        h: pvNormalizeHue(pCurrentBaseHsl.h + (xReferenceTargetHsl.h - pReferenceBaseHsl.h)),
        // Mantém a mesma diferença relativa de saturação observada no tema base.
        s: pvClampNumber(pCurrentBaseHsl.s + (xReferenceTargetHsl.s - pReferenceBaseHsl.s), 0, 100),
        // Mantém a mesma diferença relativa de luminosidade observada no tema base.
        l: pvClampNumber(pCurrentBaseHsl.l + (xReferenceTargetHsl.l - pReferenceBaseHsl.l), 0, 100)
    };

    return pvHslToHex(xTargetHsl);
}

/**
 * Normaliza uma cor hexadecimal.
 *
 * @param {string} pColor Cor em hexadecimal.
 * @param {string} pFallback Cor de fallback.
 * @returns {string} Cor em hexadecimal no formato `#RRGGBB`.
 */
function pvNormalizeHexColor(pColor, pFallback) {
    const xColor = String(pColor || '')
        .trim()
        .replace(/^#/, '');
    const xFallback = String(pFallback || '')
        .trim()
        .replace(/^#/, '');
    const xResolvedColor = /^[0-9a-fA-F]{6}$/.test(xColor) ? xColor : xFallback;

    return `#${xResolvedColor.toUpperCase()}`;
}

/**
 * Converte uma cor hexadecimal para HSL.
 *
 * @param {string} pColor Cor em hexadecimal.
 * @returns {{h:number,s:number,l:number}} Cor convertida e normalizada para HSL.
 */
function pvHexToHsl(pColor) {
    const xRgbColor = pvHexToRgb(pColor);

    return pvRgbToHsl(xRgbColor);
}

/**
 * Converte uma cor hexadecimal para RGB.
 *
 * @param {string} pColor Cor em hexadecimal.
 * @returns {{r:number,g:number,b:number}} Cor convertida para RGB.
 */
function pvHexToRgb(pColor) {
    const xNormalizedColor = pvNormalizeHexColor(pColor, '#000000').replace('#', '');

    return {
        r: parseInt(xNormalizedColor.slice(0, 2), 16),
        g: parseInt(xNormalizedColor.slice(2, 4), 16),
        b: parseInt(xNormalizedColor.slice(4, 6), 16)
    };
}

/**
 * Converte uma cor RGB para HSL.
 *
 * @param {{r:number,g:number,b:number}} pColor Cor RGB.
 * @returns {{h:number,s:number,l:number}} Cor convertida para HSL.
 */
function pvRgbToHsl(pColor) {
    const xRed = pvClampNumber(Number(pColor.r) / 255, 0, 1);
    const xGreen = pvClampNumber(Number(pColor.g) / 255, 0, 1);
    const xBlue = pvClampNumber(Number(pColor.b) / 255, 0, 1);
    const xMax = Math.max(xRed, xGreen, xBlue);
    const xMin = Math.min(xRed, xGreen, xBlue);
    const xDelta = xMax - xMin;
    const xLightness = (xMax + xMin) / 2;
    let xHue = 0;
    let xSaturation = 0;

    if (xDelta !== 0) {
        // Quando existe variação entre os canais, calculamos saturação e hue reais.
        xSaturation = xDelta / (1 - Math.abs(2 * xLightness - 1));

        if (xMax === xRed) {
            // Vermelho dominante: usamos o setor 0 do círculo cromático.
            xHue = 60 * (((xGreen - xBlue) / xDelta) % 6);
        } else if (xMax === xGreen) {
            // Verde dominante: desloca o cálculo para o setor 2.
            xHue = 60 * ((xBlue - xRed) / xDelta + 2);
        } else {
            // Azul dominante: desloca o cálculo para o setor 4.
            xHue = 60 * ((xRed - xGreen) / xDelta + 4);
        }
    }

    return {
        h: pvNormalizeHue(xHue),
        s: pvClampNumber(xSaturation * 100, 0, 100),
        l: pvClampNumber(xLightness * 100, 0, 100)
    };
}

/**
 * Converte uma cor HSL para hexadecimal.
 *
 * @param {{h:number,s:number,l:number}} pColor Cor HSL.
 * @returns {string} Cor em hexadecimal no formato `#RRGGBB`.
 */
function pvHslToHex(pColor) {
    const xHue = pvNormalizeHue(Number(pColor.h));
    const xSaturation = pvClampNumber(Number(pColor.s), 0, 100) / 100;
    const xLightness = pvClampNumber(Number(pColor.l), 0, 100) / 100;
    const xChroma = (1 - Math.abs(2 * xLightness - 1)) * xSaturation;
    const xIntermediate = xChroma * (1 - Math.abs(((xHue / 60) % 2) - 1));
    const xMatch = xLightness - xChroma / 2;
    let xRed = 0;
    let xGreen = 0;
    let xBlue = 0;

    if (xHue < 60) {
        // Trecho entre vermelho e amarelo.
        xRed = xChroma;
        xGreen = xIntermediate;
    } else if (xHue < 120) {
        // Trecho entre amarelo e verde.
        xRed = xIntermediate;
        xGreen = xChroma;
    } else if (xHue < 180) {
        // Trecho entre verde e ciano.
        xGreen = xChroma;
        xBlue = xIntermediate;
    } else if (xHue < 240) {
        // Trecho entre ciano e azul.
        xGreen = xIntermediate;
        xBlue = xChroma;
    } else if (xHue < 300) {
        // Trecho entre azul e magenta.
        xRed = xIntermediate;
        xBlue = xChroma;
    } else {
        // Trecho entre magenta e vermelho.
        xRed = xChroma;
        xBlue = xIntermediate;
    }

    return pvRgbToHex({
        r: Math.round((xRed + xMatch) * 255),
        g: Math.round((xGreen + xMatch) * 255),
        b: Math.round((xBlue + xMatch) * 255)
    });
}

/**
 * Converte uma cor RGB para hexadecimal.
 *
 * @param {{r:number,g:number,b:number}} pColor Cor RGB.
 * @returns {string} Cor em hexadecimal no formato `#RRGGBB`.
 */
function pvRgbToHex(pColor) {
    const xRed = pvClampNumber(Math.round(Number(pColor.r)), 0, 255);
    const xGreen = pvClampNumber(Math.round(Number(pColor.g)), 0, 255);
    const xBlue = pvClampNumber(Math.round(Number(pColor.b)), 0, 255);

    return (
        '#' +
        xRed.toString(16).padStart(2, '0') +
        xGreen.toString(16).padStart(2, '0') +
        xBlue.toString(16).padStart(2, '0')
    ).toUpperCase();
}

/**
 * Mantém o hue no intervalo de 0 a 360.
 *
 * @param {number} pHue Hue recebido.
 * @returns {number} Hue ajustado para o intervalo fechado em 0 e aberto em 360.
 */
function pvNormalizeHue(pHue) {
    const xHue = Number(pHue);

    if (!Number.isFinite(xHue)) {
        // Valores inválidos retornam ao início do círculo cromático.
        return 0;
    }

    return ((xHue % 360) + 360) % 360;
}

/**
 * Limita um número entre mínimo e máximo.
 *
 * @param {number} pValue Valor recebido.
 * @param {number} pMin Menor valor permitido.
 * @param {number} pMax Maior valor permitido.
 * @returns {number} Valor limitado ao intervalo informado.
 */
function pvClampNumber(pValue, pMin, pMax) {
    const xValue = Number(pValue);
    const xMin = Number(pMin);
    const xMax = Number(pMax);

    if (!Number.isFinite(xValue)) {
        // Em caso de valor inválido, o mínimo preserva um fallback previsível.
        return xMin;
    }

    return Math.min(Math.max(xValue, xMin), xMax);
}
