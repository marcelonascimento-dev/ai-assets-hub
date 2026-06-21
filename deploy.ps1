# ==============================================================
# AI Assets Hub - Deploy Script (sem Docker)
# ==============================================================
# Roda backend (.NET 8) e frontend (Next.js) direto na VM
#
# Usage:
#   .\deploy.ps1                  # Instalacao completa
#   .\deploy.ps1 -SkipPrereqs     # Pular instalacao de .NET/Node
#   .\deploy.ps1 -EnvOnly         # Apenas reconfigurar .env
#   .\deploy.ps1 -RestartOnly     # Apenas reiniciar servicos
# ==============================================================

param(
    [switch]$SkipPrereqs,
    [switch]$EnvOnly,
    [switch]$RestartOnly
)

$ErrorActionPreference = "Stop"
$ROOT = $PSScriptRoot
$BACKEND_SRC = Join-Path $ROOT "src\backend"
$FRONTEND_SRC = Join-Path $ROOT "src\frontend"
$DEPLOY_DIR = "C:\ai-assets-hub-deploy"
$BACKEND_DEPLOY = Join-Path $DEPLOY_DIR "backend"
$FRONTEND_DEPLOY = Join-Path $DEPLOY_DIR "frontend"
$NSSM_DIR = Join-Path $DEPLOY_DIR "nssm"
$ENV_FILE = Join-Path $ROOT ".env"

# ---- Resolve executable paths (always runs) ----
function Find-Dotnet {
    $cmd = Get-Command dotnet -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $local = "$env:LOCALAPPDATA\Microsoft\dotnet\dotnet.exe"
    if (Test-Path $local) { return $local }
    $program = "C:\Program Files\dotnet\dotnet.exe"
    if (Test-Path $program) { return $program }
    return $null
}

function Find-Node {
    $cmd = Get-Command node -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $program = "C:\Program Files\nodejs\node.exe"
    if (Test-Path $program) { return $program }
    return $null
}

function Find-Npm {
    $cmd = Get-Command npm -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $program = "C:\Program Files\nodejs\npm.cmd"
    if (Test-Path $program) { return $program }
    return $null
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Assets Hub - Deploy (sem Docker)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ---- Restart Only ----
if ($RestartOnly) {
    Write-Host "Reiniciando servicos..." -ForegroundColor Yellow
    $nssmExe = Join-Path $NSSM_DIR "nssm.exe"
    & $nssmExe restart AiAssetsHub-Backend 2>$null
    & $nssmExe restart AiAssetsHub-Frontend 2>$null
    Write-Host "Servicos reiniciados." -ForegroundColor Green
    exit 0
}

# ---- .env setup ----
function Setup-Env {
    Write-Host "Configurando variaveis de ambiente..." -ForegroundColor Yellow
    Write-Host ""

    $jwtKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object { [char]$_ })

    $domain = Read-Host "URL publica do sistema (ex: http://10.0.0.5 ou https://ai-assets.lg.com.br)"
    $domain = $domain.TrimEnd('/')
    if (-not $domain) { $domain = "http://localhost" }

    $pgHost = Read-Host "Host do PostgreSQL (padrao: localhost)"
    if (-not $pgHost) { $pgHost = "localhost" }

    $pgPort = Read-Host "Porta do PostgreSQL (padrao: 5432)"
    if (-not $pgPort) { $pgPort = "5432" }

    $pgDb = Read-Host "Nome do banco (padrao: ai_assets_hub)"
    if (-not $pgDb) { $pgDb = "ai_assets_hub" }

    $pgUser = Read-Host "Usuario PostgreSQL (padrao: postgres)"
    if (-not $pgUser) { $pgUser = "postgres" }

    $pgPassword = Read-Host "Senha PostgreSQL"
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

    $seedBlock = "SEED_ENABLED=false"
    $seedEnabled = Read-Host "Criar usuario inicial? [s/N]"
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
    }

    $backendPort = Read-Host "Porta do backend (padrao: 8080)"
    if (-not $backendPort) { $backendPort = "8080" }

    $frontendPort = Read-Host "Porta do frontend (padrao: 3000)"
    if (-not $frontendPort) { $frontendPort = "3000" }

    $envContent = @"
# AI Assets Hub - Generated $(Get-Date -Format 'yyyy-MM-dd HH:mm')

# PostgreSQL
PG_CONNECTION_STRING=Host=$pgHost;Port=$pgPort;Database=$pgDb;Username=$pgUser;Password=$pgPassword

# JWT
JWT_SIGNING_KEY=$jwtKey
JWT_EXPIRATION_MINUTES=120

# URLs
SITE_URL=$domain
BACKEND_PORT=$backendPort
FRONTEND_PORT=$frontendPort

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

    Set-Content -Path $ENV_FILE -Value $envContent -Encoding UTF8
    Write-Host ""
    Write-Host "Arquivo .env criado." -ForegroundColor Green
}

if (-not (Test-Path $ENV_FILE) -or $EnvOnly) {
    Setup-Env
    if ($EnvOnly) {
        Write-Host "Pronto. Execute .\deploy.ps1 para aplicar." -ForegroundColor Cyan
        exit 0
    }
}

# ---- Read .env ----
function Read-EnvFile {
    $vars = @{}
    Get-Content $ENV_FILE | ForEach-Object {
        if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
            $vars[$Matches[1].Trim()] = $Matches[2].Trim()
        }
    }
    return $vars
}

$env_vars = Read-EnvFile

# ---- Prerequisites ----
if (-not $SkipPrereqs) {
    Write-Host "Verificando pre-requisitos..." -ForegroundColor Yellow

    # .NET 8 SDK
    $dotnetExe = Find-Dotnet
    $dotnetOk = $false
    if ($dotnetExe) {
        try {
            $dotnetVersion = & $dotnetExe --version 2>$null
            if ($dotnetVersion -match "^8\.") { $dotnetOk = $true }
        } catch {}
    }

    if (-not $dotnetOk) {
        Write-Host "  Instalando .NET 8 SDK..." -ForegroundColor Yellow
        Invoke-WebRequest -Uri "https://dot.net/v1/dotnet-install.ps1" -OutFile (Join-Path $env:TEMP "dotnet-install.ps1")
        & powershell -ExecutionPolicy Bypass -File (Join-Path $env:TEMP "dotnet-install.ps1") -Channel 8.0
        Write-Host "  .NET 8 instalado." -ForegroundColor Green
    } else {
        Write-Host "  .NET 8 SDK OK ($dotnetVersion)" -ForegroundColor Green
    }

    # Node.js
    $nodeExe = Find-Node
    if (-not $nodeExe) {
        Write-Host "  Instalando Node.js 22..." -ForegroundColor Yellow
        $nodeInstaller = Join-Path $env:TEMP "node-setup.msi"
        Invoke-WebRequest -Uri "https://nodejs.org/dist/v22.16.0/node-v22.16.0-x64.msi" -OutFile $nodeInstaller
        Start-Process msiexec.exe -ArgumentList "/i `"$nodeInstaller`" /qn" -Wait -NoNewWindow
        Write-Host "  Node.js instalado." -ForegroundColor Green
    } else {
        $nodeVersion = & $nodeExe --version 2>$null
        Write-Host "  Node.js OK ($nodeVersion)" -ForegroundColor Green
    }

    Write-Host ""
}

# ---- Ensure NSSM exists (always, even with -SkipPrereqs) ----
$nssmExe = Join-Path $NSSM_DIR "nssm.exe"
if (-not (Test-Path $nssmExe)) {
    Write-Host "Instalando NSSM (service manager)..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $NSSM_DIR | Out-Null
    $bundledNssm = Join-Path $ROOT "tools\nssm.exe"
    if (Test-Path $bundledNssm) {
        Copy-Item $bundledNssm $nssmExe
        Write-Host "  NSSM copiado do repositorio." -ForegroundColor Green
    } else {
        Write-Host "  ERRO: tools\nssm.exe nao encontrado no repositorio." -ForegroundColor Red
        exit 1
    }
}

# ---- Resolve paths for build ----
$dotnetExe = Find-Dotnet
if (-not $dotnetExe) {
    Write-Host ".NET SDK nao encontrado. Execute sem -SkipPrereqs primeiro." -ForegroundColor Red
    exit 1
}
$nodeExe = Find-Node
$npmExe = Find-Npm
if (-not $nodeExe -or -not $npmExe) {
    Write-Host "Node.js nao encontrado. Execute sem -SkipPrereqs primeiro." -ForegroundColor Red
    exit 1
}

# ---- Build Backend ----
Write-Host "Compilando backend..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $BACKEND_DEPLOY | Out-Null

& $dotnetExe publish "$BACKEND_SRC\AiAssetsHub.Api\AiAssetsHub.Api.csproj" `
    -c Release `
    -o $BACKEND_DEPLOY `
    --nologo `
    -v q

Write-Host "  Backend compilado em $BACKEND_DEPLOY" -ForegroundColor Green

# ---- Build Frontend ----
Write-Host "Compilando frontend..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $FRONTEND_DEPLOY | Out-Null

Push-Location $FRONTEND_SRC

$env:NEXT_PUBLIC_API_BASE_URL = $env_vars["SITE_URL"]
& $npmExe ci --ignore-scripts 2>$null
& $npmExe run build

# Copy standalone output
if (Test-Path ".next\standalone") {
    Copy-Item -Path ".next\standalone\*" -Destination $FRONTEND_DEPLOY -Recurse -Force
    if (Test-Path ".next\static") {
        New-Item -ItemType Directory -Force -Path "$FRONTEND_DEPLOY\.next\static" | Out-Null
        Copy-Item -Path ".next\static\*" -Destination "$FRONTEND_DEPLOY\.next\static" -Recurse -Force
    }
    if (Test-Path "public") {
        New-Item -ItemType Directory -Force -Path "$FRONTEND_DEPLOY\public" | Out-Null
        Copy-Item -Path "public\*" -Destination "$FRONTEND_DEPLOY\public" -Recurse -Force
    }
}

Pop-Location
Write-Host "  Frontend compilado em $FRONTEND_DEPLOY" -ForegroundColor Green

# ---- Configure and Install Services ----
Write-Host ""
Write-Host "Configurando servicos Windows..." -ForegroundColor Yellow

$backendPort = if ($env_vars["BACKEND_PORT"]) { $env_vars["BACKEND_PORT"] } else { "8080" }
$frontendPort = if ($env_vars["FRONTEND_PORT"]) { $env_vars["FRONTEND_PORT"] } else { "3000" }

# Stop and remove existing services (ignore errors on first install)
$ErrorActionPreference = "SilentlyContinue"
& $nssmExe stop AiAssetsHub-Backend 2>&1 | Out-Null
& $nssmExe stop AiAssetsHub-Frontend 2>&1 | Out-Null
Start-Sleep -Seconds 2
& $nssmExe remove AiAssetsHub-Backend confirm 2>&1 | Out-Null
& $nssmExe remove AiAssetsHub-Frontend confirm 2>&1 | Out-Null
$ErrorActionPreference = "Stop"

# ---- Backend Service ----
& $nssmExe install AiAssetsHub-Backend $dotnetExe "AiAssetsHub.Api.dll"
& $nssmExe set AiAssetsHub-Backend AppDirectory $BACKEND_DEPLOY
& $nssmExe set AiAssetsHub-Backend DisplayName "AI Assets Hub - Backend"
& $nssmExe set AiAssetsHub-Backend Description "ASP.NET Core API for AI Assets Hub"
& $nssmExe set AiAssetsHub-Backend Start SERVICE_AUTO_START
& $nssmExe set AiAssetsHub-Backend AppStdout "$DEPLOY_DIR\backend-stdout.log"
& $nssmExe set AiAssetsHub-Backend AppStderr "$DEPLOY_DIR\backend-stderr.log"
& $nssmExe set AiAssetsHub-Backend AppRotateFiles 1
& $nssmExe set AiAssetsHub-Backend AppRotateBytes 5242880

# Set environment variables for the backend service
$backendEnv = @(
    "ASPNETCORE_ENVIRONMENT=Production",
    "ASPNETCORE_URLS=http://+:$backendPort",
    "ConnectionStrings__Postgres=$($env_vars['PG_CONNECTION_STRING'])",
    "Authentication__Jwt__SigningKey=$($env_vars['JWT_SIGNING_KEY'])",
    "Authentication__Jwt__Issuer=AiAssetsHub",
    "Authentication__Jwt__Audience=AiAssetsHub.Frontend",
    "Authentication__Jwt__ExpirationMinutes=$($env_vars['JWT_EXPIRATION_MINUTES'])",
    "CorsOrigins__0=$($env_vars['SITE_URL'])",
    "AuthFlows__FrontendBaseUrl=$($env_vars['SITE_URL'])",
    "AuthFlows__ExposeActionUrlsInApi=false",
    "AllowedEmailDomains__Domains__0=$($env_vars['ALLOWED_DOMAIN_0'])",
    "AllowedEmailDomains__Domains__1=$($env_vars['ALLOWED_DOMAIN_1'])",
    "AdminEmails__0=$($env_vars['ADMIN_EMAIL_0'])",
    "EmailDelivery__Provider=$($env_vars['EMAIL_PROVIDER'])",
    "EmailDelivery__AzureCommunicationServices__ConnectionString=$($env_vars['EMAIL_ACS_CONNECTION_STRING'])",
    "EmailDelivery__AzureCommunicationServices__SenderAddress=$($env_vars['EMAIL_ACS_SENDER'])",
    "EmailDelivery__AzureCommunicationServices__SenderDisplayName=AI Assets Hub"
)

if ($env_vars["SEED_ENABLED"] -eq "true") {
    $backendEnv += "Seed__InitialContributor__Enabled=true"
    $backendEnv += "Seed__InitialContributor__FullName=$($env_vars['SEED_FULLNAME'])"
    $backendEnv += "Seed__InitialContributor__Email=$($env_vars['SEED_EMAIL'])"
    $backendEnv += "Seed__InitialContributor__Password=$($env_vars['SEED_PASSWORD'])"
}

$multiEnv = $backendEnv -join "`n"
& $nssmExe set AiAssetsHub-Backend AppEnvironmentExtra $multiEnv

# ---- Frontend Service ----
& $nssmExe install AiAssetsHub-Frontend $nodeExe "server.js"
& $nssmExe set AiAssetsHub-Frontend AppDirectory $FRONTEND_DEPLOY
& $nssmExe set AiAssetsHub-Frontend DisplayName "AI Assets Hub - Frontend"
& $nssmExe set AiAssetsHub-Frontend Description "Next.js frontend for AI Assets Hub"
& $nssmExe set AiAssetsHub-Frontend Start SERVICE_AUTO_START
& $nssmExe set AiAssetsHub-Frontend AppStdout "$DEPLOY_DIR\frontend-stdout.log"
& $nssmExe set AiAssetsHub-Frontend AppStderr "$DEPLOY_DIR\frontend-stderr.log"
& $nssmExe set AiAssetsHub-Frontend AppRotateFiles 1
& $nssmExe set AiAssetsHub-Frontend AppRotateBytes 5242880

$frontendEnv = @(
    "PORT=$frontendPort",
    "HOSTNAME=0.0.0.0"
) -join "`n"
& $nssmExe set AiAssetsHub-Frontend AppEnvironmentExtra $frontendEnv

# ---- Start Services ----
Write-Host "Iniciando servicos..." -ForegroundColor Yellow
& $nssmExe start AiAssetsHub-Backend
Start-Sleep -Seconds 3
& $nssmExe start AiAssetsHub-Frontend

# ---- Firewall rules ----
Write-Host "Configurando firewall..." -ForegroundColor Yellow
try {
    New-NetFirewallRule -DisplayName "AI Assets Hub Backend" -Direction Inbound -Port $backendPort -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
    New-NetFirewallRule -DisplayName "AI Assets Hub Frontend" -Direction Inbound -Port $frontendPort -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
} catch {
    Write-Host "  Nao foi possivel configurar firewall automaticamente." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deploy concluido!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Backend:  http://localhost:$backendPort" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:$frontendPort" -ForegroundColor Cyan
Write-Host "  Site:     $($env_vars['SITE_URL'])" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Logs em: $DEPLOY_DIR\*.log" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Comandos uteis:" -ForegroundColor DarkGray
Write-Host "    .\deploy.ps1 -RestartOnly     # Reiniciar servicos" -ForegroundColor DarkGray
Write-Host "    .\deploy.ps1 -EnvOnly         # Reconfigurar" -ForegroundColor DarkGray
Write-Host "    .\deploy.ps1 -SkipPrereqs     # Rebuild sem reinstalar" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  No Azure, abra as portas $backendPort e $frontendPort" -ForegroundColor Yellow
Write-Host "  em Networking > Inbound port rules." -ForegroundColor Yellow
Write-Host ""
