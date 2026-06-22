# ==============================================================
# AI Assets Hub - PostgreSQL Backup
# ==============================================================
# Usage:
#   powershell -ExecutionPolicy Bypass -File C:\ai-assets-hub\tools\backup-db.ps1
#
# Gera um dump completo do banco em C:\ai-assets-hub-deploy\backups\
# Mantém os últimos 30 backups, apaga os mais antigos.
# ==============================================================

$ErrorActionPreference = "Stop"

$BACKUP_DIR = "C:\ai-assets-hub-deploy\backups"
$PG_BIN = "C:\Program Files\PostgreSQL\16\bin"
$DB_NAME = "ai_assets_hub"
$DB_USER = "postgres"
$DB_HOST = "localhost"
$KEEP_LAST = 30

$env:PGPASSWORD = "fpw"
$env:PGCLIENTENCODING = "UTF8"

New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = Join-Path $BACKUP_DIR "ai_assets_hub_$timestamp.sql"

Write-Host "Backup do banco $DB_NAME..." -ForegroundColor Yellow

& "$PG_BIN\pg_dump.exe" -U $DB_USER -h $DB_HOST -d $DB_NAME -F p -f $backupFile

if ($LASTEXITCODE -eq 0) {
    $size = [math]::Round((Get-Item $backupFile).Length / 1KB, 1)
    Write-Host "  OK: $backupFile ($size KB)" -ForegroundColor Green
} else {
    Write-Host "  ERRO no backup!" -ForegroundColor Red
    exit 1
}

# Limpar backups antigos
$backups = Get-ChildItem $BACKUP_DIR -Filter "ai_assets_hub_*.sql" | Sort-Object Name -Descending
if ($backups.Count -gt $KEEP_LAST) {
    $toDelete = $backups | Select-Object -Skip $KEEP_LAST
    foreach ($old in $toDelete) {
        Remove-Item $old.FullName -Force
        Write-Host "  Removido backup antigo: $($old.Name)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Backups em: $BACKUP_DIR ($($backups.Count) arquivos)" -ForegroundColor Cyan

Remove-Item Env:\PGPASSWORD
