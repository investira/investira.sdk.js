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
-   [dates] Retorna null quando date e format forem informados e date ou format for vázio
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

# 1.2.1
