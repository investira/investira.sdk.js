# AI Integration Guide

Este guia foi escrito para facilitar o uso do `investira.sdk` por outros projetos e por agentes de IA que precisem selecionar o modulo certo, respeitar contratos e evitar integracoes incorretas.

## Objetivo do pacote em uma frase

`investira.sdk` e uma camada utilitaria compartilhada com foco em datas, normalizacao, mensagens, requests, calculos financeiros e estruturas leves de apoio a backends e bibliotecas JavaScript.

## Como pensar o pacote

Em vez de tratar o SDK como uma biblioteca unica, pense nele como um conjunto de 4 blocos:

1. `utils`: funcoes pequenas e reutilizaveis.
2. `messages` e `responses`: contrato padronizado para erros e respostas.
3. `hofs`: estruturas com comportamento, como `tasks`, `matrix` e `dataModel`.
4. `plugins`: efeitos colaterais globais executados no `require`.

## Mapa mental para escolher modulo

### Se a tarefa fala de datas

Use `dates` quando houver:

- conversao de string para `Date`;
- SQL date/datetime;
- dias uteis;
- feriados;
- agenda recorrente;
- aniversarios e projecoes de prazo.

Combine com `formats` apenas quando a demanda for exibicao textual.

### Se a tarefa fala de exibicao

Use `formats` quando houver:

- moeda;
- numeros amigaveis;
- duracao por extenso;
- telefone;
- datas em formato visual.

Nao use `formats` para logica de negocio temporal. Para isso, use `dates`.

### Se a tarefa fala de payload, filtro ou transformacao

Use:

- `objects` para merge, diff e limpeza;
- `strings` para escape, title case e serializacao;
- `arrays` para listas, indexacao e busca;
- `validators` para guard clauses e leitura de tipos.

### Se a tarefa fala de API

Use:

- `httpRequests` para chamadas externas;
- `responses` para montar contratos `{ data, pages, message }`;
- `messages` para erros HTTP e mensagens semanticas.

### Se a tarefa fala de IA, busca ou embedding

Use `rags` para:

- limpar texto;
- gerar aliases de datas, numeros e codigos;
- enriquecer embeddings com variacoes canonicas.

### Se a tarefa fala de calculo financeiro

Use `invests` para:

- `pv`
- `fv`
- `pmt`
- `nper`
- `i`
- `fvs`

Use `numbers` em volta para parse, arredondamento e apresentacao.

## Contratos e convencoes que uma IA deve respeitar

### 1. O pacote e CommonJS

Prefira:

```js
const { dates, numbers } = require('investira.sdk');
```

Evite assumir ESM nativo como primeira opcao.

### 2. O pacote modifica `Date.prototype`

Ao usar o entry point principal, assuma que os seguintes metodos estarao disponiveis:

- `Date.prototype.toSql`
- `Date.prototype.isHoliday`

Nao documente isso como comportamento isolado do modulo `dates`; ele acontece por efeito colateral de importacao.

### 3. Datas uteis dependem de locale e feriados carregados

Antes de afirmar comportamento de dia util, considere:

- locale atual do `moment`;
- dados carregados de `investira.data`;
- lista `_holidays`;
- lista `_notBusinessDays`.

### 4. `responses` assume estrutura conhecida

Nao use `responses.getObjData`, `getError` ou `getMessageCode` em objetos arbitrarios sem checar shape.

Assuma shapes como:

```js
{
    data: ...,
    pages: ...,
    message: {
        description: '...',
        code: {
            status: 200
        }
    }
}
```

ou

```js
{
    error: {
        description: '...',
        code: {
            status: 400
        }
    }
}
```

### 5. `invests.i` trabalha com percentual

Quando gerar exemplos, use:

- `7` para `7%`
- nao `0.07`

### 6. `numbers.isNumber` nao converte string

Para entradas como `'10,25'` ou `'10.25'`, converta antes com `numbers.toNumber`.

### 7. `dataModel` retorna valores, nao metadados

Ao ler uma propriedade do proxy, o retorno esperado e o `value`, e nao o objeto `{ type, value }`.

## Padroes recomendados de integracao

## Padrao 1: API externa + resposta padronizada

```js
const { httpRequests, messages, responses } = require('investira.sdk');

function carregarDados() {
    return httpRequests
        .requestGET({ url: 'https://api.exemplo.com/dados' })
        .then((rResp) => {
            return responses.routeDataResponse(
                responses.getObjData(rResp),
                new messages.Success.OkMessage('Dados carregados')
            );
        });
}
```

Quando usar:

- servicos que devolvem `data` e `message`;
- controllers e routes que precisam de payload uniforme.

## Padrao 2: saneamento de entrada

```js
const { numbers, objects, strings, validators } = require('investira.sdk');

function normalizarEntrada(pPayload) {
    return {
        nome: strings.toTitleCase(objects.getNotEmpty(pPayload.nome, '')),
        email: strings.toString(pPayload.email, ''),
        valor: numbers.toNumber(pPayload.valor, true, 0),
        ativo: validators.isTrue(pPayload.ativo)
    };
}
```

Quando usar:

- requests HTTP;
- importacoes CSV/Excel;
- camadas de adaptacao entre sistemas.

## Padrao 3: tipagem leve com `dataModel`

```js
const { dataModel } = require('investira.sdk');

const xModel = dataModel(
    {
        account_id: { type: 'number' },
        account_name: { type: 'string' },
        due_date: { type: 'date' }
    },
    {
        strict: true,
        convert: true
    }
);

xModel.account_id = '123';
```

Quando usar:

- DTOs simples;
- modelos transitorios;
- prototipacao de contratos.

Nao use como substituto de validacao de schema completa quando for necessario relatorio detalhado de erro por campo.

## Padrao 4: enriquecimento para RAG

```js
const { rags } = require('investira.sdk');

const xChunk = rags.extractAliases('Tesouro IPCA+ 15/05/2035 - NTN-B 2035', {
    accent: true,
    maxAliases: 16
});
```

Quando usar:

- texto para embeddings;
- indexacao de documentos financeiros;
- melhoria de recuperacao por codigos e datas.

## Padrao 5: agendamento leve dentro do processo

```js
const { tasks } = require('investira.sdk');

const xTask = tasks(
    {
        id: 'refresh-cache',
        name: 'Refresh cache',
        schedules: [{ type: 'D', time: '06:00', workingDay: true }]
    },
    {
        execute: () => Promise.resolve()
    }
);
```

Quando usar:

- jobs de baixa complexidade e escopo local ao processo.

Nao use como scheduler distribuido entre varios pods/instancias sem uma camada externa de coordenacao.

## Armadilhas e cuidados

### 1. Nao assumir que `responses` aceita qualquer objeto

Ele foi desenhado para contratos internos relativamente estaveis.

### 2. Nao misturar `formats` com regra de negocio

- `dates`: logica temporal
- `formats`: exibicao

### 3. Nao passar string numerica para validadores de numero

Use:

```js
numbers.toNumber('1.234,56', true)
```

Antes de:

```js
validators.isNumber(...)
```

### 4. Nao ignorar o locale do `spellChecker`

`spellChecker.check` depende de `spellChecker.locale` e de `investira.data`.

### 5. Nao esquecer que `objects.deepCopy` e via JSON

Isso significa perda de:

- `Date`
- `Map`
- `Set`
- funcoes
- referencias circulares

### 6. Nao tratar `tasks` como cron persistente

O estado vive no processo atual.

## Receitas objetivas para prompts de IA

Quando um agente de IA for instruido a usar `investira.sdk`, estas diretrizes tendem a produzir resultados melhores:

- "Use `dates` para calculo de prazo e `formats` apenas na resposta final."
- "Monte a resposta com `responses.routeDataResponse` e mensagens de `messages.Success`."
- "Converta entradas monetarias com `numbers.toNumber(..., true)` antes de validar."
- "Se precisar enriquecer texto para embedding, use `rags.extractAliases`."
- "Se o endpoint exigir paginacao padronizada, considere `responses.serviceDataResponse`."
- "Considere que importar o pacote modifica `Date.prototype`."

## Heuristicas uteis para code generation

- Para filtros por texto, `strings.stringToQuery` gera uma lista boa para `LIKE`.
- Para arrays ordenados, `arrays.seekDate` e `arrays.seekNumber` evitam buscas lineares.
- Para merges configuraveis, use `objects.deepMerge`.
- Para mensagens HTTP semanticamente corretas, prefira classes de `messages` em vez de objetos soltos.

## Como descrever o SDK para outro time

Descricao curta:

"`investira.sdk` e um pacote CommonJS de utilitarios compartilhados da Investira, com foco em datas e dias uteis, normalizacao de dados, requests HTTP, respostas padronizadas, mensagens HTTP, calculos financeiros e enrichment para RAG."

Descricao tecnica:

"O pacote exporta modulos utilitarios desacoplados e alguns construtores com estado (`tasks`, `matrix`, `dataModel`), carrega dados externos de `investira.data` e registra extensoes globais de `Date` durante a importacao do entry point principal."
