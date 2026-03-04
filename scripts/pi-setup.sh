#!/usr/bin/env bash
set -euo pipefail

# Pi Initial Setup Script
# Run this ON a Raspberry Pi to set up the BlackRoad Stripe webhook service.
#
# Usage: curl -sSL <raw-github-url>/scripts/pi-setup.sh | bash
# Or:    ssh pi@your-pi 'bash -s' < scripts/pi-setup.sh

DEPLOY_DIR="${PI_DEPLOY_DIR:-/opt/blackroad}"
SERVICE_NAME="blackroad-stripe"
NODE_MIN_VERSION="20"

echo "=== BlackRoad Pi Setup ==="

# Check Node.js
if ! command -v node &>/dev/null; then
  echo "Installing Node.js ${NODE_MIN_VERSION}..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_MIN_VERSION}.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "${NODE_VERSION}" -lt "${NODE_MIN_VERSION}" ]; then
  echo "ERROR: Node.js >= ${NODE_MIN_VERSION} required (got v${NODE_VERSION})"
  exit 1
fi
echo "Node.js: $(node -v)"

# Create deploy directory
sudo mkdir -p "${DEPLOY_DIR}"
sudo chown "$(whoami):$(whoami)" "${DEPLOY_DIR}"

# Create systemd service
sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<EOF
[Unit]
Description=BlackRoad Stripe Webhook Handler
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=${DEPLOY_DIR}
ExecStart=/usr/bin/node src/stripe/webhook.mjs
Restart=always
RestartSec=5
EnvironmentFile=${DEPLOY_DIR}/.env

[Install]
WantedBy=multi-user.target
EOF

# Create placeholder .env
if [ ! -f "${DEPLOY_DIR}/.env" ]; then
  cat > "${DEPLOY_DIR}/.env" <<EOF
# Stripe webhook secret from your Stripe dashboard
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# Port for the webhook server
STRIPE_WEBHOOK_PORT=4242

# Optional: forward events to another service
# FORWARD_URL=http://localhost:3000/api/stripe

# Health check port
HEALTH_PORT=8080
EOF
  echo "Created ${DEPLOY_DIR}/.env — edit with your real secrets"
fi

sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}"

echo ""
echo "=== Setup Complete ==="
echo "1. Edit ${DEPLOY_DIR}/.env with your Stripe webhook secret"
echo "2. Deploy code: PI_HOSTS=$(hostname).local ./scripts/pi-deploy.sh"
echo "3. Check status: sudo systemctl status ${SERVICE_NAME}"
echo "4. View logs: sudo journalctl -u ${SERVICE_NAME} -f"
