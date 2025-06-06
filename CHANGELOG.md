# 1.0.5

-   [formats.friendlyNumber] Correção para números < 1;
-   [dates] Opção de cálculo absoluto na diferença entre datas;
-   [dates] retorno padronizado para Date;
-   [dates] isHoliday - para verificar se data é fériado;
-   [dates] daysBetweenProrata - Retorna quantidade de dias uteis de um período;
-   [arrays] Novo módulo com seek para buscar o valor mais próximo, por busca binária.

# 1.0.6

-   [dates] e [formats] Utilização da lib moment-with-locales;
-   [dates] Alteração de daysBetweenProrata para workingDaysBetween
-   [formats] Correção do formatDate
-   [dates] Novas funções: workingDaysInMonth, workingDaysInYear, daysInMonth e daysInYear
-   [numbers] lerp - Interpolação linear

# 1.0.7

-   [dates] Nova função: nextMonthAniversary
-   [numbers] Nova função: pow
-   [axios] Atualização de versão 0.18.1

# 1.0.8

-   [numbers] Novas funções: sumValues e weightedMean(média ponderada)
-   [objects] Nova função: objectToQueryString
-   [httpRequests] e [validators] Move hasConection para httpRequest
-   [numbers] bug: Correção da verificação se número foi informado em pvCalc
-   [responses] Nova função: getSeries

# 1.0.9

-   [formats] Nova função: friendlyBetweenDates

# 1.0.10

-   [formats] e [dates] Retirada de referência cruzada
-   [formats] friendlyBetweenDates refactor dos cálculos e inclusão da "x anos e y dias"

# 1.0.11

-   [formats] Nova função: getRelativeTime
-   [formats] slugPeriod: adiciona suporte a internacionalização

# 1.0.12

-   [spellChecker] Novo módulo de correção ortográfica
-   [httpRequests] Nova função para retornar o cancelToken, permitindo o cancel do request
-   [dates] Função to date com parametro opcional informando qual a formatação da data informada
-   [objects] objectCleanup renomeado para objectCompliance
-   [objects] Nova função deleteEmpty para excluir itens vázios de um objeto
-   [formats] formatId renomeado para formatLeadingZeros

# 1.1.0

-   [object] Função deleteEmpty recursiva
-   [object] Função objectCompliance renomeada para objectComplianceWithArray
-   [object] Nova função objectCompliance
-   [array] Nova função arrayComplianceWithArray

# 1.1.1

-   [array] arrayComplianceWithArray com teste de null

# 1.1.2

-   [validators] Nova função: isEqual
-   [dates] Retirada do teste isEmpty no toDate

# 1.1.3

-   [dates] Nova função schedule para agendamento de execução de função
-   [dates] Retorna null quando date e format forem informados e date ou format for vazio
-   [dates] Nova função 'addWorkingDays' para retornar data acrescida de dias úteis
-   [dates] Nova função 'isWorkingDay' para retornar se é dia útil
-   [dates] Correção de cálculo de dias úteis para datas retroativas
-   [dates] Nova função 'toSqlDatetime'
-   [dates] Correção de cálculo de diferença de datas em horário de versão
-   [DataError] Inclusão mensagem 'Deadlock'
-   [format] Nova função 'formatPhone' para formatar telefones
-   [format] Nova função 'fromNow' e 'toNow' para formatar intervalos de data de forma humanizada
-   [httpRequest] fix: alguns 'request' com erros retornavam como resolve
-   [httpRequest] 'hasconnection' utilizando 'HEAD' para ganho de performance
-   [numbers] Nova função 'onlyNumbers' para retornar somente os números de uma string
-   [string] Nova função 'removeEnclosure' para remover invólucro da string
-   [string] toTitleCase - Otimização: Constantes declaradas uma única vez
-   [validatros] isFunction também testa asyncfunction
-   [tasks] Novo módulo para controlar tarefas

# 1.2.0

-   [package] Correção de dependência com investira.data

# 1.2.2

-   [package] Correção de publicação

# 1.2.3

-   [httpRequest] Add: suporte a cancelToken
-   [messages] Nova mensagem: RequestCanceled, mensagem de erro padrão para request cancelado

# 1.2.4

-   [objects] 'deleteEmpty' exclui somente objetos vázios

# 1.2.5

-   [DataErros] Nova mensagem ColumnRequired
-   [object] Novo função 'deleteNull'

# 1.2.6

-   [httpRequest] Correção do nome da função hasConnection

# 1.2.7

-   [objects] 'deepMerge' com parametro optional
-   [array] 'arrayComplianceWithArray' com nome podendo ser o primeiro item de um array

# 1.2.8

-   [numbers] Novo parametro 'toNumber' indicando se casa decimal é uma vírgula
-   [numbers] 'toNumber' retorna null quando valor string vazia
-   [httpRequests] Possibilidade de configuração do timeout
-   [tasks] Controle de inicio, fim e duração da execução
-   [dates] Nova função 'toSqlTime' para retornar hora:minuto:segundo a partir de milisegundos ou de uma data
-   [dates] Nova função 'isTime' para verificar se string é um hora - HH:MM válida.
-   [dates] Nova função 'scheduleToDate' para retornar a próxima data a partir da data atual considerando os parametros informados
-   [dates] Nova função 'dateToObject' para retornar objeto com os valores data data em hora separados.
-   [dates] Fix: função 'endOf' não estava utilizando UTC
-   [tasks] Novo atributo 'schedules' para efetuar agendamentos da tarefa
-   [tasks] Atributo 'schedules' com opção de execução em dias úteis
-   [tasks] Dispara eventos 'run','running','stopped','enabled','disabled','retry' e 'error'

# 1.2.9

-   [tasks] Atributo 'retries' dentro de state e no evento 'retry'.
-   [tasks] Evento 'error' passa a enviar informações do erro, state e options.
-   [tasks] Utilização de date ao invés de time no startedAt e endedAt.
-   [date] 'schedule' passa a receber função de callback para ser chamada após execução da função agendada.

# 1.2.10

-   [tasks] fix: 'afterStop' passa a retornar uma Promise.
-   [dates] Novos métodos 'areDateTimesEqual' e 'areDatesEqual' para retornar se data são iquais.
-   [dates] 'scheduleToDate' para a poder receber data base que será utilizada para o cálculo da próxima data.
-   [dates] Novo método 'toTime' para retornar timestampo de uma hora em string.

# 1.2.11

-   [tasks] fix: 'getNextDate'.
-   [dates] 'schedule' permite intervalos superiores de 9.4 dias.
-   [dates] fix: Retirado offset(0) de 'startOf' e 'endOf'.
-   [dates] fix: 'toSQLDate' e 'toSQLDateTime' estava convertendo para UTC.

# 1.2.12

-   [numbers] fix: 'toNumber'. Exclui vírgulas antes de converter.
-   [dates] fix: 'dateToObject' estava convertendo em UTC.
-   [dates] fix: 'isWorkingDay' estava convertendo em UTC.

# 1.2.13

-   Somente evolução da versão

# 1.2.14

-   [objects] Nova função <code>getDiff</code> para retornar a diferença entre objetos.

# 1.2.15

-   [objects] <code>getDiff</code> com opção de merge.

# 1.2.16

-   [objects] <code>deleteNull</code> passa a escluir também atributos sem filhos.
-   [spellChecker] Fix: Convertia para titleCase as palavras que em Uppercase que estavam no dicionário.
-   [numbers] Nova função <code>toSqlNumber</code> para converter string contendo número retirando zeros a direita.

# 1.2.17

-   [spellChecker] Fix: Inversão da ordem de chamada da verificação do endsWith
-   [numbers] Fix <code>toSqlNumber</code>

# 1.2.18

-   [investira.data] Alterado para peer dependency

# 1.2.19

-   [BasicMessages] Inclusão da descrição da mensagem

# 1.2.20

-   [validators] Nova função <code>isEmail</code>

# 1.2.21

-   [httpRequests] Inclusão do atributo <code>rejectUnauthorized</code>
-   [BasicMessage] Com atributos isBasicMessage, isBasicMessageSuccess e isBasicMessageError

# 1.2.22

-   [arrayToObject] Inclusão de parametro com prefixo a ser adicionado a todas as chaves
-   [querystringToObject] Nova função <code>querystringToObject</code>
-   Atualização de segurança

# 1.2.23

-   [strings] Nova função <code>whitespacesCleaner</code>
-   [strings] Nova função <code>stringToQuery</code>

# 1.2.24

-   [strings] <code>stringToQuery</code>: Teste se valor recebido já um array

# 1.2.25

-   [formats] Nova função <code>duration</code>
-   [tasks] Exclusão de console.log e schedule inicial chamado com settimeout
-   [validators] Otimização do isNull

# 2.0.0

Refactor de todas as mensagens padrão.
O contrutor para a criação das mensagem foi alterado.

# 2.0.1

-   [BasicMessages] Verificação de mensagem nula

# 2.0.2

-   [tasks] State.error com valor original do erro
-   [BasicMessages] JSON.stringify caso mensagem seja um objeto

# 2.0.3

-   [tasks] Emite evento 'running' caso seja chamado o run() e a execução já esteja em andamento
-   [tasks] Reseta erro somente antes da execução

# 2.0.4

-   [stringToQuery] Retirada do trim

# 2.0.6

-   [tasks] Retry com chamada por setImmediate
-   [strings] Novo método <code>stringify</code>

# 2.0.7

-   [httpRequests] Padronização da resposta de erro

# 2.0.8

-   [clientError] Correção do código de erro para a mensagem <code>RequestCanceled</copde>

# 2.0.9

-   [serverErros] Correção do código de erro para a mensagem <code>NoResponse</copde>

# 2.0.10

-   [dates] <code>toDate</code>Verificação se data é conversível antes de chamar o moment para evitar erro no moment

# 2.0.11

-   [investira.data] Atualização

# 2.0.12

-   [investira.data] Atualização

# 2.0.13

-   [dates] Correção do <code>addWorkingDays</code> para dias anteriores
-   [matrix] Novo objeto

# 2.0.14

-   [matrix] Substituição das funções <code>cols e rows</code> por <code>col e row</code>.
-   [numbers] Inclusão de função <code>percentil</code>.

# 2.0.15

-   [numbers] Inclusão da função <code>avg</code> para cálculo de valor médio.
-   [numbers] Inclusão da função <code>sum</code> como alternativa a sumValues.

# 2.0.16

-   [validators] Inclusão da função <code>isTrue</code>.

# 2.0.17

-   [numbers] Inclusão da função <code>countDecimals</code>.

# 2.0.18

-   [arrays] Inclusão da função <code>toArray</code>.

# 2.0.19

-   [responses] Inclusão da função <code>serviceResultWithPagesTotalItems</code>.
-   [responses] Inclusão da função <code>routeDataResponse</code>.

# 2.0.20

-   [responses] Retorna objeto vázio quando data for null no <code>routeDataResponse</code>.

# 2.0.21

-   [responses] Alteração do nome da função <code>serviceResultWithPagesTotalItems</code> para <code>serviceDataResponse</code>.

# 2.0.22

-   [responses] Alteração <code>serviceDataResponse</code> para receber promise(pending).

# 2.1.0

-   [dates] Correção da função <code>scheduleToDate</code> para intervalo com dia da semana.

# 2.1.1

-   [dates] Novas correções da função <code>scheduleToDate</code> para intervalo com dia da semana.

# 2.1.2

-   [validators] Correção do <code>isNumber</code> para lidar com <code>NaN</code>.
-   [validators] Correção do <code>querystringToObject</code> para fazer o encode correto de uma url pela segunda vez.

# 2.1.4

-   [axios] Atualização de versão

# 2.1.5

-   [dates] Nova função <code>dstOffset</code> para retorar o offset do horário de verão
-   [dates] Nova função <code>intlOptions</code> para retorar a configuração local do calendário
-   [arrays] Retirada do Object.assign para pertimir arrays maiores

# 2.1.6

-   [arrays] Correção da função <code>seek</code>

# 2.1.7

-   [dates] Função <code>locale</code> verifica se configuração atual já é igual ao selecionada.

# 2.1.8

-   [tasks] Impedir a criação de novo schedule quando já existir um ativo

# 2.1.9

-   [tasks] Correção quando não há schedule

# 2.1.10

-   [arrays] Retirada, novamente, do Object.assign para pertimir arrays maiores

# 2.1.11

-   [tasks] Retirada do object.freeze para salvar as opções da tarefa

# 2.1.12

-   [responses] Função 'routeDataResponse' trata message

# 2.1.13

-   [tasks] Retirada dos console.log

# 2.1.14

-   [tape] Atualização de dependência

# 2.1.15

-   [responses] Inclusão de tratamento de erro

# 2.2.0

-   Limitado a versão 14.17.5 do node

# 2.2.1

-   [dates] Correção do dia da função <code>scheduleToDate</code> com type= 'Y'
-   [axios] Atualização 0.2.14
-   [flatted] Atualização

# 2.2.2

-   [axios] Retorno para 0.2.12 por problema no json

# 2.2.3

-   [httpRequest] Retirada do envio de null dos atributos headers, params, data e cancelToken
-   [axios] Atualização para 0.2.14

# 2.2.4

-   [strings] Inclusão de função <code>onlyAlphas</code>.
-   [httpRequests] hasConnection rejectUnauthorized = false

# 2.2.5

-   [BasicMessages] <code>BasicMessageSuccess</code> e code>BasicMessageError</code> repassam atributo <code>error</code> se existir

# 2.2.6

-   [BasicMessages] <code>BasicMessageSuccess</code> e code>BasicMessageError</code> com tratamento na descrição da mensagem

# 2.2.7

-   [BasicMessages] <code>BasicMessage</code> verifica se mensagem recebida já é uma basicMessage

# 2.2.8

-   [axios] Atualização da versão "0.21.4" versão para "0.25.0"

# 2.2.9

-   [moment] Atualização da versão "2.24.0" versão para "2.29.3"
-   [tape] Atualização da versão "4.15.0" versão para "4.15.1"

# 2.2.10

-   [moment] Atualização da versão "2.24.0" versão para "2.29.4"

# 2.2.11

-   [investira.data] Atualização

# 2.2.12

-   [investira.data] Atualização

# 2.2.13

-   [investira.data] Controle de vigência do feriado

# 2.2.14

-   [investira.data] Controle de vigência do feriado

# 2.2.15

-   [numbers] Aumento da precisão do trunc e do round
-   [formats] Substituicão do trimRight por trimEnd no friendlyNumber

# 2.3.0

-   [nodejs] 18.12

# 2.3.1

-   [investira.data] Atualização do investira.data

# 2.3.2

-   [dates] Nova função setIntervalAfterRun

# 2.3.3

-   [strings] Otimização da função toTitleCase

# 2.3.4

-   Atualização de dependência

# 2.3.5

-   [numbers] Verifica texto 'null' ou 'undefined' na função toNumber

# 2.3.6

-   [arrays] Inclui função removeDuplicated
-   [dates] Nova função anniversary

# 2.3.7

-   [arrays] Inclui função removeDuplicated
-   [dates] Correção do nome da função para nextMonthAnniversary

# 2.3.8

-   [dates] Correção do cálculo de semanas

# 2.3.9

-   [dates] Correção da chamada as constantes

# 2.3.10

-   [dates] Correção da função workingDaysInMonth

# 2.3.11

-   [strings] Nova função joinWords

# 2.3.12

-   [axios] Atualizado
-   [httpRequests] Nova função upload

# 2.3.13

-   [axios] Atualizado

# 2.3.14

-   [axios] Utilização do axios.default.create()

# 2.3.15

-   [dates] addWorkingDays com atributo de para cálcular próxima data ou data anterior quando dias = 0

# 2.3.16

-   [objetcs] Alteração da getDiff

# 2.3.17

-   [objetcs] Alteração da getDiff

# 2.3.18

-   [objetcs] Correção da mergeObject

# 2.3.19

-   [arrays] Método isEqual

# 2.3.20

-   [tasks] Substituido this por self

# 2.3.22

-   [dates] scheduleToDate com seleção do dia da semana, no tipo 'M' e 'Y'.

# 2.3.23

-   [dates] scheduleToDate correção para dia da semana '0' .

# 2.3.24

-   [validators] Otimização do isObject.

# 2.4.0

-   Atualização do Axios

# 2.4.1

-   Atualização do investira.data

# 2.4.2

-   Atualização do investira.data

# 2.4.3

-   [validators] isNull testando também string

# 2.4.4

-   [dates] Retirada do operador '?'.

# 2.4.5

-   Atualização de dependencias

# 2.4.6

-   Atualização de dependencias

# 2.4.7

-   Atualização de dependencias

# 2.4.8

-   Atualização de dependencias

# 2.4.9

-   Atualização de dependencias

# 2.4.10

-   [spellChecker] Novos separadores

# 2.4.10

-   [httpRequests] Upload com timeout

# 2.4.12

-   [dates] addHoliday e removeHoliday

# 2.4.13

-   [numbers] percentile com exclusive e inclusive

# 2.4.14

-   Atualização de dependencias

# 2.4.15

-   Atualização de dependencias

# 2.4.16

-   Atualização de dependencias

# 2.4.17

-   [objects] função 'isEqual'

# 2.4.18

-   [spellChecker] Validação S.A. e Ltda

# 2.4.19

-   [objects] Correção do 'isEqual'

# 2.4.20

-   [objects] Novo deleteZeros
