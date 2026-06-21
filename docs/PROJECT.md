# Project

## Objetivo

Este documento consolida a definicao funcional do AI Assets Hub para orientar desenvolvimento, revisao e arquitetura de longo prazo.

Ele deriva de [PROJECT.md](C:\dev\lg-ai-assets-hub\PROJECT.md) e do direcionamento adicional fornecido no anexo do projeto. Em caso de divergencia futura, o arquivo-raiz do projeto continua sendo a fonte primaria do produto e este documento deve ser atualizado.

## Visao do Produto

AI Assets Hub e uma plataforma corporativa para compartilhar, descobrir, documentar, instalar e reutilizar assets relacionados a Inteligencia Artificial criados dentro da organizacao.

O produto existe para:

- evitar duplicacao de esforcos
- centralizar conhecimento reutilizavel
- facilitar adocao de solucoes internas
- reduzir friccao entre descoberta e uso

## O que e um Asset

Asset e qualquer item reutilizavel publicado na plataforma. Categorias iniciais previstas:

- Agente
- MCP Server
- Prompt
- Skill
- Plugin
- Workflow
- Integracao
- Automacao
- Ferramenta Desktop
- Ferramenta Web
- Template
- Script
- Documentacao Tecnica
- Outro

## Principio Mais Importante

A experiencia de instalacao e um dos pilares do produto.

Todo asset deve possuir um mecanismo de instalacao simples, idealmente enquadrado em um destes niveis:

- instalacao automatica
- instalacao assistida
- instalacao manual documentada

A plataforma deve evoluir para suportar instalacao com um clique sempre que isso for seguro e operacionalmente justificavel.

## Objetivos de Negocio

- aumentar reutilizacao de ativos internos
- reduzir retrabalho entre equipes
- tornar descoberta de solucoes mais rapida
- padronizar documentacao e compartilhamento
- reduzir barreiras tecnicas para instalacao

## Perfis de Usuario

### User

Pode:

- pesquisar assets
- visualizar documentacao
- instalar assets
- avaliar assets
- favoritar assets

### Contributor

Pode:

- criar assets
- atualizar versoes
- adicionar documentacao
- publicar instaladores

### Admin

Pode:

- gerenciar usuarios
- gerenciar permissoes
- aprovar publicacoes
- gerenciar categorias
- visualizar metricas

## Autenticacao

Primeira versao:

- autenticacao propria
- cadastro por e-mail e senha
- confirmacao por e-mail
- recuperacao de senha
- aprovacao opcional por administrador

Restricao obrigatoria:

- permitir apenas dominios corporativos autorizados

Fora do escopo do MVP:

- Microsoft Entra ID
- Azure AD
- Google Workspace
- SSO corporativo

Requisito arquitetural:

- a solucao deve permitir futura migracao para SSO sem grande refatoracao

## Gestao de Assets

Campos minimos esperados:

- nome
- descricao curta
- descricao detalhada
- categoria
- tags
- autor
- equipe responsavel
- versao
- data de publicacao
- data da ultima atualizacao

## Busca e Descoberta

Busca por:

- nome
- descricao
- autor
- categoria
- tags
- equipe

Filtros:

- categoria
- data
- popularidade
- nivel tecnico

## Feedback e Engajamento

A plataforma deve suportar:

- curtidas
- avaliacao por estrelas
- comentarios
- favoritos

## Versionamento

Todo asset deve possuir:

- versionamento
- historico de alteracoes
- autor da alteracao
- data da alteracao

## Dashboard

Indicadores minimos:

- total de assets
- assets mais acessados
- assets mais instalados
- assets mais avaliados
- novos assets

## Requisitos Nao Funcionais

### Seguranca

- HTTPS
- hash seguro de senhas
- controle de permissoes
- auditoria

### Performance

- busca inferior a 2 segundos

### Escalabilidade

- arquitetura preparada para milhares de assets

### Usabilidade

- interface simples
- foco em usuarios nao tecnicos

## Stack Inicial

- Frontend: Next.js + React + TypeScript
- Backend: ASP.NET Core
- Banco: PostgreSQL
- Hospedagem: Azure ou ambiente corporativo

## Restricao Arquitetural de Tokens

O projeto sera desenvolvido com agentes de IA que operam sob limite de contexto.

Consequencias:

- consumo de tokens precisa ser tratado como restricao arquitetural
- cada agente deve ler apenas o necessario
- a documentacao deve ser modular
- tarefas devem ser pequenas e contextualmente localizadas

## Criterios de Sucesso

- usuario encontra uma solucao em menos de 1 minuto
- instalacao ocorre com poucos cliques sempre que possivel
- compartilhamento de conhecimento fica centralizado
- reutilizacao de assets aumenta de forma mensuravel
- publicacao de assets e simples para contribuidores

## Perguntas em Aberto

- O que significa "instalar" para cada categoria de asset.
- Onde a instalacao ocorre de fato: navegador, maquina local ou ambiente controlado.
- Quais categorias podem suportar um clique no MVP.
- Se assets poderao depender de outros assets da plataforma.
- Se havera visibilidade restrita por equipe no MVP.
