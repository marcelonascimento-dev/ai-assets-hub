# AI Assets Hub

Plataforma corporativa para centralizar, descobrir, instalar e reutilizar assets de IA criados pelos colaboradores (agentes, MCP servers, prompts, skills, plugins, workflows, integrações, automações, ferramentas, scripts, templates e documentação técnica).

> Para a visão completa de produto, consulte [PROJECT.md](PROJECT.md). Para a arquitetura alvo, [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) e [docs/DOMAIN_MODEL.md](docs/DOMAIN_MODEL.md).

## Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript
- **Backend:** ASP.NET Core 8 (Web API)
- **Banco:** PostgreSQL 16 via Docker Compose
- **Persistência:** EF Core (migrations auto-aplicadas no boot)

## Estrutura

```text
src/
  backend/
    AiAssetsHub.Api/             # Controllers, models, DI
    AiAssetsHub.Application/     # Contracts (records) e interfaces
    AiAssetsHub.Domain/          # Entidades, enums, regras de domínio
    AiAssetsHub.Infrastructure/  # EF Core, services, seeding, migrations
  frontend/
    src/app/                     # Páginas (App Router)
    src/components/              # Componentes client
    src/lib/                     # Cliente HTTP, sessão
    src/types/                   # Tipos compartilhados
```

## Pré-requisitos

- .NET SDK 8 ou superior
- Node.js 24 ou superior
- Docker Desktop

## Subindo o ambiente

### 1. Banco

```powershell
docker compose up -d
```

### 2. Backend

```powershell
$env:ConnectionStrings__Postgres="Host=localhost;Port=5432;Database=ai_assets_hub;Username=postgres;Password=postgres"
dotnet run --project .\src\backend\AiAssetsHub.Api\AiAssetsHub.Api.csproj
```

Backend escuta em `http://localhost:8080`. Migrations são aplicadas automaticamente no boot.

### 3. Frontend

```powershell
cd .\src\frontend
npm install
npm run dev
```

Frontend escuta em `http://localhost:3000`.

### Migrations manuais (opcional)

```powershell
$env:ConnectionStrings__Postgres="Host=localhost;Port=5432;Database=ai_assets_hub;Username=postgres;Password=postgres"
dotnet ef database update --project .\src\backend\AiAssetsHub.Infrastructure\AiAssetsHub.Infrastructure.csproj --startup-project .\src\backend\AiAssetsHub.Api\AiAssetsHub.Api.csproj
```

## Funcionalidades entregues

### Autenticação
- Cadastro com e-mail e senha (apenas domínios corporativos autorizados)
- Login com JWT
- Verificação de e-mail (link gerado no payload em ambiente local)
- Esqueci minha senha e redefinição via token

### Catálogo de Assets
- Listagem com busca textual em **nome, descrição, descrição detalhada, nome do autor e equipe**
- Filtro por categoria (chips com contagem)
- Ordenação por mais recentes ou alfabética
- Datas relativas ("hoje", "ontem", "há 3 dias")
- Skeleton loaders enquanto carrega

### Publicação de Assets
Qualquer usuário autenticado pode publicar. Formulário organizado em 4 seções:

1. **Identidade** — nome e descrição curta
2. **Classificação** — categoria (14 opções da doc) e versão
3. **Documentação** — descrição detalhada
4. **Instalação** — nível (Automática / Assistida / Manual) e instruções

### Detalhe do Asset
- Hero com categoria, versão, autor (avatar), nível de instalação
- Botão "Instalar" rotulado conforme o nível
- Copiar link
- Seção dedicada de instruções de instalação quando preenchidas

## Categorias suportadas

Agente, MCP Server, Prompt, Skill, Plugin, Workflow, Integração, Automação, Ferramenta Web, Ferramenta Desktop, Script, Template, Documentação Técnica, Outro.

## Níveis de Instalação

| Nível | Nome | Quando usar |
|---|---|---|
| 1 | Automática | Um clique. Sem configuração nem credencial. |
| 2 | Assistida | Wizard guiado que pergunta inputs e valida ao final. |
| 3 | Manual | Plataforma entrega instruções; usuário executa por conta própria. |

Detalhes em [PROJECT.md#instalacao](PROJECT.md#instalação).

## Modelo de dados — Asset

| Campo | Tipo | Notas |
|---|---|---|
| `Id` | Guid | PK |
| `Name` | string(200) | Obrigatório |
| `Slug` | string(200) | Único, gerado a partir do nome |
| `ShortDescription` | string(500) | Obrigatório (10..500) |
| `DetailedDescription` | text | Obrigatório (≥20) |
| `Category` | string(64) | Validado contra `AssetCategories.All` |
| `Tags` | text[] | Backend pronto, UI omitida no formulário atual |
| `TeamName` | string(120) | Backend pronto, UI omitida no formulário atual |
| `Version` | string(32) | Default `1.0.0` |
| `InstallType` | string(32) | `Automatic` / `Assisted` / `Manual` |
| `InstallNotes` | text | Opcional |
| `AuthorUserId` | Guid | FK → users |
| `CreatedAt`, `UpdatedAt` | timestamptz | |

Índices: `Slug` único, `Category`, `Tags` GIN.

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Cadastro |
| `POST` | `/api/auth/login` | Login (JWT) |
| `POST` | `/api/auth/confirm-email?token=` | Verificação de e-mail |
| `POST` | `/api/auth/forgot-password` | Solicitar redefinição |
| `POST` | `/api/auth/reset-password` | Redefinir com token |
| `GET` | `/api/assets?q=` | Listar/buscar |
| `GET` | `/api/assets/{id}` | Detalhe |
| `POST` | `/api/assets` | Publicar (autenticado) |

## Próximos passos

Conforme [docs/ROADMAP.md](docs/ROADMAP.md):

- Exposição de Tags e Equipe Responsável no frontend
- Manifesto `asset.yaml` (upload e validação)
- Histórico de versões e changelog
- Favoritos, avaliações (estrelas, curtidas, comentários)
- Dashboard de indicadores
- Aprovação opcional de cadastros por administrador
- Wizard real de instalação Nível 2

## Convenções

- Backend aplica migrations automaticamente ao iniciar.
- Senhas armazenadas com hash; JWT assinado com chave configurada via `Jwt:SigningKey`.
- Categorias e níveis de instalação são `string` validados em runtime contra constantes do domínio.

## Suporte / dúvidas

Abrir issue no repositório interno ou contatar a equipe de Plataforma de IA.
