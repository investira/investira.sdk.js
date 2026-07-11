# investira.sdk

`investira.sdk` e um pacote CommonJS com utilitarios reutilizaveis da Investira para projetos Node.js e JavaScript.
Ele concentra funcoes para datas, numeros, objetos, strings, mensagens padronizadas, requests HTTP, calculos financeiros, RAG, themes e estruturas auxiliares como tarefas agendadas e modelos tipados.

Esta documentacao foi pensada para dois publicos ao mesmo tempo:

- times que precisam integrar o pacote rapidamente em outros projetos;
- agentes de IA que precisam entender a superficie publica, os contratos e os efeitos colaterais do SDK.

## Compatibilidade

- Pacote: `investira.sdk`
- Versao documentada: `2.4.40`
- Runtime: `Node >=18.0.0 <=18.21.0`
- Modulo: `commonjs`
- Entry point: `index.js`

## Instalacao

```bash
npm install investira.sdk
```

Ou no `package.json`:

```json
{
  "dependencies": {
    "investira.sdk": "^2.4.40"
  }
}
```

## Importacao rapida

```js
const sdk = require('investira.sdk');

const { arrays } = sdk;
const { dates } = sdk;
const { formats } = sdk;
const { httpRequests } = sdk;
const { invests } = sdk;
const { numbers } = sdk;
const { objects } = sdk;
const { strings } = sdk;
const { rags } = sdk;
const { responses } = sdk;
const { themes } = sdk;
const { validators } = sdk;
const { spellChecker } = sdk;
const { messages } = sdk;
const { tasks } = sdk;
const { matrix } = sdk;
const { dataModel } = sdk;
```

Tambem e possivel importar apenas um modulo:

```js
const { dates, numbers, messages } = require('investira.sdk');
```

## O que o pacote exporta

O `index.js` expoe os seguintes modulos publicos:

- `tasks`
- `matrix`
- `arrays`
- `dates`
- `formats`
- `httpRequests`
- `invests`
- `numbers`
- `objects`
- `strings`
- `rags`
- `responses`
- `themes`
- `validators`
- `spellChecker`
- `messages`
- `dataModel`

## Efeito colateral importante

Ao carregar o pacote, `investira.sdk` executa `require('./lib/plugins')`.
Hoje isso adiciona metodos ao `Date.prototype`:

- `date.toSql()`: delega para `dates.toSqlDate(date)`
- `date.isHoliday()`: delega para `dates.isHoliday(date)`

Exemplo:

```js
require('investira.sdk');

const xDate = new Date('2024-06-12T00:00:00Z');

console.log(xDate.toSql());
console.log(xDate.isHoliday());
```

Se o seu projeto evita mutacoes globais em prototipos nativos, esse ponto precisa ser considerado na integracao.

## Guia rapido de escolha de modulo

| Se voce precisa... | Use |
| --- | --- |
| procurar itens em arrays ordenados, normalizar listas | `arrays` |
| trabalhar com datas, dias uteis, feriados e agendamento | `dates` |
| exibir numeros, datas, duracoes e telefones | `formats` |
| chamar APIs e padronizar upload/cancelamento | `httpRequests` |
| fazer calculos financeiros de valor presente, taxa e parcelas | `invests` |
| reduzir erro de ponto flutuante e converter numeros | `numbers` |
| limpar, mesclar e comparar objetos | `objects` |
| normalizar e serializar texto | `strings` |
| enriquecer texto para RAG, embedding e busca | `rags` |
| padronizar contratos `{ data, pages, message }` | `responses` |
| derivar palette a partir de uma cor principal | `themes` |
| validar tipos e interpretar valores | `validators` |
| corrigir texto com dicionarios da Investira | `spellChecker` |
| gerar mensagens padronizadas HTTP/negocio | `messages` |
| criar tarefas com cronologia baseada em regras de agenda | `tasks` |
| armazenar grade linha/coluna compartilhando referencia | `matrix` |
| impor shape e tipo em objetos por `Proxy` | `dataModel` |

## Exemplo de uso integrado

```js
const {
    dates,
    formats,
    httpRequests,
    messages,
    numbers,
    objects,
    responses
} = require('investira.sdk');

function buscarPosicaoCliente(pClientId) {
    return httpRequests
        .requestGET({
            url: `https://api.exemplo.com/clientes/${pClientId}/posicao`
        })
        .then((rResp) => {
            const xData = responses.getObjData(rResp);
            const xPatrimonio = numbers.toNumber(xData.patrimonio);

            return responses.routeDataResponse(
                {
                    ...xData,
                    patrimonio: xPatrimonio,
                    patrimonio_formatado: formats.friendlyNumber(xPatrimonio, 2, true),
                    atualizado_em_sql: dates.toSqlDatetime(new Date())
                },
                new messages.Success.OkMessage('Posicao carregada com sucesso')
            );
        })
        .catch((rErr) => {
            throw objects.getNotNull(rErr, new messages.ServerErrors.InternalServerError());
        });
}
```

## Mapa da documentacao

- [docs/API_REFERENCE.md](./docs/API_REFERENCE.md): referencia completa da API publica
- [docs/AI_INTEGRATION_GUIDE.md](./docs/AI_INTEGRATION_GUIDE.md): guia de uso para outros projetos e para agentes de IA

## Dependencias principais

- `axios`
- `deep-diff`
- `flatted`
- `investira.data`
- `moment`

O modulo `dates` e o `spellChecker` dependem especialmente de dados carregados de `investira.data`.

## Testes existentes

O projeto possui testes focados principalmente nos seguintes modulos:

- `arrays`
- `dates`
- `formats`
- `invests`
- `messages`
- `numbers`
- `objects`
- `spellChecker`
- `strings`
- `validators`

Execucao local:

```bash
node ./lib/tests
```

## Estrutura do pacote

```text
investira.sdk/
|-- index.js
|-- lib/
|   |-- hofs/
|   |   |-- dataModel.js
|   |   |-- matrix.js
|   |   `-- tasks.js
|   |-- messages/
|   |-- plugins/
|   |-- tests/
|   `-- utils/
`-- README.md
```

## Quando usar este SDK

Use `investira.sdk` quando o projeto precisar de:

- padroes de utilitarios compartilhados entre sistemas Investira;
- tratamento consistente de datas com dias uteis e feriados;
- respostas HTTP/mensagens com contrato repetivel;
- normalizacao de texto para busca, IA e integracoes;
- calculos financeiros comuns e operacoes numericas menos sujeitas a erros binarios.

## Quando nao usar sozinho

Mesmo cobrindo muita base utilitaria, o SDK nao substitui:

- validacao de schema declarativa completa como `zod` ou `joi`;
- agendamento distribuido com persistencia e failover;
- ORM, query builder ou camada transacional;
- abstracao de filas, workers ou pipelines de observabilidade.

Nesses casos, ele funciona melhor como camada complementar.
