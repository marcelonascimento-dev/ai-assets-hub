# Context Strategy

## Objetivo

Definir como os agentes devem operar com economia de tokens e leitura seletiva em um projeto de longa duracao.

## Estrategia de Economia de Tokens

- cada agente recebe apenas o contexto necessario para sua funcao atual
- documentos extensos devem ser consumidos por secao, nao integralmente, quando o escopo permitir
- tarefas grandes devem ser quebradas antes da execucao
- o backlog e a unidade primaria de roteamento de contexto

## Estrategia de Leitura Seletiva

### Regra-base

Nenhum agente deve abrir toda a documentacao por padrao.

### Ordem recomendada de leitura

1. task especifica em `docs/TASKS.md`
2. documento de contexto minimo associado a tarefa
3. arquivos do modulo impactado
4. apenas se necessario, documentos transversais adicionais

### Exemplo

Para uma tarefa de reset de senha:

- ler o item da task
- ler `docs/SECURITY.md`
- ler `docs/DOMAIN_MODEL.md` apenas na parte de `User`
- nao ler `docs/INSTALLATION_ENGINE.md`

## Estrategia de Atualizacao de Documentacao

- atualizar documentacao somente quando a decisao ou implementacao mudar o contrato relevante
- preferir alteracoes pontuais e localizadas
- evitar reescrever documentos grandes por mudancas locais
- toda alteracao estrutural deve refletir em pelo menos um documento canonico

## Estrategia de Memoria do Projeto

Memoria de longo prazo deve ser distribuida assim:

- `docs/PROJECT.md`: visao do produto
- `docs/ARCHITECTURE.md`: estrutura e trade-offs
- `docs/DOMAIN_MODEL.md`: entidades e relacionamentos
- `docs/DATABASE.md`: persistencia
- `docs/SECURITY.md`: controles e riscos
- `docs/INSTALLATION_ENGINE.md`: contrato e fluxo de instalacao
- `docs/ROADMAP.md`: evolucao por fase
- `docs/TASKS.md`: unidade operacional do trabalho
- `agents/README.md`: organizacao da equipe
- `agents/CONTEXT_STRATEGY.md`: politica de leitura e economia

## Estrategia Para Evitar Releitura Desnecessaria

- `Orchestrator` deve encaminhar sempre um pacote de contexto minimo
- o pacote deve citar quais documentos ler e quais ignorar
- resumos executivos devem ser preferidos para tarefas rotineiras
- documentos centrais so devem ser reabertos integralmente quando houver mudanca estrutural

## Estrategia Para Projetos de Longa Duracao

- manter backlog detalhado e incrementavel
- preservar estabilidade semantica dos documentos canônicos
- criar novos documentos apenas quando um tema crescer o suficiente para merecer boundary proprio
- usar IDs de task para rastrear impacto documental e arquitetural

## Estrategia Para Grandes Bases de Codigo

- quebrar trabalho por modulo
- limitar cada tarefa a poucos arquivos alvo
- evitar tarefas definidas por "refatorar tudo" ou "revisar todo o sistema"
- usar artefatos locais de modulo quando o dominio crescer

## Estrategia Para Multiplos Agentes Trabalhando Simultaneamente

- paralelizar apenas tarefas sem conflito de arquivos ou de decisao arquitetural
- reservar `Architect` para alinhar contratos antes de trabalho paralelo em modulos adjacentes
- obrigar `Reviewer` a revisar integracao entre mudancas paralelas antes do merge logico

## Matriz de Leitura Minima por Agente

### Orchestrator

Le obrigatoriamente:

- `docs/TASKS.md`
- `agents/README.md`
- `agents/CONTEXT_STRATEGY.md`

Le opcionalmente:

- `docs/ROADMAP.md`
- secoes especificas de `docs/ARCHITECTURE.md`

Nao deve ler por padrao:

- documentos tecnicos detalhados sem relacao com a task em roteamento

### Architect

Le obrigatoriamente:

- `docs/PROJECT.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN_MODEL.md`
- `docs/DATABASE.md`
- `docs/SECURITY.md`
- `docs/INSTALLATION_ENGINE.md`

Le opcionalmente:

- `docs/ROADMAP.md`
- `docs/TASKS.md`

Nao deve ler por padrao:

- arquivos de implementacao sem necessidade de decisao estrutural

### Builder

Le obrigatoriamente:

- task especifica
- documento tecnico minimo relacionado
- arquivos do modulo impactado

Le opcionalmente:

- `docs/ARCHITECTURE.md` secao do modulo
- `docs/SECURITY.md` se a task tocar autenticacao, autorizacao ou segredos

Nao deve ler por padrao:

- `docs/PROJECT.md` inteiro
- todos os documentos canônicos ao mesmo tempo

### Reviewer

Le obrigatoriamente:

- task especifica
- diff ou arquivos alterados
- documento tecnico minimo relacionado ao risco da mudanca

Le opcionalmente:

- `docs/ARCHITECTURE.md`
- `docs/SECURITY.md`
- `docs/INSTALLATION_ENGINE.md`

Nao deve ler por padrao:

- backlog inteiro
- documentos sem relacao com o diff

## Consumo Estimado de Contexto

- `Orchestrator`: baixo
- `Architect`: alto, mas esporadico
- `Builder`: medio e altamente localizado
- `Reviewer`: medio e orientado a diff

## Regra Final

Se uma tarefa nao puder ser executada ou revisada sem carregar quase toda a documentacao, o problema normalmente nao e do agente; e do tamanho da tarefa. Nesse caso, a tarefa deve ser quebrada antes de seguir.
