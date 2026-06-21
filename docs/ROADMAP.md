# Roadmap

## Status atual (Foundation Lite — entregue)

Já implementado e disponível em ambiente local:

- ✅ Autenticação própria (cadastro, login JWT, verificação de e-mail, reset de senha)
- ✅ Restrição de domínio corporativo no cadastro
- ✅ Catálogo de assets com listagem, busca textual e filtro por categoria
- ✅ Publicação de assets por qualquer usuário autenticado
- ✅ Formulário de publicação em 4 seções (Identidade, Classificação, Documentação, Instalação)
- ✅ 14 categorias alinhadas ao `PROJECT.md`
- ✅ 3 níveis de instalação (Automática, Assistida, Manual) com instruções
- ✅ Modelo de dados com Tags, Equipe, Versão e Instalação (backend pronto; Tags e Equipe ainda ocultos no UI)
- ✅ Tela de detalhe com versão, autor, nível de instalação e instruções
- ✅ UI redesenhada (design system com tokens, skeletons, avatares, datas relativas)

## Próximos passos imediatos

1. Expor Tags e Equipe no formulário e nos cards
2. Manifesto `asset.yaml` (upload + validação)
3. Histórico de versões e changelog por release
4. Favoritos
5. Avaliação por estrelas / curtidas / comentários
6. Dashboard de indicadores
7. Wizard real de instalação assistida

## Objetivo

Definir a evolucao recomendada do AI Assets Hub do MVP para versoes futuras, equilibrando valor de negocio, risco tecnico e simplicidade operacional.

## Principios de Priorizacao

- instalar e reutilizar valem mais do que apenas catalogar
- confianca operacional vem antes de sofisticacao
- governanca deve crescer junto com automacao
- experiencia de usuario nao tecnico e criterio de decisao

## Fase 0. Fundacoes de Produto

Objetivo:

- transformar o conceito em plataforma utilizavel internamente

Capacidades:

- autenticacao propria com dominio corporativo permitido
- papeis `User`, `Contributor`, `Admin`
- cadastro de assets com metadados essenciais
- categorias, tags e equipe responsavel
- versoes de asset e changelog
- busca global com filtros principais
- favoritos
- visualizacao de documentacao
- `asset.yaml` versionado por release
- instalacao manual e assistida basica
- dashboard com indicadores principais
- auditoria de eventos criticos

Resultado esperado:

- usuarios descobrem assets rapidamente
- contribuidores publicam com processo claro
- administradores governam sem friccao excessiva

## Fase 1. MVP Operacional

Meta:

- colocar a plataforma em uso real com baixo risco

Escopo recomendado:

- onboarding simples de usuarios
- aprovacao administrativa opcional de contas
- fluxo de publicacao com validacao de manifesto
- rating por estrelas, curtidas e comentarios
- historico de instalacao por usuario
- wizard de instalacao assistida
- classificacao de risco do manifesto
- busca dentro da meta de 2 segundos

Nao incluir ainda:

- microservicos
- SSO
- recomendacao inteligente
- execucao remota complexa

## Fase 2. Confianca e Governanca

Meta:

- aumentar confianca na qualidade dos assets e das instalacoes

Capacidades:

- workflow de aprovacao mais refinado por categoria ou risco
- badges de maturidade do asset
- score de qualidade de manifesto
- sinalizacao de compatibilidade e pre-requisitos
- moderacao administrativa de comentarios
- dashboards administrativos mais ricos
- relatorios de uso por equipe

Valor:

- melhora reuso
- reduz falhas de instalacao
- fortalece curadoria

## Fase 3. Escala e Especializacao

Meta:

- suportar aumento de volume e diversidade de assets

Capacidades:

- busca com mecanismo especializado, se necessario
- filas para processamento assincrono
- separacao operacional do installation engine
- dependencia entre assets
- templates de manifesto por categoria
- analytics mais profundos de instalacao e adocao

Valor:

- melhor desempenho
- melhor operabilidade
- melhor governanca de ecossistema

## Fase 4. Integracao Corporativa

Meta:

- integrar a plataforma ao ecossistema corporativo mais amplo

Capacidades:

- SSO corporativo
- sincronizacao com diretorios internos
- politicas centralizadas de acesso
- integracao com observabilidade corporativa
- integracao com repositorios internos e catalogos corporativos

Valor:

- menor atrito de acesso
- governanca centralizada

## Fase 5. Marketplace Corporativo Maduro

Meta:

- transformar a plataforma em hub corporativo de ativos de IA

Capacidades:

- recomendacao personalizada
- assets compostos e dependentes
- trilhas de onboarding por perfil
- metricas de ROI e reutilizacao
- automacoes de ciclo de vida

## Itens que Devem Entrar Cedo

- validacao forte de `asset.yaml`
- historico de versoes
- trilha de auditoria
- UX guiada de instalacao
- filtros de busca realmente uteis

## Itens que Devem Entrar Tarde

- busca externa dedicada
- microservicos
- multilayer approval complexo
- automacao irrestrita de instalacao
- recomendacao algoritmica

## Riscos de Roadmap

### Se o time priorizar apenas catalogo

Risco:

- a plataforma vira repositorio estatico com baixa adocao

### Se o time priorizar automacao total cedo demais

Risco:

- explodir complexidade e risco de seguranca antes de validar casos reais

### Se o time adiar auditoria

Risco:

- a governanca fica fragil logo na funcionalidade mais sensivel

## Marco de Sucesso por Fase

### MVP

- usuario encontra solucao em menos de 1 minuto
- contribuidores conseguem publicar sem apoio constante da equipe central
- instalacao assistida cobre os casos de maior valor

### Pos-MVP

- aumento mensuravel de reutilizacao
- reducao de tempo de onboarding tecnico
- menor numero de assets duplicados
