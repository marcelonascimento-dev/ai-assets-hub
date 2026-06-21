#!/bin/bash
# ==============================================================
# AI Assets Hub - Deploy Script (Linux/macOS)
# ==============================================================
# Usage:
#   ./deploy.sh              # First install or update
#   ./deploy.sh --env-only   # Just regenerate .env interactively
# ==============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
ENV_ONLY=false

if [ "$1" = "--env-only" ]; then
    ENV_ONLY=true
fi

echo ""
echo "========================================"
echo "  AI Assets Hub - Deploy"
echo "========================================"
echo ""

# --- Check prerequisites ---
if ! command -v docker &>/dev/null; then
    echo "Docker nao encontrado. Instale: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker compose version &>/dev/null 2>&1; then
    echo "Docker Compose nao encontrado."
    exit 1
fi

# --- .env setup ---
if [ ! -f "$ENV_FILE" ] || [ "$ENV_ONLY" = true ]; then
    echo "Configurando variaveis de ambiente..."
    echo ""

    JWT_KEY=$(openssl rand -base64 64 | tr -d '\n')

    read -rp "URL publica do sistema (ex: https://ai-assets.lg.com.br): " DOMAIN
    DOMAIN="${DOMAIN%/}"
    [ -z "$DOMAIN" ] && DOMAIN="http://localhost"

    read -rp "Senha do PostgreSQL (deixe vazio para gerar): " PG_PASS
    if [ -z "$PG_PASS" ]; then
        PG_PASS=$(openssl rand -base64 24 | tr -d '\n/+=')
        echo "  Senha gerada: $PG_PASS"
    fi

    read -rp "Email do admin (padrao: marcelo.nascimento@lg.com.br): " ADMIN_EMAIL
    [ -z "$ADMIN_EMAIL" ] && ADMIN_EMAIL="marcelo.nascimento@lg.com.br"

    read -rp "Provedor de email [AzureCommunicationServices / DevelopmentLink] (padrao: DevelopmentLink): " EMAIL_PROV
    [ -z "$EMAIL_PROV" ] && EMAIL_PROV="DevelopmentLink"

    ACS_CONN=""
    ACS_SENDER=""
    if [ "$EMAIL_PROV" = "AzureCommunicationServices" ]; then
        read -rp "Azure Communication Services - Connection String: " ACS_CONN
        read -rp "Azure Communication Services - Sender Address: " ACS_SENDER
    fi

    SEED_BLOCK="SEED_ENABLED=false"
    read -rp "Criar usuario inicial? [s/N]: " CREATE_SEED
    if [ "$CREATE_SEED" = "s" ] || [ "$CREATE_SEED" = "S" ]; then
        read -rp "  Nome completo: " SEED_NAME
        read -rp "  Email: " SEED_EMAIL
        read -rp "  Senha: " SEED_PASS
        SEED_BLOCK="SEED_ENABLED=true
SEED_FULLNAME=$SEED_NAME
SEED_EMAIL=$SEED_EMAIL
SEED_PASSWORD=$SEED_PASS"
    fi

    read -rp "Porta HTTP (padrao: 80): " APP_PORT
    [ -z "$APP_PORT" ] && APP_PORT="80"

    cat > "$ENV_FILE" <<EOF
# AI Assets Hub - Generated $(date '+%Y-%m-%d %H:%M')

# PostgreSQL
POSTGRES_DB=ai_assets_hub
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$PG_PASS

# JWT
JWT_SIGNING_KEY=$JWT_KEY
JWT_EXPIRATION_MINUTES=120

# URLs
CORS_ORIGIN=$DOMAIN
FRONTEND_BASE_URL=$DOMAIN
NEXT_PUBLIC_API_BASE_URL=$DOMAIN
APP_PORT=$APP_PORT

# Email domains
ALLOWED_DOMAIN_0=lg.com
ALLOWED_DOMAIN_1=lg.com.br

# Admin
ADMIN_EMAIL_0=$ADMIN_EMAIL

# Email
EMAIL_PROVIDER=$EMAIL_PROV
EMAIL_ACS_CONNECTION_STRING=$ACS_CONN
EMAIL_ACS_SENDER=$ACS_SENDER

# Seed
$SEED_BLOCK
EOF

    echo ""
    echo "Arquivo .env criado com sucesso."
    echo ""

    if [ "$ENV_ONLY" = true ]; then
        echo "Pronto. Execute ./deploy.sh para aplicar."
        exit 0
    fi
fi

# --- Build and deploy ---
echo "Construindo e iniciando containers..."
echo ""

cd "$SCRIPT_DIR"
docker compose down
docker compose up -d --build

echo ""
echo "========================================"
echo "  Deploy concluido!"
echo "========================================"
echo ""

FRONTEND_URL=$(grep "^FRONTEND_BASE_URL=" "$ENV_FILE" | cut -d'=' -f2-)
PORT=$(grep "^APP_PORT=" "$ENV_FILE" | cut -d'=' -f2-)

echo "  Acesse: ${FRONTEND_URL}$([ "$PORT" != "80" ] && echo ":$PORT")"
echo ""
echo "  Comandos uteis:"
echo "    docker compose logs -f        # Ver logs"
echo "    docker compose restart        # Reiniciar"
echo "    docker compose down           # Parar tudo"
echo "    ./deploy.sh --env-only        # Reconfigurar"
echo ""
