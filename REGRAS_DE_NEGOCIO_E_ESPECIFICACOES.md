# Pocket Ledger — regras de negócio e especificações

> Documento baseado na revisão do código-fonte atual do monorepo, em 28 de outubro de 2026. Ele descreve o comportamento efetivamente implementado; não é uma lista de funcionalidades futuras.

## 1. Propósito e escopo

O Pocket Ledger é uma aplicação local de controle financeiro pessoal em reais (BRL). Ela permite manter contas, categorias, lançamentos financeiros, transferências, limites mensais por categoria e um histórico de auditoria.

- Não há cadastro de usuários, autenticação ou segregação de dados por usuário.
- A API e a interface são pensadas para execução local. A API aceita CORS apenas de `http://localhost:5173`.
- Os dados são persistidos em SQLite; valores monetários são inteiros em centavos e datas de negócio usam `YYYY-MM-DD`.

## 2. Regras de negócio

### 2.1 Contas

- Uma conta possui `id`, nome único, saldo inicial em centavos e data de criação.
- O nome é obrigatório, tem de 1 a 60 caracteres após remover espaços das extremidades.
- O saldo inicial é opcional e vale `0` quando omitido; pode ser negativo, desde que seja um inteiro.
- O saldo disponível é calculado, não armazenado: `saldo inicial + receitas - despesas - transferências enviadas + transferências recebidas`.
- Uma conta não pode ser excluída se houver lançamentos que a referenciem; a restrição de chave estrangeira retorna conflito HTTP 409.

### 2.2 Categorias

- Categorias são obrigatoriamente de receita (`INCOME`) ou despesa (`EXPENSE`).
- Nome é obrigatório, tem de 1 a 60 caracteres; a combinação **nome + tipo** é única. Assim, é permitido ter categorias com o mesmo nome em tipos distintos.
- A cor deve ser hexadecimal no formato `#RRGGBB`; se omitida, é `#94a3b8`.
- Uma categoria vinculada a lançamento não pode ser excluída. A exclusão de categoria remove automaticamente os seus orçamentos mensais vinculados.

### 2.3 Lançamentos de receita e despesa

- Todo lançamento normal requer descrição (1–120 caracteres), valor positivo inteiro em centavos, data válida, conta e categoria existentes.
- O tipo aceito é `INCOME` ou `EXPENSE`; a interface o preenche a partir da categoria escolhida.
- Parcelas e recorrências podem ter de 1 a 120 ocorrências, mas são mutuamente exclusivas quando ambas forem maiores que 1.
- Parcelamento divide o valor total em parcelas mensais. Eventuais centavos restantes são atribuídos às primeiras parcelas. Ex.: R$ 1,00 em 3 parcelas gera 34, 33 e 33 centavos.
- Recorrência cria um lançamento integral por mês durante a duração definida.
- Parcelas e recorrências são materializadas como registros independentes para preservar o histórico. Parcelas compartilham `installmentGroupId`, número e total; recorrências compartilham `recurrenceGroupId`.
- A criação do conjunto de lançamentos é atômica: se uma inserção falhar, todas são revertidas.
- A edição existe na API apenas para descrição, valor, data, conta e categoria do registro selecionado. Ela não propaga alterações ao grupo, não permite alterar tipo, parcela ou recorrência, e o frontend atual não expõe edição.
- A exclusão afeta somente o lançamento selecionado; não exclui o grupo de parcelas ou recorrências.

### 2.4 Transferências

- Uma transferência requer descrição, valor positivo em centavos, data e duas contas distintas.
- Ela cria, atomicamente, dois lançamentos `TRANSFER` de mesmo valor: um associado à origem e outro ao destino, ambos ligados por um identificador de grupo.
- Transferências não usam categoria e não entram como receita ou despesa no resultado mensal.
- Embora a API suporte `POST /transfers`, o frontend atual não possui tela ou fluxo para criar transferências.

### 2.5 Orçamentos

- Um orçamento define um limite positivo, em centavos, para uma categoria em um mês no formato `YYYY-MM`.
- Há no máximo um orçamento por combinação categoria/mês; uma nova gravação atualiza o limite existente.
- O gasto do orçamento é a soma das despesas daquela categoria dentro do mês. A porcentagem é arredondada para o inteiro mais próximo: `gasto / limite × 100`.
- O backend disponibiliza leitura e gravação de orçamentos, porém o item “Orçamentos” do frontend atualmente reutiliza a tela do dashboard e não fornece gestão de limites.

### 2.6 Dashboard e histórico

- O dashboard mensal mostra saldo disponível consolidado de todas as contas, receitas, despesas, resultado mensal, despesas por categoria e os seis lançamentos mais recentes do mês.
- `resultado mensal = receitas do mês - despesas do mês`; transferências são excluídas desse cálculo.
- A evolução atualmente contém somente um ponto para o mês selecionado, portanto o gráfico compara receitas e despesas do próprio período, não uma série histórica de vários meses.
- O histórico registra criações e exclusões de contas, categorias e lançamentos, além de cada gravação de orçamento. Cada evento mantém uma cópia do registro no instante da operação.
- Atualizações de contas, categorias e lançamentos não geram auditoria no código atual, embora o modelo de auditoria aceite a ação `UPDATED`.

## 3. Especificação da API

Base padrão: `http://127.0.0.1:3333/api`. Requisições usam JSON. IDs são UUIDs gerados pelo servidor.

| Método e rota                    | Finalidade                      | Principais regras/retorno                                                                     |
| -------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------- |
| `GET /health`                    | Verificar disponibilidade       | `200 { "status": "ok" }`                                                                      |
| `GET/POST /accounts`             | Listar/criar contas             | Lista ordenada por nome; a listagem inclui `balanceCents`                                     |
| `PATCH/DELETE /accounts/:id`     | Alterar/excluir conta           | `PATCH` aceita nome e saldo inicial; exclusão pode retornar 409 por vínculos                  |
| `GET/POST /categories`           | Listar/criar categorias         | Lista por tipo e nome                                                                         |
| `PATCH/DELETE /categories/:id`   | Alterar/excluir categoria       | `PATCH` aceita nome, tipo e cor; exclusão pode retornar 409 por lançamentos                   |
| `GET /transactions`              | Consultar lançamentos paginados | Filtros: `month`, `categoryId`, `type`, `from`, `to`, `page`, `pageSize` (máx. 100) e `order` |
| `POST /transactions`             | Criar receita/despesa           | Retorna array de registros criados, inclusive em parcela/recorrência                          |
| `PATCH/DELETE /transactions/:id` | Alterar/excluir lançamento      | Atua somente no registro indicado                                                             |
| `POST /transfers`                | Criar transferência             | Retorna os dois registros correspondentes                                                     |
| `GET /budgets?month=YYYY-MM`     | Consultar orçamentos mensais    | Retorna categoria, gasto e percentual de cada orçamento                                       |
| `PUT /budgets/:categoryId`       | Criar/atualizar orçamento       | Corpo: `month`, `limitCents`                                                                  |
| `GET /dashboard?month=YYYY-MM`   | Obter resumo mensal             | Retorna métricas, categorias, últimos lançamentos e evolução                                  |
| `GET /history`                   | Consultar auditoria paginada    | `page` e `pageSize` (máx. 100; padrão 30)                                                     |

Erros previsíveis usam `{ "message": "..." }`: entrada inválida e regra de domínio retornam 400; inexistência retorna 404; unicidade ou relacionamento inválido retornam 409; falhas não tratadas retornam 500.

## 4. Persistência e integridade

| Entidade      | Dados essenciais                                                | Integridade                                                                     |
| ------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `Account`     | nome, saldo inicial                                             | nome único                                                                      |
| `Category`    | nome, tipo, cor                                                 | nome + tipo único                                                               |
| `Transaction` | descrição, valor, data, tipo, conta, categoria/grupos opcionais | referências para conta/categoria; índices por data, conta/data e categoria/data |
| `Budget`      | categoria, mês, limite                                          | categoria + mês único; exclusão em cascata ao excluir categoria                 |
| `AuditLog`    | entidade, ação, ID, cópia JSON, data                            | índices por data e entidade/ID                                                  |

O banco ativa `PRAGMA foreign_keys = ON`. Datas são normalizadas pelo backend com horário de meio-dia UTC para evitar deslocamento de dia na conversão; intervalos mensais usam o início inclusivo e o primeiro dia do mês seguinte como limite exclusivo.

## 5. Especificação do frontend

O frontend é React 19 com Vite, React Router, TanStack Query, React Hook Form, Zod e Recharts. A comunicação HTTP é centralizada em `src/lib/api.ts`; queries e mutações invalidam os caches relacionados após sucesso.

| Rota            | Implementação atual                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `/`             | Dashboard mensal com quatro métricas, gráfico de receitas x despesas, gráfico de despesas por categoria e últimos lançamentos |
| `/transactions` | Listagem por mês, criação de lançamento em duas etapas, criação rápida de categoria e exclusão confirmada                     |
| `/accounts`     | Listagem com saldo calculado, criação e exclusão confirmada                                                                   |
| `/categories`   | Listagem, criação com tipo/cor e exclusão confirmada                                                                          |
| `/history`      | Consulta do log de auditoria                                                                                                  |
| `/budgets`      | Renderiza o dashboard com o título “Orçamentos”; ainda não usa os endpoints de orçamento                                      |
| `/reports`      | Renderiza o dashboard com o título “Relatórios”; não há relatório distinto                                                    |

Características de interface:

- Português brasileiro é o idioma inicial; inglês pode ser selecionado e a escolha fica em `localStorage`.
- O tema começa escuro e pode ser alternado para claro; a preferência é persistida como `light`, `dark` ou `system` e é aplicada antes de React iniciar.
- Há navegação lateral expansível, versão móvel, busca de páginas no menu e modal global de erro com opção de recarregar.
- Os meses disponíveis nos seletores abrangem o mês atual e os 23 anteriores.
- Exclusões sempre pedem confirmação explícita na interface.

## 6. Arquitetura e operação

```text
apps/web (React) → HTTP/JSON → apps/api/presentation (Express)
                                  ↓
                         application (casos de uso)
                                  ↓
                    domain (regras e contratos) ← infrastructure (Drizzle)
                                                          ↓
                                                       SQLite
```

- Backend: Express 5, Zod, Drizzle ORM e `node:sqlite`.
- Frontend: React 19, TypeScript, Vite e Tailwind/CSS semântico.
- Variáveis principais: `DATABASE_URL` (obrigatória na API), `PORT` (3333), `HOST` (`127.0.0.1`) e `VITE_API_URL`.
- O seed cria, quando ausentes, a conta “Main account”, as categorias “Food” e “Salary” e dois lançamentos de exemplo.

## 7. Cobertura de testes existente

- Backend: regras de parcelamento, incompatibilidade parcela/recorrência, criação de transferências, transferência para a mesma conta, datas inválidas, JSON inválido, health check, erros SQLite e utilitários de data.
- Frontend: schemas de formulário, tema, cores de gráficos, dashboard e um teste E2E que abre a tela inicial.

## 8. Limites funcionais observados

- Sem autenticação, autorização, multiusuário, importação/exportação ou conciliação bancária.
- O frontend não expõe transferências, edição de registros, orçamento propriamente dito nem relatórios distintos.
- O histórico não mostra o conteúdo do snapshot; exibe ação, entidade, identificador e data.
- Não há paginação navegável na interface de transações nem no histórico, embora a API seja paginada.
- A gestão de meses no frontend limita-se aos últimos 24 meses, mesmo que a API aceite qualquer mês válido.
