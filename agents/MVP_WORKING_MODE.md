# MVP Working Mode

## Objetivo

Este documento orienta os agentes a trabalhar no AI Assets Hub com foco exclusivo no menor MVP funcional atualmente aprovado.

O objetivo deste modo de trabalho e evitar expansao prematura de escopo, excesso de releitura documental e implementacoes que antecipem capacidades fora do recorte validado.

## Escopo Atual do MVP

O MVP atual deve permitir apenas:

- cadastro de usuarios
- login
- cadastro de assets
- listagem de assets
- busca de assets
- visualizacao de asset

Este recorte deve ser tratado como prioridade superior ao roadmap amplo do produto.

## Fora do Escopo por Enquanto

Os agentes nao devem implementar nem preparar estrutura detalhada para:

- comentarios
- favoritos
- dashboard
- installation engine completo
- notificacoes
- metricas
- workflow de aprovacao
- versionamento completo de assets
- changelog por versao
- `asset.yaml`
- validacao de manifesto
- filtros avancados de busca
- curtidas
- avaliacao por estrelas
- moderacao
- historico de instalacao
- analytics

Se alguma task puxar qualquer item acima, ela deve voltar ao `Orchestrator` para replanejamento.

## Principio Operacional

Todos os agentes devem assumir que o produto, neste momento, e um `catalog MVP`.

Isso significa:

- autenticacao propria simples
- RBAC simples
- catalogo basico de assets
- descoberta por listagem e busca textual basica

Nao significa:

- plataforma completa de marketplace corporativo
- instalacao operacional ponta a ponta
- governanca refinada
- observabilidade e analytics ricos

## Boundaries Ativos no MVP

Somente dois modulos devem ser considerados ativos como foco principal:

- `identity`
- `catalog`

Modulos que podem existir conceitualmente, mas nao devem dirigir implementacao agora:

- `versioning`
- `installation`
- `feedback`
- `governance`
- `audit`
- `analytics`

## Regras de Produto para o MVP

### Usuarios

- cadastro com `email` e `senha`
- validacao de dominio corporativo permitido
- login autenticado

### Papeis

- `User`: pode listar, buscar e visualizar assets
- `Contributor`: pode fazer tudo que `User` faz e tambem criar assets
- `Admin`: pode existir no modelo, mas nao exige interface administrativa no MVP

### Assets

Campos minimos recomendados:

- `id`
- `name`
- `short_description`
- `detailed_description`
- `category`
- `author_user_id`
- `created_at`
- `updated_at`

Campos que nao sao obrigatorios neste MVP:

- tags
- equipe responsavel
- versao
- changelog
- manifesto
- dependencias
- nivel tecnico
- popularidade

### Busca

A busca do MVP deve cobrir apenas:

- `name`
- `short_description`
- `detailed_description`

Filtros avancados devem ficar para depois.

## Regras por Agente

## `Orchestrator`

Responsavel por quebrar o trabalho em tarefas pequenas e impedir que o time implemente o produto completo cedo demais.

Deve:

- selecionar tarefas pequenas e localizadas
- verificar dependencias
- montar pacote minimo de contexto
- bloquear tasks amplas demais
- acionar `Architect` apenas quando houver decisao estrutural real

Nao deve:

- encaminhar uma task que misture auth, catalogo, busca e features futuras no mesmo ciclo
- pedir leitura integral da documentacao sem necessidade
- usar o roadmap amplo como autorizacao para ampliar escopo do MVP

Sequencia recomendada:

1. foundation minima
2. auth
3. roles
4. asset create
5. asset list
6. asset search
7. asset detail

Leitura minima:

- `docs/TASKS.md`
- `docs/ROADMAP.md`
- `agents/README.md`
- `agents/CONTEXT_STRATEGY.md`

## `Architect`

Responsavel por preservar simplicidade estrutural.

Deve:

- formalizar boundaries minimos entre `identity` e `catalog`
- validar modelo de dados minimo
- confirmar autorizacao simples por papel
- bloquear antecipacao de versioning, installation e governance

Nao deve:

- empurrar o time para o desenho completo do produto
- exigir modelagem de modulos ainda inativos para esta fase
- introduzir contratos que so terao utilidade em fases futuras

Leitura minima:

- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- `docs/SECURITY.md`
- `docs/PROJECT.md`

## `Builder`

Responsavel por implementar apenas a task atual com contexto local.

Deve:

- alterar apenas os arquivos necessarios
- seguir os contratos definidos
- manter implementacao simples
- sinalizar bloqueios estruturais cedo

Nao deve:

- adicionar entidades ou endpoints sem uso imediato no MVP
- preparar infraestrutura detalhada para funcionalidades futuras
- ler o projeto inteiro por padrao

Pacote minimo por tipo de tarefa:

- auth:
  - secoes de `identity` em `docs/ARCHITECTURE.md`
  - `identity.users` em `docs/DATABASE.md`
- catalog:
  - secoes de `catalog` em `docs/ARCHITECTURE.md`
  - `catalog.assets` em `docs/DATABASE.md`

## `Reviewer`

Responsavel por validar qualidade e proteger o recorte do MVP.

Deve:

- procurar bugs e regressao
- validar seguranca basica
- checar aderencia ao escopo do MVP
- apontar complexidade desnecessaria

Deve reprovar ou sinalizar como risco:

- introducao de versionamento sem necessidade imediata
- inclusao de fluxo de aprovacao
- introducao de `asset.yaml` ou manifestos
- filtros de busca nao necessarios
- tabelas e endpoints sem uso no MVP atual

## Backlog Operacional Recomendado

### `MVP-01` Foundation minima

- definir boundaries ativos
- congelar escopo fora do MVP

### `MVP-02` Modelo de usuarios

- modelar usuario e papel
- validar dominio corporativo

### `MVP-03` Registro e login

- cadastro
- login
- hash seguro de senha
- sessao autenticada ou JWT

### `MVP-04` Autorizacao simples

- `User`
- `Contributor`
- restricao de criacao de asset por papel

### `MVP-05` Modelo de asset

- entidade minima
- categorias predefinidas simples

### `MVP-06` Cadastro de asset

- API e formulario
- validacoes minimas

### `MVP-07` Listagem e detalhe

- listagem simples
- pagina de detalhe

### `MVP-08` Busca

- busca por nome e descricao
- sem filtros avancados

## Regra de Escalada

Se uma task exigir:

- leitura de quase toda a documentacao
- mudanca simultanea em muitos modulos
- definicao de contratos para features fora do MVP
- decisao estrutural sem consenso

entao a task deve voltar ao `Orchestrator` para ser quebrada ou reenquadrada.

## Regra de Sucesso

Uma implementacao esta alinhada a este modo de trabalho quando:

- resolve apenas uma parte clara do fluxo principal
- nao antecipa capacidades futuras sem necessidade
- respeita os boundaries ativos
- mantem o custo de contexto baixo
- deixa o sistema mais perto do fluxo completo:
  - cadastrar usuario
  - autenticar
  - criar asset
  - listar
  - buscar
  - visualizar
