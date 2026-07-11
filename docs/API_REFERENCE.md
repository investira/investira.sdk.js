# API Reference

Esta referencia cobre a API publica exposta por `require('investira.sdk')`.
Os nomes abaixo seguem exatamente os exports atuais do pacote.

## Sumario

- [Entrada principal](#entrada-principal)
- [tasks](#tasks)
- [matrix](#matrix)
- [arrays](#arrays)
- [dates](#dates)
- [formats](#formats)
- [httpRequests](#httprequests)
- [invests](#invests)
- [numbers](#numbers)
- [objects](#objects)
- [strings](#strings)
- [rags](#rags)
- [responses](#responses)
- [themes](#themes)
- [validators](#validators)
- [spellChecker](#spellchecker)
- [messages](#messages)
- [dataModel](#datamodel)
- [Plugins executados no load](#plugins-executados-no-load)

## Entrada principal

```js
const sdk = require('investira.sdk');
```

Exports:

```js
sdk.tasks
sdk.matrix
sdk.arrays
sdk.dates
sdk.formats
sdk.httpRequests
sdk.invests
sdk.numbers
sdk.objects
sdk.strings
sdk.rags
sdk.responses
sdk.themes
sdk.validators
sdk.spellChecker
sdk.messages
sdk.dataModel
```

## tasks

Construtor de tarefas com agenda baseada em regras de calendario e ciclo de vida controlado por eventos.

### Assinatura

```js
const xTask = tasks(pOptions, pSource);
```

### `pOptions`

- `id`: identificador unico da tarefa.
- `name`: nome descritivo.
- `retries = 0`: quantidade de tentativas extras em caso de erro.
- `delay = 0`: atraso, em segundos, entre retries.
- `enabled = true`: indica se a tarefa inicia habilitada.
- `schedules`: array de schedules.

Cada item de `schedules` aceita:

- `type`: `D`, `W`, `M` ou `Y`.
- `time`: horario `HH:mm`.
- `weekday`: dia da semana de `0` a `6`.
- `day`: dia do mes.
- `month`: mes do ano.
- `workingDay`: considera apenas dias uteis.
- `nextDay`: agenda para o dia util seguinte quando aplicavel.

### `pSource`

- `beforeRun()`: executado antes de `execute`.
- `execute()`: rotina principal.
- `afterStop()`: executado quando a tarefa encerra.

### Propriedades e metodos retornados

- `STATUS`: enum com `STOPPED`, `STOPPING` e `RUNNING`.
- `options`: copia das opcoes efetivas.
- `state`: estado atual da tarefa.
- `event`: `EventEmitter`.
- `disable()`: desabilita a tarefa e limpa timeout.
- `enable()`: habilita e reagenda a agenda.
- `schedule()`: calcula a proxima execucao e agenda `setTimeout`.
- `run(pPreviousTaskState = null)`: executa o ciclo completo da tarefa.
- `stop()`: solicita parada.
- `isStopping()`: informa se esta em processo de parada e dispara `pvStop`.
- `isRunning()`: informa se o status atual e `RUNNING`.
- `getNextDate(pBaseDate = null)`: calcula a proxima data usando todos os schedules.

### Eventos emitidos

- `disabled`
- `enabled`
- `scheduled`
- `run`
- `running`
- `retry`
- `error`
- `stopped`

### Observacoes

- O construtor chama `schedule()` automaticamente logo apos a criacao.
- Retries reaproveitam o mesmo objeto e incrementam `state.retries`.
- O calculo da agenda depende de `dates.scheduleToDate`.

### Exemplo

```js
const { tasks } = require('investira.sdk');

const xTask = tasks(
    {
        id: 'reprocessar-carteiras',
        name: 'Reprocessar carteiras',
        retries: 2,
        delay: 10,
        schedules: [
            {
                type: 'D',
                time: '08:00',
                workingDay: true
            }
        ]
    },
    {
        beforeRun: () => Promise.resolve(true),
        execute: () => Promise.resolve(),
        afterStop: () => Promise.resolve()
    }
);
```

## matrix

Estrutura bidimensional simples, esparsa, com acesso por linha e coluna compartilhando a mesma referencia de celula.

### Assinatura

```js
const xMatrix = new matrix();
```

### Metodos

- `set(pRow, pCol, pValue)`: define o valor da celula.
- `get(pRow, pCol)`: retorna a celula no formato `{ value }`.
- `row(pRow = 0)`: retorna a linha congelada.
- `col(pCol = 0)`: retorna a coluna congelada.
- `matrix()`: retorna a matriz completa congelada.

### Observacoes

- `row()` e `col()` retornam arrays com as mesmas referencias das celulas.
- `get()` nao retorna apenas o valor puro; retorna o wrapper da celula.

## arrays

Utilitarios para busca, normalizacao e comparacao de arrays.

### Metodos

- `inArray(pArray, pValue)`: verifica se o valor existe no array usando `includes`.
- `seekDate(pSourceArray, pTargetValue, pGreater = null)`: busca binaria em array ordenado de datas e retorna o indice mais proximo.
- `seekNumber(pSourceArray, pTargetValue, pGreater = null)`: busca binaria em array ordenado numerico e retorna o indice mais proximo.
- `seek(pSourceArray, pTargetValue, pGreater = null, pConvertFunction)`: versao generica da busca com funcao de conversao.
- `arrayToObject(pArray, pKeyPropertyName, pKeyFormatFunction = null, pKeyPrefix = '')`: indexa array de objetos por propriedade.
- `arrayComplianceWithArray(pCompliance, pTarget)`: retorna apenas os itens de `pCompliance` que existam em `pTarget`, preservando a ordem de `pTarget`.
- `toArray(pString, pDelimiter = ',', pPrefix = '', pSuffix = '')`: converte string ou array em lista normalizada, sem vazios e sem duplicados.
- `removeDuplicated(pArray)`: remove duplicados com `Set`.
- `isEqual(pArray1, pArray2)`: compara arrays ignorando a ordem.

### Casos de uso comuns

- converter listas de tags em arrays;
- localizar a data util mais proxima;
- indexar resultados por `id`;
- comparar listas de permissoes independentemente da ordem.

## dates

Modulo central para conversao, comparacao, dias uteis, feriados e agenda.

### Constantes exportadas

- `ONE_SECOND`
- `ONE_MINUTE`
- `ONE_HOUR`
- `ONE_DAY`
- `ONE_WEEK`
- `SCHEDULE_TYPE`
- `WEEKENDS_DAYS`

### Locale e feriados

- `locale(pLocale = 'UTC')`: define ou retorna o locale do `moment`.
- `localeData()`: retorna dados internos do locale, incluindo `_holidays` e `_notBusinessDays`.
- `addHoliday(pDate)`: adiciona um feriado no formato `YYYY-MM-DD`.
- `removeHoliday(pDate)`: remove um feriado do locale atual.
- `loadData()`: carrega feriados do `investira.data`.
- `updateLocale(pKey, pData)`: atualiza a configuracao interna de locale.
- `intlOptions()`: retorna `Intl.DateTimeFormat().resolvedOptions()`.

### Conversao e serializacao

- `toDate(pDate = null, pFormat = null, pNullValue = null)`: converte para `Date` usando `moment`.
- `toTime(pTime)`: converte `HH:mm:ss` para timestamp.
- `toSqlDate(pDate)`: formata em `YYYY-MM-DD`.
- `toSqlTime(pDate)`: formata em `HH:mm:ss`.
- `toSqlDatetime(pDate)`: formata em `YYYY-MM-DD HH:mm:ss`.
- `toUTC(pDate)`: gera string UTC ISO 8601.
- `toUTCDate(pDate)`: retorna data UTC com horario zerado.
- `dateToObject(pDate)`: quebra a data em componentes locais.
- `UTCDateToObject(pDate)`: quebra a data em componentes UTC.
- `scheduleToDate(pSchedule, pBaseDate = null)`: calcula a proxima execucao de um schedule.

### Comparacao

- `isHoliday(pDate)`: informa se a data e feriado cadastrado.
- `areDateTimesEqual(pDateTimeA, pDateTimeB)`: compara data e hora completas.
- `areDatesEqual(pDateA, pDateB)`: compara apenas a data.
- `isExpired(pDate, pLifeTimeSeconds)`: informa se a data ja expirou considerando TTL em segundos.
- `isTime(pString)`: valida hora no formato `HH:mm`.
- `isWorkingDay(pDate)`: considera finais de semana e feriados.

### Nomes e localizacao textual

- `dateNames()`: retorna mapa de textos relativos do locale.
- `monthNames()`: retorna nomes completos dos meses.
- `monthShortNames()`: retorna nomes curtos dos meses.
- `weekNames()`: retorna nomes completos da semana.
- `weekShortNames()`: retorna nomes curtos da semana.
- `dstOffset()`: retorna offset do horario de verao local em minutos.

### Diferencas entre datas

- `secondsBetween(pDateI, pDateF)`
- `minutesBetween(pDateI, pDateF)`
- `hoursBetween(pDateI, pDateF)`
- `daysBetween(pDateI, pDateF)`
- `monthsBetween(pDateI, pDateF)`
- `yearsBetween(pDateI, pDateF)`
- `workingDaysBetween(pDateI, pDateF)`
- `holidays(pDateStart, pDateEnd)`: conta apenas feriados em dias normalmente uteis.
- `weekends(pDateStart, pDateEnd)`: conta sabados e domingos.
- `diff(pDateI, pDateF, pUnit)`: diferenca generica por unidade.
- `daysInMonth(pDate)`
- `daysInYear(pDate)`
- `workingDaysInMonth(pDate)`
- `workingDaysInYear(pDate)`

### Operacoes de calendario

- `addSeconds(pDate, pSeconds)`
- `addDays(pDate, pDays)`
- `addWorkingDays(pDate, pDays)`
- `addMonths(pDate, pMonths)`
- `addYears(pDate, pYears)`
- `add(pDate, pValue, pType)`: atalho por unidade.
- `anniversary(pDateBirth, pTargetDate = null)`: projeta aniversario para a data alvo.
- `nextMonthAnniversary(pDate, pTargetDate = null)`: projeta aniversario do proximo mes.
- `startOf(pType, pDate)`: inicio da unidade.
- `endOf(pType, pDate)`: fim da unidade.

### Agenda e recorrencia

- `schedule(pDate, pFunction)`: agenda execucao com `setTimeout`.
- `setIntervalAfterRun(pFunction, pMilliseconds)`: executa imediatamente e depois em intervalo.

### Semanas

- `weekOfMonth(pDate)`
- `weekOfYear(pDate)`
- `weekOf(pDate)`: retorna semanas relativas ao mes e ao ano.

### Observacoes importantes

- O modulo depende de dados de feriados do `investira.data`.
- A contagem de feriados e finais de semana segue regras internas do locale ativo.
- `scheduleToDate` e `tasks` foram desenhados para trabalhar juntos.

## formats

Formata valores numericos, datas, duracoes e enderecos em formatos amigaveis.

### Constantes

- `LOCALE`
- `CURRENCY`
- `DIM_NUMBER`
- `DIM_BYTE`

### Metodos

- `locale(pLocale = 'UTC')`: define locale do `moment`.
- `formatNumber(pValue, pDecimals = 2, pSeparateThousand = false, pShowCurrency = false)`: formata numeros com locale.
- `formatLeadingZeros(pNumber, pSize = 2)`: preenche com zeros a esquerda.
- `friendlyNumber(pValue, pDecimalPlaces = 0, pShowCurrency = false, pBase = null)`: simplifica para `mil`, `mi`, `bi` etc.
- `friendlyByte(pValue, pDecimalPlaces = 0)`: simplifica bytes em `KB`, `MB`, `GB` etc.
- `formatDate(pDate)`: atalho para `DD/MMM/YY`.
- `formatPhone(pNumber, pDDD = '', pDDI = '')`: mascara telefone simples.
- `formatDateCustom(pDate, pFormat)`: formata usando `moment`.
- `getRelativeTime(pValue, pKey = 'd')`: devolve texto relativo da unidade.
- `slugPeriod(pYear = 0, pMonth = 0, pDay = 0)`: retorna objeto com periodos por extenso.
- `friendlyDate(pValue, pType = 'd')`: converte um prazo em texto amigavel.
- `friendlyBetweenDates(pDateI, pDateF)`: descreve o periodo entre duas datas.
- `fromNow(pDate)`: data informada em relacao ao agora.
- `toNow(pDate)`: agora em relacao a data informada.
- `duration(pMilliseconds)`: descreve duracao como texto humano.
- `site(pUrl)`: limpa URL mantendo o path.
- `toBytes(pValue, pBase = 1024)`: converte tamanhos textuais para bytes.

### Exemplo

```js
const { formats } = require('investira.sdk');

formats.formatNumber(1234.5, 2, true); // 1.234,50
formats.friendlyNumber(1234000, 2); // 1,23 mi
formats.friendlyBetweenDates('2024-01-01', '2024-03-15'); // 2 meses e 14 dias
```

## httpRequests

Camada de requests baseada em `axios`, com tratamento padronizado de erro, cancelamento e upload.

### Metodos de request

- `request(pMethod, pProps, pFullResponse = false)`: metodo base.
- `requestGET(pProps, pFullResponse = false)`
- `requestPOST(pProps, pFullResponse = false)`
- `requestPUT(pProps, pFullResponse = false)`
- `requestDELETE(pProps, pFullResponse = false)`
- `requestPATCH(pProps, pFullResponse = false)`

### Estrutura de `pProps`

- `url`
- `headers`
- `params`
- `data`
- `timeout`
- `cancelToken`
- `responseType`
- `contentType`
- `rejectUnauthorized`
- `onDownloadProgress`
- `onUploadProgress`

### Metodos auxiliares

- `getRemoteAddress(req)`: IP original a partir de `x-forwarded-for` ou conexao.
- `getLocalAddress(req)`: IP local do socket.
- `getRemoteProxyAddress(req)`: IP do proxy remoto.
- `getAddress(pAddress)`: normaliza enderecos IPv4 e localhost.
- `hasConnection(pUrl = 'https://investira.com.br', pTimeout = null)`: testa conectividade com `HEAD`.
- `cancelToken()`: retorna `axios.CancelToken.source()`.
- `upload(pOptions)`: faz upload multipart com `FormData`.
- `assertFields(pData, pFields = [])`: valida campos obrigatorios e lanca `BadRequestError`.

### Contrato de erros

`request()` pode rejeitar com:

- `RequestCanceled`
- `NoResponse`
- `BasicMessageError`

### Comportamento do retorno

- quando `pFullResponse = false`, o metodo resolve com `{ ...response.data, status: response.status }`;
- quando `pFullResponse = true`, retorna a resposta completa do `axios`.

## invests

Funcoes financeiras para valor presente, valor futuro, parcela, taxa e prazo.

### Metodos

- `pvif({ i, n })`: fator de valor presente, equivalente a `(1 + i) ^ n`.
- `pv({ i, n, pmt, fv, decimals })`: calcula valor presente.
- `nper({ i, pmt, pv, fv, type })`: calcula numero de periodos.
- `i({ n, pmt, pv, fv, type, decimals })`: calcula taxa aproximada por busca iterativa.
- `pmt({ i, n, pv, fv, type, decimals })`: calcula valor da parcela.
- `fv({ i, n, pmt, pv, type, decimals })`: calcula valor futuro.
- `fvs(pData, pAbort = () => false)`: gera serie de valores futuros por periodo.

### Convencoes importantes

- `i` e fornecida em percentual, nao em decimal. Exemplo: `7` representa `7%`.
- `type = 0` representa pagamento no fim do periodo.
- `type = 1` representa pagamento no inicio do periodo.
- o modulo usa `numbers.round` para controlar arredondamento.

### Exemplo

```js
const { invests } = require('investira.sdk');

const xFV = invests.fv({
    i: 1,
    n: 12,
    pmt: -500,
    pv: 0,
    type: 0,
    decimals: 2
});
```

## numbers

Utilitarios numericos com foco em conversao e reducao de residuos de ponto flutuante.

### Constantes

- `PICircle`
- `PICircleFactor`

### Metodos

- `round(pValue, pDecimals)`: arredonda com apoio dos metodos internos de precisao.
- `trunc(pValue, pDecimals)`: trunca sem arredondar.
- `onlyNumbers(pString, pNullValue = null)`: remove tudo que nao for digito.
- `toNumber(pValue, pDecimalPointIsComma = false, pNullValue = null)`: converte para numero, inclusive formato brasileiro.
- `toSqlNumber(pValue, pNullValue = null)`: remove zeros desnecessarios para persistencia textual.
- `add(pValue1, pValue2)`: soma com tratamento de casas decimais.
- `sub(pValue1, pValue2)`: subtracao com tratamento de casas decimais.
- `mul(pValue1, pValue2)`: multiplicacao com tratamento de casas decimais.
- `div(pValue1, pValue2)`: divisao com tratamento de casas decimais.
- `pow(pValue1, pValue2)`: exponenciacao.
- `sumValues(pValues)`: alias deprecated de `sum`.
- `sum(pValues)`: somatorio.
- `weightedMean(pValues, pWeights)`: media ponderada.
- `avg(pValues)`: media aritmetica.
- `countDecimals(pValue)`: quantidade de casas decimais, inclusive notacao cientifica.
- `apart(pValue)`: separa em `{ sign, int, dec }`.
- `lerp(pValue1, pValue2, pRate)`: interpolacao linear.
- `percentile(pValues, pPercentile)`: percentil de um array.

### Observacoes

- O modulo nao implementa `BigDecimal`; ele melhora varios cenarios comuns, mas nao zera todo erro binario possivel.
- `toNumber` aceita strings com virgula decimal quando `pDecimalPointIsComma = true`.

## objects

Utilitarios para shape, limpeza, merge e comparacao de objetos.

### Criacao e conformidade

- `objectFromPropertyAndValue(pProperty, pValue)`: cria objeto simples com uma propriedade.
- `objectFromString(pString)`: gera objeto aninhado a partir de `a.b.c`.
- `objectComplianceWithArray(pSource, pProperties)`: mantem apenas chaves existentes no array.
- `objectCompliance(pModel, pTarget)`: filtra recursivamente de acordo com um modelo.

### Limpeza

- `deleteEmpty(pObject)`: remove apenas objetos filhos vazios.
- `deleteNull(pObject)`: remove campos vazios, nulos e filhos vazios.
- `deleteZeros(pObject)`: remove campos vazios, nulos, falsy e filhos vazios.

### Conversao e acesso seguro

- `objectToQueryString(pObject = {})`: gera querystring.
- `getNotNull(pElement, pDefaultValue)`: fallback para valor nulo.
- `getNotEmpty(pElement, pDefaultValue = '')`: fallback para valor vazio.
- `getValueAs(pValue, pType)`: tenta converter para `string`, `number`, `date`, `datetime` ou `object`.

### Copia, merge e diff

- `deepCopy(pSource)`: copia profunda por serializacao JSON.
- `deepMerge(pTarget, pSource, pOptionsArgument = null)`: merge profundo.
- `deepMergeAll(pArray, pOptionsArgument)`: merge sequencial de varios objetos.
- `emptyTarget(pValue)`: retorna `[]` ou `{}`.
- `cloneIfNecessary(pValue, pOptionsArgument)`: clona quando `clone = true`.
- `defaultArrayMerge(pTarget, pSource, pOptionsArgument)`: merge padrao de arrays.
- `mergeObject(pTarget, pSource, pOptionsArgument)`: merge profundo de objetos simples.
- `getDiff(pCurrentData, pNewData, pOnMerge = null)`: compara com `deep-diff`.

### Comparacao e tamanho

- `getSize(pObject)`: quantidade de propriedades diretas.
- `isEqual(pObj1, pObj2)`: comparacao recursiva suportando objetos, arrays, `Date` e `RegExp`.

### Observacoes

- `deepCopy` nao preserva `Date`, `Map`, `Set`, funcoes nem referencias circulares.
- `getDiff` pode executar um merge previo caso `pOnMerge` seja informado.

## strings

Ferramentas para normalizacao, escape, serializacao e manipulacao textual.

### Metodos

- `replaceAll(pSource, pOld, pNew)`: substitui todas as ocorrencias.
- `escapeRegExp(pSource)`: escapa texto para uso em regex.
- `escapeHtml(pValue)`: escapa `&`, `<`, `>`, `"` e `'`.
- `toString(pValue, pNullValue = null)`: converte para string com `trim`.
- `removeEnclosure(pString)`: remove primeiro e ultimo caractere.
- `splitFullName(pFullName)`: divide nome em `{ first, middle, last }`.
- `toTitleCase(pString)`: formata como nome proprio com regras de conectivos e romanos.
- `querystringToObject(pString)`: converte querystring simples em objeto.
- `whitespacesCleaner(pString)`: colapsa espacos.
- `onlyAlphas(pString)`: mantem apenas letras ASCII e espacos.
- `stringToQuery(pString)`: transforma texto em array de termos com `%` para `LIKE`.
- `stringify(pValue, pReplacer, pSpace)`: serializa com `flatted`, suportando referencias circulares.
- `joinWords(pWords, pSeparator = ', ', pLastSeparator = ' e ')`: junta lista em texto humano.

### Exemplo

```js
const { strings } = require('investira.sdk');

strings.toTitleCase('robert mariano de faria silva');
strings.stringToQuery('renda fixa,tesouro selic');
strings.joinWords(['A', 'B', 'C']);
```

## rags

Utilitarios para preparar texto para RAG, embedding e busca semantica.

### Objetivo do modulo

O modulo preserva o texto base normalizado e pode anexar uma linha `aliases:` com variacoes semanticamente uteis.

### Metodos

- `extractAliases(pText, pOptions = {})`: funcao principal de enriquecimento textual.
- `extractAccentlessAliases(pText)`: gera versoes sem acento.
- `extractNumericAliases(pText)`: gera aliases canonicos para numeros relevantes.
- `extractDateAliases(pText)`: gera aliases para datas em formatos equivalentes.
- `extractAlphanumericCodeAliases(pText)`: remove separadores de codigos como `NTN-B`, `LCI-2029` etc.
- `clearText(pValue)`: normaliza texto para embedding e busca.

### `extractAliases` aceita opcoes

- `numeric = true`
- `date = true`
- `alphanumericCode = true`
- `accent = false`
- `maxAliases = 20`
- `maxAlphanumericCodeAliases = 8`
- `maxDateAliases = 8`
- `maxNumericAliases = 8`
- `maxAccentAliases = 4`

### Exemplo

```js
const { rags } = require('investira.sdk');

const xText = rags.extractAliases('Tesouro IPCA+ 15/05/2035 - NTN-B 2035');
```

### Observacoes

- `clearText` aplica normalizacao Unicode `NFKC`, minusculas em `pt-BR`, remocao de HTML, entidades e espacos excedentes.
- O modulo foi desenhado para melhorar recuperacao, nao para reescrever o texto original de negocio.

## responses

Padroniza leitura e montagem de respostas com `data`, `pages`, `message` e `error`.

### Metodos de leitura

- `getObjData(pResp, pKey)`: le `pResp.data[pKey]` ou `pResp.data`.
- `getObjFullData(pResp, pKey)`: le `pResp.data.data[pKey]` ou `pResp.data.data`.
- `getObjPages(pResp, pKey)`: le `pages`.
- `getObjMessage(pResp, pKey)`: le `message`.
- `getMessageText(pResp)`: retorna `message.description`.
- `getMessageCode(pResp)`: retorna `message.code.status`.
- `getError(pResp, pKey)`: le `error`.
- `getStatusCode(pResp)`: retorna `status`.
- `getErrorCode(pResp)`: retorna `error.code.status` ou `500`.
- `getErrorText(pResp)`: retorna `error.description`.
- `getSeries(pResp, pIndex)`: retorna `data.series` ou `data.series[pIndex].data`.

### Metodos de montagem

- `serviceDataResponse(pMainResult, pClauses = null, pReferenciaFuncao = null, pArrayToObjectParams = null)`: prepara payload com `data` e opcionalmente `pages.total_items`.
- `routeDataResponse(pResult = {}, pMessage = null)`: garante resposta no formato `{ data, pages?, message? }`.

### Comportamento de `serviceDataResponse`

- se `pClauses?.limit?.size` existir, o metodo pode:
  - converter array em objeto;
  - buscar total de itens por funcao ou promise;
  - retornar `{ data, pages: { total_items } }`.

### Observacoes

- O modulo assume contratos de resposta relativamente rigidos.
- `getMessageCode` espera que `message.code` exista.

## themes

Deriva palettes completas a partir de uma cor principal mantendo relacoes semanticas do tema de referencia.

### Constantes

- `DEFAULT_THEME_REFERENCE`
- `DEFAULT_THEME_REFERENCE_DARK`

Cada palette derivada trabalha com:

- `primary`
- `primary_dark`
- `primary_soft`
- `primary_soft_border`
- `panel`
- `text`
- `text_muted`
- `link`

### Metodos

- `buildThemeFromPrimaryColor(pPrimaryColor, pThemeReference = DEFAULT_THEME_REFERENCE, pOptions = {})`
- `normalizeHexColor(pColor, pFallback = '#000000')`
- `hexToHsl(pColor)`
- `hslToHex(pColor)`

### Opcoes de `buildThemeFromPrimaryColor`

- `background_mode`: `light` ou `dark`
- `dark_background`: `true` para forcar base escura

### Observacoes

- O segundo parametro pode ser usado como atalho de options quando o objeto nao se parece com um tema de referencia.
- O modulo preserva as distancias de hue, saturacao e luminosidade do tema-base.

## validators

Conjunto de validadores de tipo, conteudo e interpretacao booleana.

### Metodos

- `isEqual(pElementA, pElementB)`: compara serializacao JSON.
- `isNull(toValidate)`: `null`, `undefined` ou string `"null"`.
- `isEmpty(toValidate)`: vazio para strings, arrays e objetos.
- `isObject(toValidate)`: objeto literal.
- `isString(toValidate)`: tipo real `string`.
- `isJSONString(toValidate)`: string com JSON valido.
- `isArray(toValidate)`: `Array.isArray`.
- `isUndefined(toValidate)`: `undefined` real ou string `"undefined"`.
- `isBoolean(toValidate)`: tipo real `boolean`.
- `isNumber(toValidate)`: tipo real `number` e nao `NaN`.
- `isDate(toValidate)`: instancia valida de `Date`.
- `isSymbol(toValidate)`: `Symbol`.
- `isFunction(toValidate)`: function ou async function.
- `isMergeable(toValidate)`: objeto puro apto a merge.
- `isLengthGreaterThen(length)`: fabrica de validador por `length`.
- `trueTypeOf(toValidate)`: tipo real em minusculas.
- `isEmail(pEmail)`: valida email com regex do projeto.
- `isTrue(pValue)`: aceita `1`, `-1`, `"1"`, `"-1"`, `true` e `"true"`.

### Observacoes

- `isEqual` depende da ordem gerada por `JSON.stringify`.
- `isNumber` nao converte string numerica.

## spellChecker

Corretor textual baseado em dicionarios de `investira.data`.

### Propriedade

- `locale`: padrao `br`

### Metodos

- `check(pString)`: aplica correcoes por silabas, palavras, finais, frases e sufixos empresariais.
- `checkTitleCase(pString)`: faz `toTitleCase` antes da correcao.

### Regras internas observadas

- normaliza repeticoes de espaco;
- consulta `dataDictionaries` por locale;
- corrige finais como `Ltda`, `S.A.`.

### Falhas esperadas

- lanca `InvalidData` quando a entrada nao e string;
- falha quando o locale nao existe no dicionario.

## messages

Colecao de classes de mensagem padronizadas por grupo HTTP e de negocio.

### Grupos exportados

- `messages.ClientErrors`
- `messages.DataErrors`
- `messages.Info`
- `messages.Redirect`
- `messages.ServerErrors`
- `messages.Success`
- `messages.BasicMessages`

### BasicMessages

- `BasicMessage`
- `BasicMessageError`
- `BasicMessageSuccess`

Todos herdam de `Error` e usam propriedades como:

- `isBasicMessage`
- `name`
- `description`
- `status`
- `code.status`
- `code.source`
- `code.ref`
- `detail`

### Success

- `OkMessage`: `200`
- `CreatedMessage`: `201`
- `AcceptedMessage`: `202`
- `NonAuthoritativeInformationMessage`: `203`
- `NoContentMessage`: `204`
- `ResetContentMessage`: `205`
- `PartialContentMessage`: `206`

### Info

- `ContinueMessage`: `100`
- `SwitchingProtocolMessage`: `101`

### Redirect

- `MultipleChoiceMessage`: `300`
- `MovedPermanentlyMessage`: `301`
- `FoundMessage`: `302`
- `SeeOtherMessage`: `303`
- `NotModifiedMessage`: `304`
- `TemporaryRedirectMessage`: `307`
- `PermanentRedirectMessage`: `308`

### ClientErrors

- `BadRequestError`: `400`
- `UnauthorizedError`: `401`
- `PaymentRequiredError`: `402`
- `ForbiddenError`: `403`
- `NotFoundError`: `404`
- `MethodNotAllowedError`: `405`
- `NotAcceptableError`: `406`
- `ProxyAuthenticationRequiredError`: `407`
- `RequestTimeoutError`: `408`
- `ConflictError`: `409`
- `GoneError`: `410`
- `LengthRequiredError`: `411`
- `PreconditionFailedError`: `412`
- `PayloadTooLargeError`: `413`
- `URITooLongError`: `414`
- `UnsupportedMediaTypeError`: `415`
- `RequestedRangeNotSatisfiableError`: `416`
- `ExpectationFailedError`: `417`
- `ImATeapotError`: `418`
- `MisdirectedRequestError`: `421`
- `UnprocessableEntityError`: `422`
- `LockedError`: `423`
- `FailedDependencyError`: `424`
- `UpgradeRequiredError`: `426`
- `PreconditionRequiredError`: `428`
- `TooManyRequestsError`: `429`
- `RequestHeaderFieldsTooLargeError`: `431`
- `UnavailableForLegalReasonsError`: `451`
- `RequestCanceled`: `404`

### ServerErrors

- `InternalServerError`: `500`
- `NotImplementedError`: `501`
- `BadGatewayError`: `502`
- `ServiceUnavailableError`: `503`
- `GatewayTimeoutError`: `504`
- `HTTPVersionNotSupportedError`: `505`
- `NetworkAuthenticationRequiredError`: `511`
- `NoResponse`: `500`

### DataErrors

- `GeneralDataError`: `400`
- `Deadlock`: `400`
- `DuplicateEntry`: `400`
- `InvalidData`: `400`
- `TableNotFound`: `400`
- `ColumnNotFound`: `400`
- `UKRequired`: `400`
- `ConnectionRequired`: `400`
- `QueryConditionsRequired`: `400`
- `ColumnRequired`: `400`
- `DataNotFound`: `400`

### Exemplo

```js
const { messages } = require('investira.sdk');

throw new messages.ClientErrors.BadRequestError('Parametro obrigatorio ausente');
```

## dataModel

Fabrica de `Proxy` para objetos tipados por declaracao.

### Assinatura

```js
const xModel = dataModel(pSource = {}, pOptions = { strict: false, convert: false });
```

### Modelo esperado

Cada propriedade do modelo pode declarar ao menos:

```js
{
    campo: {
        type: 'string'
    }
}
```

Tipos mencionados no proprio arquivo:

- `number`
- `string`
- `date`
- `datetime`
- `array`
- `email`
- `title`
- `object`

### Opcoes

- `strict = false`: quando `true`, impede novos campos fora do modelo.
- `convert = false`: quando `true`, tenta converter o valor automaticamente.

### Comportamento do proxy

- no `get`, retorna `value` da propriedade, nao o metadado;
- no `set`, valida o tipo e opcionalmente converte;
- em modo nao estrito, cria novas chaves automaticamente;
- em modo estrito, ignora atribuicao de chave desconhecida;
- `deleteProperty`, `has` e `ownKeys` foram customizados.

### Exemplo

```js
const { dataModel } = require('investira.sdk');

const xUser = dataModel(
    {
        client_id: { type: 'number' },
        client_name: { type: 'string' },
        birth_date: { type: 'date' }
    },
    {
        strict: true,
        convert: true
    }
);

xUser.client_id = '10';
xUser.client_name = 'Ricardo';
```

## Plugins executados no load

Ao importar o pacote principal, o arquivo `lib/plugins/index.js` executa automaticamente os plugins registrados.

Hoje existe o plugin de `Date`:

- `Date.prototype.toSql()`
- `Date.prototype.isHoliday()`

Esse comportamento e global para o processo Node.
