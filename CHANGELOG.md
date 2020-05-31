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
-   [array] Novam função arrayComplianceWithArray

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
-   [BasicMessages] JSON.stringfy caso mensagem seja um objeto

# 2.0.3

-   [tasks] Emite evento 'running' caso seja chamado o run() e a execução já esteja em andamento
-   [tasks] Reseta erro somente antes da execução

# 2.0.4

-   [stringToQuery] Retirada do trim

# 2.0.6

-   [tasks] Retry com chamada por setImmediate
-   [strings] Novo método <code>stringfy</code>

# 2.0.7

-   [httpRequests] Padronização da resposta de erro
