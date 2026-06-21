# ==============================================================
# AI Assets Hub - Deploy Script (PowerShell)
# ==============================================================
# Usage:
#   .\deploy.ps1              # First install or update
#   .\deploy.ps1 -EnvOnly     # Just regenerate .env interactively
# ==============================================================

param(
    [switch]$EnvOnly
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Assets Hub - Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- Check prerequisites ---
function Test-Command($cmd) {
    $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

if (-not (Test-Command "docker")) {
    Write-Host "Docker nao encontrado. Instale: https://docs.docker.com/get-docker/" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "docker-compose") -and -not (docker compose version 2>$null)) {
    Write-Host "Docker Compose nao encontrado." -ForegroundColor Red
    exit 1
}

# --- .env setup ---
$envFile = Join-Path $PSScriptRoot ".env"
$envExample = Join-Path $PSScriptRoot ".env.example"

if (-not (Test-Path $envFile) -or $EnvOnly) {
    Write-Host "Configurando variaveis de ambiente..." -ForegroundColor Yellow
    Write-Host ""

    # Generate JWT key
    $jwtKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object { [char]$_ })

    # Prompt for values
    $domain = Read-Host "URL publica do sistema (ex: https://ai-assets.lg.com.br)"
    $domain = $domain.TrimEnd('/')
    if (-not $domain) { $domain = "http://localhost" }

    $pgPassword = Read-Host "Senha do PostgreSQL (deixe vazio para gerar)"
    if (-not $pgPassword) {
        $pgPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
        Write-Host "  Senha gerada: $pgPassword" -ForegroundColor DarkGray
    }

    $adminEmail = Read-Host "Email do admin (padrao: marcelo.nascimento@lg.com.br)"
    if (-not $adminEmail) { $adminEmail = "marcelo.nascimento@lg.com.br" }

    $emailProvider = Read-Host "Provedor de email [AzureCommunicationServices / DevelopmentLink] (padrao: DevelopmentLink)"
    if (-not $emailProvider) { $emailProvider = "DevelopmentLink" }

    $acsConn = ""
    $acsSender = ""
    if ($emailProvider -eq "AzureCommunicationServices") {
        $acsConn = Read-Host "Azure Communication Services - Connection String"
        $acsSender = Read-Host "Azure Communication Services - Sender Address"
    }

    $seedEnabled = Read-Host "Criar usuario inicial? [s/N]"
    $seedBlock = ""
    if ($seedEnabled -eq "s" -or $seedEnabled -eq "S") {
        $seedName = Read-Host "  Nome completo"
        $seedEmail = Read-Host "  Email"
        $seedPass = Read-Host "  Senha"
        $seedBlock = @"
SEED_ENABLED=true
SEED_FULLNAME=$seedName
SEED_EMAIL=$seedEmail
SEED_PASSWORD=$seedPass
"@
    } else {
        $seedBlock = "SEED_ENABLED=false"
    }

    $appPort = Read-Host "Porta HTTP (padrao: 80)"
    if (-not $appPort) { $appPort = "80" }

    $envContent = @"
# AI Assets Hub - Generated $(Get-Date -Format 'yyyy-MM-dd HH:mm')

# PostgreSQL
POSTGRES_DB=ai_assets_hub
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$pgPassword

# JWT
JWT_SIGNING_KEY=$jwtKey
JWT_EXPIRATION_MINUTES=120

# URLs
CORS_ORIGIN=$domain
FRONTEND_BASE_URL=$domain
NEXT_PUBLIC_API_BASE_URL=$domain
APP_PORT=$appPort

# Email domains
ALLOWED_DOMAIN_0=lg.com
ALLOWED_DOMAIN_1=lg.com.br

# Admin
ADMIN_EMAIL_0=$adminEmail

# Email
EMAIL_PROVIDER=$emailProvider
EMAIL_ACS_CONNECTION_STRING=$acsConn
EMAIL_ACS_SENDER=$acsSender

# Seed
$seedBlock
"@

    Set-Content -Path $envFile -Value $envContent -Encoding UTF8
    Write-Host ""
    Write-Host "Arquivo .env criado com sucesso." -ForegroundColor Green
    Write-Host ""

    if ($EnvOnly) {
        Write-Host "Pronto. Execute .\deploy.ps1 para aplicar." -ForegroundColor Cyan
        exit 0
    }
}

# --- Build and deploy ---
Write-Host "Construindo e iniciando containers..." -ForegroundColor Yellow
Write-Host ""

docker compose down
docker compose up -d --build

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deploy concluido!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Read .env to show URL
$envVars = Get-Content $envFile | Where-Object { $_ -match "=" -and $_ -notmatch "^\s*#" }
$frontendUrl = ($envVars | Where-Object { $_ -match "^FRONTEND_BASE_URL=" }) -replace "^FRONTEND_BASE_URL=", ""
$port = ($envVars | Where-Object { $_ -match "^APP_PORT=" }) -replace "^APP_PORT=", ""

Write-Host "  Acesse: $frontendUrl$(if ($port -and $port -ne '80') { ":$port" })" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Comandos uteis:" -ForegroundColor DarkGray
Write-Host "    docker compose logs -f        # Ver logs" -ForegroundColor DarkGray
Write-Host "    docker compose restart        # Reiniciar" -ForegroundColor DarkGray
Write-Host "    docker compose down           # Parar tudo" -ForegroundColor DarkGray
Write-Host "    .\deploy.ps1 -EnvOnly        # Reconfigurar" -ForegroundColor DarkGray
Write-Host ""
