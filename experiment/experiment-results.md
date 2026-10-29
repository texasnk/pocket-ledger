# Resultados do experimento

O experimento compara três etapas: a linha de base, dois prompts simples executados em sequência e um prompt estruturado. Esta tabela resume a evolução da suíte da API e da cobertura.

| Etapa                           | Abordagem                                                        | Testes da API        | Linhas / instruções c8 | Funções c8 | Ramificações c8 | Mutação                                             | Variação desde a etapa anterior             |
| ------------------------------- | ---------------------------------------------------------------- | -------------------- | ---------------------- | ---------- | --------------- | --------------------------------------------------- | ------------------------------------------- |
| 1 — Linha de base               | Suíte inicial do projeto                                         | 13 testes, 4 suítes  | 50,94% / 50,94%        | 48,78%     | 68,49%          | Dry-run de 689 mutantes; sem pontuação final        | Referência inicial                          |
| 2 — Prompt simples 1            | Testes funcionais das quatro rotas                               | 17 testes, 5 suítes  | 72,77% / 72,77%        | 76,19%     | 74,19%          | Dry-run aprovado; pontuação não medida              | +4 testes; +21,83 p.p. em linhas/instruções |
| 2 — Prompt simples 2            | Testes unitários do domínio, acumulados sobre a rodada anterior  | 22 testes, 6 suítes  | 73,45% / 73,45%        | 78,57%     | 75,39%          | Mutação não executada nesta rodada                  | +5 testes; +0,68 p.p. em linhas/instruções  |
| 3 — Prompt estruturado          | Testes funcionais abrangentes das quatro rotas                   | 43 testes, 8 suítes  | 80,99% / 80,99%        | 85,71%     | 85,38%          | 20 mutantes: 8 mortos, 12 sobreviventes; 40,00%     | +21 testes; +7,54 p.p. em linhas/instruções |
| 4 — Prompt unitário estruturado | Testes unitários isolados de aplicação, domínio, schemas e datas | 90 testes, 18 suítes | 81,26% / 81,26%        | 85,71%     | 90,67%          | 255 mutantes; execução refeita após timeout inicial | +47 testes; +0,27 p.p. em linhas/instruções |

Os percentuais de cobertura são comparáveis entre as rodadas. A natureza dos testes mudou: os prompts simples combinaram testes funcionais e unitários, a fase 3 exigiu cobertura funcional das quatro rotas pela interface HTTP e a fase 4 priorizou unidades isoladas. As pontuações de mutação não são diretamente comparáveis entre a linha de base (dry-run de 689 mutantes), a fase 3 (20 mutantes do escopo configurado) e a fase 4 (255 mutantes do escopo ampliado).

## Histórico das rodadas simples e relatórios atuais

| Fase | Cenário / prompt                                                                                                          | Escopo dos testes e arquivos criados                                                                     | Testes da API       | Linhas / instruções c8 | Funções c8 | Ramificações c8 | Stryker                                                                       | Testes unitários web | E2E Playwright | Observações                                                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------- | ---------- | --------------- | ----------------------------------------------------------------------------- | -------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Linha de base no commit `9e65155815fad99bd1725866468e77f4ac604525`                                                        | Suítes existentes da API, web e E2E                                                                      | 13 testes, 4 suítes | 50,94% / 50,94%        | 48,78%     | 68,49%          | Execução preliminar (dry-run) aprovada; 689 mutantes; sem pontuação final     | 7 aprovados          | 1 aprovado     | A cobertura de código dos testes E2E da interface web não está instrumentada.                                                         |
| 2    | `Gere testes de funcionalidade para rota /transactions, /history, /dashboard e /categories`                               | `apps/api/tests/presentation/financial-routes.functional.test.ts`; SQLite em memória com migrações reais | 17 testes, 5 suítes | 72,77% / 72,77%        | 76,19%     | 74,19%          | Execução preliminar (dry-run) aprovada; pontuação não medida                  | 7 aprovados          | 1 aprovado     | +4 testes da API; +21,83 p.p. em linhas e instruções sobre a linha de base.                                                           |
| 2    | `Gere testes de unidades para as funções na camada de domain das rotas /transactions, /history, /dashboard e /categories` | `apps/api/tests/domain/financial.test.ts`; centavos, transferências e erros de domínio                   | 22 testes, 6 suítes | 73,45% / 73,45%        | 78,57%     | 75,39%          | Execução preliminar não repetida após este prompt; pontuação final não medida | 7 aprovados          | 1 aprovado     | +5 testes da API; `financial.ts` atingiu 100% de cobertura. Histórico, dashboard e categorias não têm funções de domínio específicas. |

Os dois prompts simples foram aplicados em sequência: o primeiro elevou a suíte de 13 para 17 testes; o segundo acrescentou 5, chegando a 22. Depois de registrar as métricas, os arquivos desses prompts foram removidos da suíte ativa. A rodada estruturada partiu novamente do conjunto de testes da linha de base.

| Medição                | Comando                                                                       | Resultado mais recente                                                        |
| ---------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Suíte de testes da API | `pnpm --filter @pocket-ledger/api test`                                       | 90 testes aprovados em 18 suítes; 0 reprovados ou ignorados                   |
| Cobertura da API       | `pnpm --filter @pocket-ledger/api test:coverage`                              | 81,26% linhas e instruções; 85,71% funções; 90,67% ramificações               |
| Testes de mutação      | `pnpm --filter @pocket-ledger/api test:mutation` e execução forçada sem cache | 255 mutantes; 212 mortos, 43 sobreviventes; score de 83,14%; 0 timeouts/erros |
| Suíte unitária web     | `pnpm --filter @pocket-ledger/web test`                                       | 7 testes aprovados                                                            |
| Suíte E2E web          | `pnpm --filter @pocket-ledger/web test:e2e`                                   | 1 teste Playwright aprovado em modo sem interface gráfica                     |

| Relatório               | Caminho relativo                           | Situação                                                                                     |
| ----------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Cobertura c8            | `apps/api/C8_COVERAGE_REPORT.html`         | Gerado após a execução mais recente do c8                                                    |
| Testes de mutação       | `apps/api/MUTATION_TEST_REPORT.html`       | 255 mutantes; pontuação de 83,14% (212 mortos, 43 sobreviventes); execução forçada concluída |
| Cobertura do Playwright | `apps/web/PLAYWRIGHT_COVERAGE_REPORT.html` | Indisponível até adicionar instrumentação ao pacote da interface web                         |

## Fase 3 — Prompt estruturado: testes funcionais da API

| Campo                                 | Resultado registrado                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objetivo                              | Criar testes funcionais determinísticos pela API HTTP pública para `/transactions`, `/history`, `/dashboard` e `/categories`, sem alterar o comportamento de produção.                                                                                                                                                                                                                                                                       |
| Prompt utilizado                      | O texto completo está reproduzido no final deste documento.                                                                                                                                                                                                                                                                                                                                                                                  |
| Métodos HTTP cobertos                 | Categorias: `GET`, `POST`, `PATCH /:id`, `DELETE /:id`; transações: `GET`, `POST`, `PATCH /:id`, `DELETE /:id`; histórico: `GET`; dashboard: `GET`. Métodos não suportados seguem a convenção existente `404 {"message":"Route not found."}`.                                                                                                                                                                                                |
| Cenários                              | Criação, consulta, atualização, remoção e persistência; conflito por categoria duplicada; corpo ausente ou inválido; valores financeiros e datas inválidos; paginação, filtros e ordenação inválidos; recursos e relações inexistentes; proteção da relação categoria/transação; totais vazios e preenchidos no dashboard; paginação do histórico; métodos não suportados; conexão SQLite real fechada para verificar resposta `500` segura. |
| Dados de teste                        | `apps/api/tests/fixtures/financial-fixtures.ts`: dados tipados, reutilizáveis e sintéticos, com datas fixas de `2026-10`; sem dados pessoais.                                                                                                                                                                                                                                                                                                |
| Isolamento e falhas de infraestrutura | Cada teste cria seu próprio SQLite em memória, aplica migrações reais do Drizzle, prepara dados pela API HTTP e fecha a conexão em `finally`. Nos testes de falha, a conexão real é fechada antes da requisição. As camadas de persistência, validação, roteamento e tratamento de erros não são simuladas.                                                                                                                                  |
| Comandos executados                   | `pnpm --filter @pocket-ledger/api typecheck`; `pnpm --filter @pocket-ledger/api lint`; `pnpm --filter @pocket-ledger/api test`; `pnpm --filter @pocket-ledger/api test:coverage`; `pnpm --filter @pocket-ledger/api test:mutation`; `pnpm --filter @pocket-ledger/api exec stryker run --force`.                                                                                                                                             |
| Resultado dos testes funcionais       | 43 testes em 8 suítes: 43 aprovados, 0 reprovados, 0 ignorados, 0 cancelados e 0 pendentes.                                                                                                                                                                                                                                                                                                                                                  |
| Resultado da cobertura c8             | Linhas: 80,99% (601/742); instruções: 80,99% (601/742); funções: 85,71% (36/42); ramificações: 85,38% (147/172). Relatório: `apps/api/C8_COVERAGE_REPORT.html`.                                                                                                                                                                                                                                                                              |
| Resultado da mutação                  | Execução forçada concluída: 20 mutantes no escopo configurado `src/domain/**/*.ts`; 8 mortos, 12 sobreviventes, 0 timeouts e 0 erros; pontuação de mutação de 40,00%. O comando normal também passou e reutilizou os resultados incrementais dos 20 mutantes. Relatório: `apps/api/MUTATION_TEST_REPORT.html`.                                                                                                                               |
| Arquivos criados                      | `apps/api/tests/fixtures/financial-fixtures.ts`, `apps/api/tests/helpers/api-test-application.ts`, `apps/api/tests/helpers/http-assertions.ts` e quatro suítes por rota em `apps/api/tests/presentation/`.                                                                                                                                                                                                                                   |
| Arquivos atualizados                  | `experiment/experiment-results.md`, `apps/api/C8_COVERAGE_REPORT.html` e `apps/api/MUTATION_TEST_REPORT.html`.                                                                                                                                                                                                                                                                                                                               |

| Alerta / bug                                                 | Severidade | Evidência                                                                                                                                                              | Impacto                                                                                              | Recomendação                                                                                                               | Situação                                                        |
| ------------------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Métodos não suportados não retornam `405 Method Not Allowed` | Baixa      | `PUT /api/categories`, `PUT /api/transactions`, `POST /api/history` e `POST /api/dashboard` retornam a resposta genérica vigente `404 {"message":"Route not found."}`. | Clientes HTTP não distinguem uma rota desconhecida de um método não suportado.                       | Adicionar tratamento explícito `405` e cabeçalho `Allow` somente se o contrato da API for revisado intencionalmente.       | Registrado; nenhuma alteração de produção solicitada.           |
| O histórico não possui contrato de filtros ou agregações     | Baixa      | `GET /api/history` valida somente `page` e `pageSize`; o controller retorna registros de auditoria e total.                                                            | Consumidores não conseguem filtrar nem agregar o histórico por esta rota.                            | Definir e documentar filtros/agregações antes de implementar ou testar esse comportamento.                                 | Limitação registrada; nenhuma alteração de produção solicitada. |
| Doze mutantes de domínio sobreviveram                        | Média      | A execução forçada do Stryker matou 8 de 20 mutantes (40,00%); 12 sobreviveram no escopo de domínio configurado.                                                       | Os testes de domínio atuais não detectam algumas mutações em mensagens de erro e ramos de validação. | Adicionar asserções focadas para o domínio em uma fase futura do experimento, mantendo o escopo HTTP desta fase funcional. | Registrado; nenhuma alteração de produção solicitada.           |

| Observação de execução | A primeira tentativa do pnpm dentro do sandbox não conseguiu abrir o lock do store local do gerenciador de pacotes (`ERR_PNPM_STORE_DIR_OPEN_OPERATION_LOCK`, acesso negado). Os mesmos comandos de testes e cobertura da API foram executados depois, com sucesso, fora do sandbox. |

## Prompt completo utilizado na fase de testes funcionais da API

```text
Atue como um Testador de Software Sênior, especializado em testes funcionais de APIs backend TypeScript/Node.js.

## Persona

Você é criterioso, orientado a risco e qualidade. Escreve testes claros, determinísticos e independentes, priorizando o comportamento observável pelo cliente da API. Você não altera regras de negócio para facilitar testes e não aceita falsos positivos.

## Regras invioláveis

1. Inspecione a implementação existente, os testes atuais, scripts disponíveis, contratos/DTOs e o padrão vigente de `experiment-result.md` antes de criar ou modificar testes.
2. Teste exclusivamente pela interface HTTP pública das rotas; não teste detalhes internos, funções privadas ou mocks de implementação quando um teste funcional puder cobrir o cenário.
3. Não modifique código de produção, contratos, schemas ou comportamento da API, exceto se for estritamente necessário para corrigir uma falha comprovada pelos testes e estiver dentro do escopo.
4. Não use mocks que eliminem o comportamento real das camadas de validação, roteamento, tratamento de erro ou persistência que devem ser verificadas.
5. Cada teste deve ser independente: preparar seus próprios dados, não depender da ordem de execução e limpar ou isolar estado quando necessário.
6. Crie uma pasta apropriada para fixtures de dados sintéticos, seguindo a organização já praticada no projeto. Os fixtures devem ser reutilizáveis, tipados, determinísticos e não conter dados pessoais reais.
7. Não use dados dependentes de horário atual sem controlar o relógio; evite aleatoriedade não determinística.
8. Não use `any`, não silencie erros, não pule testes, não reduza thresholds de cobertura e não remova testes existentes.
9. Não exponha mensagens, stack traces, nomes de tabelas, queries SQL, paths internos, credenciais ou detalhes do banco de dados nas respostas HTTP.
10. Documente apenas resultados realmente executados. Nunca invente métricas, resultados de testes, cobertura ou mutação.
11. Ao identificar comportamento incorreto, vulnerabilidade, inconsistência de contrato ou lacuna de teste, registre-o como alerta ou bug, com severidade, evidência, impacto e recomendação objetiva.

## Tarefa

Implemente ou complete testes funcionais do backend para as rotas:

- `/transactions`
- `/history`
- `/dashboard`
- `/categories`

Identifique os métodos HTTP efetivamente suportados em cada rota e valide todos eles. Para cada endpoint aplicável, cubra ao menos:

- Caminho de sucesso com status HTTP correto, corpo de resposta válido e persistência/efeito esperado.
- Validação de entrada: corpo ausente, campos obrigatórios ausentes, tipos inválidos, valores inválidos, formatos inválidos e parâmetros de rota/query inválidos, conforme o contrato.
- Recursos inexistentes, retornando o status apropriado e uma resposta segura.
- Métodos HTTP não suportados, garantindo `405 Method Not Allowed` quando essa for a convenção da aplicação, ou o comportamento já estabelecido pelo framework/projeto.
- Cenários de banco de dados indisponível ou com falha inesperada, verificando que a API retorna um erro HTTP seguro e padronizado, sem vazar detalhes técnicos do banco.
- Consistência dos códigos de status: criação, leitura, atualização, exclusão, requisição inválida, recurso ausente e erro interno devem seguir o contrato já adotado pelo projeto.
- Casos de borda relevantes para valores financeiros, datas, filtros, paginação, ordenação, categorias e relações com transações, conforme cada rota suportar.

Para `/transactions`, valide operações de criação, consulta, atualização e remoção que existirem, incluindo associação com categoria, valores monetários, tipo de transação e datas.

Para `/history`, valide a recuperação de histórico, filtros e agregações existentes, assegurando que dados retornados correspondam ao estado persistido.

Para `/dashboard`, valide os indicadores, totais e agregações apresentados, incluindo cenários sem movimentações e combinações de receitas/despesas.

Para `/categories`, valide criação, listagem, atualização e exclusão quando suportadas, incluindo conflitos, categorias inexistentes e impacto em transações relacionadas conforme a regra de negócio existente.

## Boas práticas obrigatórias

- Use nomes de testes descritivos no padrão “deve ... quando ...”.
- Organize os testes por rota e método HTTP.
- Use os fixtures sintéticos criados e helpers/factories já existentes.
- Asserte status, headers relevantes e formato/valores essenciais da resposta.
- Verifique que erros públicos seguem o formato padronizado da aplicação.
- Para falhas internas, asserte explicitamente a ausência de detalhes sensíveis no payload de resposta.
- Mantenha os testes rápidos, legíveis e compatíveis com a estratégia de banco de testes já adotada.
- Execute formatação apenas nos arquivos modificados, conforme as ferramentas e convenções do repositório.

## Validação obrigatória

Ao final da implementação, execute os comandos oficiais definidos pelo repositório para:

1. Testes funcionais/backend.
2. Cobertura de testes.
3. Testes de mutação.

Corrija falhas causadas pelas alterações até que as validações relevantes sejam aprovadas. Caso alguma ferramenta não esteja configurada ou falhe por problema externo ao escopo, registre o comando executado, a saída resumida e a causa real, sem mascarar o problema.

## Documentação final

Atualize `experiment-result.md` respeitando integralmente sua estrutura, estilo, nomenclatura e padrão existentes.

A atualização deve incluir:

- O prompt completo utilizado nesta atividade.
- Objetivo da implementação.
- Rotas, métodos e cenários funcionais cobertos.
- Estratégia de fixtures sintéticos, incluindo o caminho da nova pasta criada.
- Estratégia usada para isolamento de dados e simulação/controle de falhas de infraestrutura, se aplicável.
- Comandos executados.
- Números finais e reais de testes executados, aprovados, reprovados e ignorados.
- Percentuais finais e reais de cobertura.
- Resultado final e score real dos testes de mutação.
- Arquivos alterados.
- Alertas e bugs encontrados, contendo severidade, evidência, impacto, recomendação e status.
- Limitações ou pendências reais, caso existam.
```

## Fase 4 — Prompt estruturado: testes unitários da API

| Campo                                   | Resultado registrado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Objetivo                                | Aumentar a cobertura unitária das regras financeiras, serviço de transações, schemas e utilitários associados às quatro rotas, mantendo dependências externas isoladas e sem mudar produção.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Unidades e endpoints de origem          | `/transactions`: `TransactionService`, regras financeiras e schemas de transação/transferência. `/categories`: schema de categoria. `/history`: schema de paginação. `/dashboard`: schema de mês. Compartilhadas: conversão de datas e classificação de erros SQLite.                                                                                                                                                                                                                                                                                                                                                                               |
| Suíte unitária                          | `apps/api/tests/application/transaction-service.test.ts`, `apps/api/tests/domain/financial.unit.test.ts`, `apps/api/tests/presentation/controllers/schema-api.unit.test.ts`, `apps/api/tests/shared/date.test.ts`, `apps/api/tests/shared/sqlite-error.test.ts`.                                                                                                                                                                                                                                                                                                                                                                                    |
| Fixtures e isolamento                   | `apps/api/tests/fixtures/unit-financial-fixtures.ts` mantém entradas sintéticas, tipadas e sobrescrevíveis. `apps/api/tests/helpers/fake-transaction-repository.ts` implementa a fronteira do repositório sem DB/rede, permite falhas de persistência/transação e verifica rollback/ausência de sucesso parcial. UUIDs são avaliados por igualdade de grupo; não se fixa UUID aleatório. Datas de cenário são literais estáveis.                                                                                                                                                                                                                    |
| BVA executado                           | Dinheiro: 1 centavo, `Number.MAX_SAFE_INTEGER`, zero, negativo, fracionário, infinito e acima do seguro. Parcelas/recorrências: 1, 120, 0, 121, fracionário e exclusão mútua. Strings: limites 1/60/120, espaços, vazio e acima do máximo; cor hexadecimal aceita/rejeitada. Datas: ano bissexto, datas impossíveis, janeiro/dezembro, limites mensais e períodos invertidos aceitos pelo schema atual. Paginação: página 1, página 0/fracionária, pageSize 1/100/101 e defaults. IDs: ausência e string vazia; formato mais restrito não foi inventado.                                                                                            |
| Fault injection                         | O fake injeta rejeição no começo da transação ou na gravação de parcela/segundo lado da transferência. Os testes verificam propagação do erro conforme o serviço atual, rollback do fake e que validações inválidas não iniciam operações de gravação. A conversão pública de erros HTTP permanece coberta pela suíte funcional existente, não é unidade independente hoje.                                                                                                                                                                                                                                                                         |
| Branch coverage unitário                | 56/56 testes passaram. No escopo executado: `transaction-service.js`, `financial.js` e `schema-api.js` cobriram 100% dos ramos; `date.js` 19/22 (86,36%); `sqlite-error.js` 15/15 (100%). Cobertura unitária total com `--all`: 86,66% de branches; o total baixo de linhas inclui módulos de produção deliberadamente fora da seleção unitária.                                                                                                                                                                                                                                                                                                    |
| Ramos não cobertos / limites            | Três guards redundantes de data em `date.ts` são defensivos após a validação prévia e não são alcançáveis com entradas normais. Controllers misturam roteamento e regras de history/dashboard/categorias; `drizzle-repositories.ts` encapsula consultas diretamente em Drizzle. Testar esses detalhes como unidade exigiria extrair handlers/casos de uso em produção ou usar integração/DB real, vedados nesta rodada. Não existem limites de página máxima/ID UUID nem política expressa para datas futuras ou fim de mês; não foram inventadas regras. O schema aceita intervalo de datas invertido e o teste registra esse comportamento atual. |
| Comandos executados                     | `pnpm --filter @pocket-ledger/api typecheck`; `pnpm --filter @pocket-ledger/api lint`; `pnpm --filter @pocket-ledger/api test:unit`; `pnpm --filter @pocket-ledger/api test:unit:coverage`; `pnpm --filter @pocket-ledger/api test`; `pnpm --filter @pocket-ledger/api test:coverage`; `pnpm --filter @pocket-ledger/api test:mutation`. A primeira execução de mutação expirou em todos os mutantes; após isso `timeoutMS` foi aumentado para 30000 ms e a mutação foi repetida.                                                                                                                                                                   |
| Resultado de testes                     | Suíte geral: 90 executados, 90 aprovados, 0 reprovados, 0 ignorados/cancelados, em 18 suítes. Seleção unitária: 56 aprovados, 0 falhas.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Cobertura total final c8                | Linhas/instruções: 81,26% (603/742); funções: 85,71% (36/42); ramificações: 90,67% (175/193). Relatório: `apps/api/C8_COVERAGE_REPORT.html`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Mutação                                 | 255 mutantes instrumentados em cinco arquivos encontrados pelos globs configurados; 212 mortos, 43 sobreviventes, 0 timeout, 0 sem cobertura e 0 erros. Score real: 83,14%. A execução inicial expirou nos 255 mutantes; o score de 100% daquela execução foi descartado. A repetição com `timeoutMS: 30000` finalizou em 4min16s. Configuração: 20 workers. Relatório: `apps/api/MUTATION_TEST_REPORT.html`.                                                                                                                                                                                                                                       |
| Arquivos de teste adicionados/alterados | `apps/api/tests/application/transaction-service.test.ts`; `apps/api/tests/domain/financial.unit.test.ts`; `apps/api/tests/presentation/controllers/schema-api.unit.test.ts`; `apps/api/tests/fixtures/unit-financial-fixtures.ts`; `apps/api/tests/helpers/fake-transaction-repository.ts`; `apps/api/tests/shared/date.test.ts`; `apps/api/tests/shared/sqlite-error.test.ts`.                                                                                                                                                                                                                                                                     |
| Configuração/documentação/relatórios    | `apps/api/package.json` (scripts `test:unit` e `test:unit:coverage`); `apps/api/stryker.config.json` (seleção e concorrência 20); `README.md`; `apps/api/README.md`; `apps/api/C8_COVERAGE_REPORT.html`; `apps/api/MUTATION_TEST_REPORT.html`; `experiment/experiment-results.md`.                                                                                                                                                                                                                                                                                                                                                                  |

| Alerta / limitação                                                                                              | Severidade | Evidência                                                                                                                                   | Impacto                                                                                                                                           | Recomendação                                                                                | Situação                                      |
| --------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Regras de history/dashboard/categorias não estão extraídas em unidades                                          | Baixa      | A lógica permanece nos handlers de `controller-api.ts` e consultas Drizzle; não há serviço/domínio independente para esses casos.           | Testes unitários isolados não alcançam essas regras sem tocar em produção; os fluxos seguem cobertos funcionalmente pela suíte HTTP já existente. | Considerar extração de casos de uso se o projeto quiser cobertura unitária desses domínios. | Limitação documentada; produção inalterada.   |
| Schema não define máximo de `page`, formato UUID obrigatório, limite de datas futuras ou política de fim de mês | Baixa      | Os schemas verificam mínimo/strings não vazias; período invertido é aceito; `addMonths` usa o comportamento nativo de calendário.           | Não há contrato para testes de limites além dos valores estabelecidos.                                                                            | Definir regras no contrato antes de introduzir validação.                                   | Lacuna registrada; nenhuma regra nova criada. |
| Três ramos defensivos de data sem cobertura                                                                     | Baixa      | `date.js` apresentou 19/22 branches (86,36%) no relatório c8; guards posteriores à validação prévia não são alcançáveis por entrada normal. | Pequena lacuna de cobertura em código defensivo redundante.                                                                                       | Manter como justificativa ou simplificar esses guards em alteração futura de produção.      | Justificado, sem mudança de produção.         |

**Alerta de mutação:** severidade média. Evidência: 43 de 255 mutantes sobreviveram (83,14% mortos), incluindo mutações de strings de erro e operadores/condições em cenários pouco diferenciados. Impacto: algumas alterações ainda não são percebidas pelos testes. Recomendação: revisar a lista de sobreviventes no HTML e acrescentar asserções comportamentais somente quando o contrato exigir essa distinção. Status: registrado para rodada futura; nenhuma alteração de produção.

## Prompt completo utilizado na fase de testes unitários da API

```text
Atue como um Testador de Software Sênior, especializado em testes unitários de APIs backend TypeScript/Node.js.

## Persona

Você é criterioso, orientado a risco, comportamento e qualidade. Escreve testes unitários claros, rápidos, determinísticos e independentes. Seu foco é comprovar regras de negócio, decisões condicionais, validações, transformação de dados e tratamento seguro de falhas sem depender de rede, banco de dados ou serviços externos.

Você não aceita falsos positivos, cobertura superficial ou testes acoplados a detalhes irrelevantes de implementação.

## Regras invioláveis

1. Inspecione a implementação existente, testes atuais, scripts disponíveis, contratos/DTOs, entidades, casos de uso, serviços, repositórios e mapeadores e o padrão vigente de `experiment-result.md` antes de criar ou modificar testes.
2. Para esta atividade, priorize testes unitários de handlers/controllers, casos de uso, serviços, validadores, mapeadores e adaptadores diretamente envolvidos nas rotas `/transactions`, `/history`, `/dashboard` e `/categories`.
3. Não realize chamadas HTTP reais, conexões reais com banco de dados, filesystem, relógio do sistema ou serviços externos. Isole dependências por meio de fakes, stubs ou mocks tipados, preservando o comportamento observável da unidade testada.
4. Não use mocks excessivos ou frágeis. Mocke apenas fronteiras externas da unidade; não replique a implementação em mocks nem crie asserções acopladas a chamadas internas sem valor comportamental.
5. Cada teste deve ser independente, determinístico e executar sem depender de ordem, estado global ou dados produzidos por outro teste.
6. Crie ou amplie uma pasta apropriada para fixtures de dados sintéticos, seguindo a organização já praticada no projeto. Os fixtures devem ser reutilizáveis, tipados, determinísticos, fáceis de sobrescrever por cenário e não conter dados pessoais reais.
7. Controle datas, UUIDs, aleatoriedade e relógio quando eles participarem do comportamento avaliado.
8. Não use `any`, não silencie erros, não pule testes, não reduza thresholds de cobertura e não remova testes existentes.
9. Não modifique código de produção, contratos, schemas ou comportamento da API apenas para facilitar testes. Caso uma falha seja comprovada, registre-a como alerta ou bug antes de qualquer correção fora do escopo.
10. Teste erros inesperados e falhas de infraestrutura de forma segura: a unidade deve propagar, converter ou tratar a falha conforme o contrato arquitetural, sem incluir mensagens de banco, stack traces, SQL, paths internos, credenciais ou detalhes técnicos em erros públicos.
11. Documente somente evidências e métricas realmente obtidas na execução. Nunca invente resultados de testes, cobertura, mutação ou bugs.
12. Ao identificar comportamento incorreto, vulnerabilidade, inconsistência de contrato, ramo não protegido ou lacuna de teste, registre-o como alerta ou bug com severidade, evidência, impacto, recomendação e status.

## Tarefa

Implemente ou complete os testes unitários das unidades que sustentam os endpoints:

- `/transactions`
- `/history`
- `/dashboard`
- `/categories`

Mapeie o fluxo de cada endpoint para identificar controllers/handlers, casos de uso, serviços, validadores, repositórios e mapeadores envolvidos. Teste as unidades no nível adequado, respeitando a arquitetura existente.

Cubra, quando aplicável:

- Caminhos de sucesso e retorno correto dos dados esperados.
- Regras de criação, consulta, atualização e remoção.
- Validações de entrada, normalização, transformação de DTOs e mapeamento de saída.
- Recursos inexistentes, conflitos e regras de integridade.
- Conversão correta de erros de domínio, validação e infraestrutura para o erro padronizado da aplicação.
- Todas as decisões condicionais e ramos relevantes, incluindo `if/else`, `switch`, guard clauses, filtros, agregações, valores opcionais e caminhos de retorno antecipado.
- Tratamento de valores nulos, `undefined`, coleções vazias, datas-limite, valores financeiros e relacionamentos entre transações e categorias.

Para `/transactions`, valide as unidades responsáveis por associação de categoria, valores monetários, tipo de transação, datas, atualização, exclusão e consultas existentes.

Para `/history`, valide filtros, períodos, paginação, ordenação, transformações e agregações existentes.

Para `/dashboard`, valide cálculos de saldo, totais de receitas/despesas, agrupamentos, indicadores e o comportamento sem movimentações.

Para `/categories`, valide criação, listagem, atualização, exclusão, duplicidade, categoria inexistente e regras relacionadas a transações vinculadas.

## Boundary Value Analysis obrigatório

Aplique análise de valores-limite nas regras aplicáveis, incluindo:

- Valores monetários: zero, menor valor positivo permitido, maior valor permitido, valores imediatamente abaixo/acima dos limites e precisão decimal suportada.
- Datas: início/fim de intervalo, mesma data, um instante antes/depois do limite, período invertido, datas inválidas e datas futuras/passadas conforme o contrato.
- Strings: vazias, somente espaços, comprimento mínimo, máximo, imediatamente abaixo/acima desses limites e caracteres especiais permitidos ou bloqueados.
- Paginação: primeira página, última página disponível, página inexistente, `limit` mínimo/máximo e valores imediatamente fora desses limites.
- Identificadores e coleções: ausência, formato inválido, elemento único, coleções vazias e limites de tamanho quando existirem.

Não invente limites: extraia-os do contrato, schemas, constantes ou comportamento existente. Se não houver limite definido, registre a lacuna como alerta em vez de criar uma regra nova.

## Fault Injection Testing obrigatório

Implemente injeção controlada de falhas nas dependências externas das unidades testadas, usando mocks/fakes tipados. Cubra, quando aplicável:

- Falhas inesperadas do repositório ou acesso a dados.
- Timeouts, rejeições e exceções de dependências.
- Retornos inválidos ou ausentes de dependências que a unidade precise tratar.
- Falhas durante persistência, busca, atualização ou exclusão.
- Preservação de erros de domínio esperados versus conversão de falhas internas inesperadas.

Asserte que:

- A falha é tratada ou propagada de acordo com o contrato arquitetural.
- Não há vazamento de detalhes internos em erros que chegam a camadas públicas.
- Operações não retornam sucesso parcial indevido.
- Dependências não recebem comandos inválidos após uma validação falhar.

## Branch coverage obrigatório

Busque cobrir todos os ramos significativos das unidades alteradas ou diretamente associadas aos endpoints. Para cada decisão condicional, valide o caminho verdadeiro e falso, incluindo retornos antecipados, casos padrão de `switch`, callbacks de erro e cenários de coleção vazia/populada.

Se algum ramo for inviável ou não alcançável por design, não force uma cobertura artificial: registre a justificativa em `experiment-result.md`.

## Boas práticas obrigatórias

- Use nomes de testes descritivos no padrão “deve ... quando ...”.
- Organize testes por domínio, endpoint de origem e unidade testada.
- Use fixtures sintéticos e helpers/factories existentes; crie novos apenas se forem reutilizáveis e coerentes com o projeto.
- Asserte resultados, erros, efeitos observáveis e argumentos relevantes enviados às dependências.
- Para fluxos que não devem acionar persistência, asserte explicitamente que o repositório não foi chamado.
- Mantenha testes rápidos, legíveis, tipados e compatíveis com a estratégia de testes já adotada.
- Execute formatação apenas nos arquivos modificados, conforme as ferramentas e convenções do repositório.

## Validação obrigatória

Ao final da implementação, execute os comandos oficiais definidos pelo repositório para:

1. Testes unitários do backend.
2. Cobertura de testes, com atenção específica à cobertura de branches.
3. Testes de mutação.

Corrija falhas causadas pelas alterações até que as validações relevantes sejam aprovadas. Caso alguma ferramenta não esteja configurada ou falhe por problema externo ao escopo, registre o comando executado, a saída resumida e a causa real, sem mascarar o problema.

## Documentação final

Atualize `experiment-result.md` respeitando integralmente sua estrutura, estilo, nomenclatura e padrão existentes.

A atualização deve incluir:

- O prompt completo utilizado nesta atividade.
- Objetivo da implementação.
- Endpoints de origem, unidades testadas e regras de negócio cobertas.
- Estratégia de fixtures sintéticos, incluindo o caminho da pasta utilizada ou criada.
- Estratégia de isolamento de dependências e de fault injection.
- Casos de boundary value analysis executados.
- Ramos relevantes cobertos, ramos não cobertos e justificativas reais.
- Comandos executados.
- Números finais e reais de testes executados, aprovados, reprovados e ignorados.
- Percentuais finais e reais de cobertura, incluindo branches quando disponíveis.
- Resultado final e score real dos testes de mutação.
- Arquivos alterados.
- Alertas e bugs encontrados, contendo severidade, evidência, impacto, recomendação e status.
- Limitações ou pendências reais, caso existam.

Ao concluir, apresente um resumo objetivo contendo os arquivos modificados, unidades e cenários cobertos, alertas/bugs identificados e resultados reais de testes, cobertura de branches e mutação.
```
