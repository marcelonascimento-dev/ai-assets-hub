# ==============================================================
# AI Assets Hub - Update Script
# ==============================================================
# Baixa a versao mais recente, rebuilda e reinicia os servicos.
# Preserva o .env e o NSSM existentes.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File C:\ai-assets-hub\update.ps1
# ==============================================================

$ErrorActionPreference = "Stop"

$DEPLOY_DIR = "C:\ai-assets-hub-deploy"
$NSSM_DIR = Join-Path $DEPLOY_DIR "nssm"
$BACKEND_DEPLOY = Join-Path $DEPLOY_DIR "backend"
$FRONTEND_DEPLOY = Join-Path $DEPLOY_DIR "frontend"
$APP_DIR = "C:\ai-assets-hub"
$ENV_FILE = Join-Path $APP_DIR ".env"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Assets Hub - Update" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ---- Check .env exists ----
if (-not (Test-Path $ENV_FILE)) {
    Write-Host "ERRO: .env nao encontrado. Execute deploy.ps1 primeiro." -ForegroundColor Red
    exit 1
}

# ---- Backup .env ----
$envBackup = Join-Path $DEPLOY_DIR ".env.bak"
Copy-Item $ENV_FILE $envBackup -Force
Write-Host "Backup do .env salvo em $envBackup" -ForegroundColor Green

# ---- Download latest version ----
Write-Host "Baixando versao mais recente..." -ForegroundColor Yellow
$zipFile = Join-Path $env:TEMP "ai-assets-hub-update.zip"
$extractDir = Join-Path $env:TEMP "ai-assets-hub-update"

Invoke-WebRequest -Uri "https://github.com/marcelonascimento-dev/ai-assets-hub/archive/refs/heads/main.zip" -OutFile $zipFile

if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force }
Expand-Archive $zipFile -DestinationPath $extractDir -Force

$sourceDir = Join-Path $extractDir "ai-assets-hub-main"

# ---- Preserve .env and replace source ----
Remove-Item $APP_DIR -Recurse -Force
Move-Item $sourceDir $APP_DIR

# Restore .env
Copy-Item $envBackup $ENV_FILE -Force
Write-Host "  .env restaurado." -ForegroundColor Green

# Cleanup
Remove-Item $zipFile -Force
Remove-Item $extractDir -Recurse -Force -ErrorAction SilentlyContinue

# ---- Read .env ----
$env_vars = @{}
Get-Content $ENV_FILE | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
        $env_vars[$Matches[1].Trim()] = $Matches[2].Trim()
    }
}

# ---- Resolve paths ----
function Find-Exe($name, $fallbacks) {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    foreach ($p in $fallbacks) { if (Test-Path $p) { return $p } }
    return $null
}

$dotnetExe = Find-Exe "dotnet" @("$env:LOCALAPPDATA\Microsoft\dotnet\dotnet.exe", "C:\Program Files\dotnet\dotnet.exe")
$npmExe = Find-Exe "npm" @("C:\Program Files\nodejs\npm.cmd")
$nodeExe = Find-Exe "node" @("C:\Program Files\nodejs\node.exe")
$nssmExe = Join-Path $NSSM_DIR "nssm.exe"

if (-not $dotnetExe) { Write-Host "ERRO: dotnet nao encontrado." -ForegroundColor Red; exit 1 }
if (-not $npmExe) { Write-Host "ERRO: npm nao encontrado." -ForegroundColor Red; exit 1 }
if (-not (Test-Path $nssmExe)) {
    New-Item -ItemType Directory -Force -Path $NSSM_DIR | Out-Null
    Copy-Item (Join-Path $APP_DIR "tools\nssm.exe") $nssmExe
}

# ---- Stop services ----
Write-Host "Parando servicos..." -ForegroundColor Yellow
$ErrorActionPreference = "SilentlyContinue"
& $nssmExe stop AiAssetsHub-Backend 2>&1 | Out-Null
& $nssmExe stop AiAssetsHub-Frontend 2>&1 | Out-Null
Start-Sleep -Seconds 2
Stop-Process -Name "dotnet" -Force 2>&1 | Out-Null
$ErrorActionPreference = "Stop"

# ---- Rebuild Backend ----
Write-Host "Compilando backend..." -ForegroundColor Yellow
if (Test-Path $BACKEND_DEPLOY) { Remove-Item $BACKEND_DEPLOY -Recurse -Force }
New-Item -ItemType Directory -Force -Path $BACKEND_DEPLOY | Out-Null

& $dotnetExe publish "$APP_DIR\src\backend\AiAssetsHub.Api\AiAssetsHub.Api.csproj" `
    -c Release -o $BACKEND_DEPLOY --nologo -v q

Write-Host "  Backend OK" -ForegroundColor Green

# ---- Rebuild Frontend ----
Write-Host "Compilando frontend..." -ForegroundColor Yellow
if (Test-Path $FRONTEND_DEPLOY) { Remove-Item $FRONTEND_DEPLOY -Recurse -Force }
New-Item -ItemType Directory -Force -Path $FRONTEND_DEPLOY | Out-Null

Push-Location (Join-Path $APP_DIR "src\frontend")

$siteUrl = $env_vars["SITE_URL"].TrimEnd("/")
$backendPort = $env_vars["BACKEND_PORT"]
$uri = [System.Uri]$siteUrl
$apiBase = "$($uri.Scheme)://$($uri.Host):$backendPort"
$env:NEXT_PUBLIC_API_BASE_URL = $apiBase
Write-Host "  API_BASE_URL = $apiBase" -ForegroundColor Gray
& $npmExe ci --ignore-scripts 2>$null
& $npmExe run build

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
Write-Host "  Frontend OK" -ForegroundColor Green

# ---- Restart services ----
Write-Host "Reiniciando servicos..." -ForegroundColor Yellow
& $nssmExe start AiAssetsHub-Backend
Start-Sleep -Seconds 3
& $nssmExe start AiAssetsHub-Frontend

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Update concluido!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Site: $($env_vars['SITE_URL'])" -ForegroundColor Cyan
Write-Host ""
