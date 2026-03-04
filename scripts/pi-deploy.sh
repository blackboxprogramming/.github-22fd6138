#!/usr/bin/env bash
set -euo pipefail

# Pi Deployment Script
# Deploys services to Raspberry Pi fleet via SSH.
#
# Required env vars:
#   PI_HOSTS      — comma-separated list of Pi hostnames/IPs (e.g. "pi1.local,pi2.local,192.168.1.100")
#   PI_USER       — SSH user (default: pi)
#   PI_DEPLOY_DIR — remote deploy directory (default: /opt/blackroad)
#   PI_SSH_KEY    — path to SSH private key (default: ~/.ssh/id_ed25519)
#
# Optional:
#   PI_SERVICE    — systemd service name to restart (default: blackroad-stripe)
#   DEPLOY_REF    — git ref to deploy (default: current HEAD)

PI_USER="${PI_USER:-pi}"
PI_DEPLOY_DIR="${PI_DEPLOY_DIR:-/opt/blackroad}"
PI_SSH_KEY="${PI_SSH_KEY:-$HOME/.ssh/id_ed25519}"
PI_SERVICE="${PI_SERVICE:-blackroad-stripe}"
DEPLOY_REF="${DEPLOY_REF:-HEAD}"

if [ -z "${PI_HOSTS:-}" ]; then
  echo "ERROR: PI_HOSTS is required (comma-separated list of Pi addresses)"
  echo "Example: PI_HOSTS=pi1.local,pi2.local ./scripts/pi-deploy.sh"
  exit 1
fi

SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=10 -o BatchMode=yes -i ${PI_SSH_KEY}"
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "")
COMMIT=$(git rev-parse --short "${DEPLOY_REF}")
BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "=== BlackRoad Pi Deployment ==="
echo "Commit:    ${COMMIT}"
echo "Branch:    ${BRANCH}"
echo "Service:   ${PI_SERVICE}"
echo "Deploy to: ${PI_DEPLOY_DIR}"
echo ""

# Create deploy tarball of the src/ directory
TARBALL=$(mktemp /tmp/blackroad-deploy-XXXXXX.tar.gz)
tar czf "${TARBALL}" --exclude='.git' --exclude='node_modules' --exclude='e2e' \
  src/ package.json scripts/ 2>/dev/null || {
    echo "WARN: Some files missing from tarball, continuing..."
    tar czf "${TARBALL}" src/ package.json 2>/dev/null
  }

TARBALL_SIZE=$(wc -c < "${TARBALL}")
echo "Tarball: ${TARBALL_SIZE} bytes"
echo ""

FAILED_HOSTS=""
SUCCESS_COUNT=0

IFS=',' read -ra HOSTS <<< "${PI_HOSTS}"
for host in "${HOSTS[@]}"; do
  host=$(echo "${host}" | xargs)  # trim whitespace
  echo "--- Deploying to ${PI_USER}@${host} ---"

  # Test connectivity
  if ! ssh ${SSH_OPTS} "${PI_USER}@${host}" "echo ok" >/dev/null 2>&1; then
    echo "WARN: Cannot reach ${host}, skipping"
    FAILED_HOSTS="${FAILED_HOSTS} ${host}"
    continue
  fi

  # Create deploy dir if needed
  ssh ${SSH_OPTS} "${PI_USER}@${host}" "mkdir -p ${PI_DEPLOY_DIR}"

  # Upload tarball
  scp ${SSH_OPTS} "${TARBALL}" "${PI_USER}@${host}:/tmp/blackroad-deploy.tar.gz"

  # Extract and install
  ssh ${SSH_OPTS} "${PI_USER}@${host}" bash <<REMOTE_SCRIPT
    set -e
    cd "${PI_DEPLOY_DIR}"
    tar xzf /tmp/blackroad-deploy.tar.gz
    rm /tmp/blackroad-deploy.tar.gz

    # Install deps if npm is available
    if command -v npm &>/dev/null && [ -f package.json ]; then
      npm install --production 2>/dev/null || echo "npm install skipped"
    fi

    # Write deploy metadata
    cat > .deploy-info.json <<EOF2
{
  "commit": "${COMMIT}",
  "branch": "${BRANCH}",
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "host": "${host}"
}
EOF2

    # Restart service if systemd unit exists
    if systemctl list-unit-files "${PI_SERVICE}.service" &>/dev/null; then
      sudo systemctl restart "${PI_SERVICE}" && echo "Service ${PI_SERVICE} restarted" || echo "Service restart failed"
    else
      echo "No systemd service '${PI_SERVICE}' found — manual start required"
      echo "Run: cd ${PI_DEPLOY_DIR} && node src/stripe/webhook.mjs"
    fi
REMOTE_SCRIPT

  echo "OK: ${host} deployed"
  SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  echo ""
done

rm -f "${TARBALL}"

echo "=== Deployment Summary ==="
echo "Successful: ${SUCCESS_COUNT}/${#HOSTS[@]}"
if [ -n "${FAILED_HOSTS}" ]; then
  echo "Failed:${FAILED_HOSTS}"
  exit 1
fi
echo "All Pis deployed successfully."
