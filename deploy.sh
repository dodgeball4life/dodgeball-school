#!/bin/bash
set -euo pipefail

# Load credentials from .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

SSH_HOST="${SSH_HOST:-dodgeballschool.nl}"
SSH_USER="${SSH_USER:-dodgeballschool}"
SSH_PORT="${SSH_PORT:-26}"
SSH_PASS="${SSH_PASS:-}"
SSH_KEY="${SSH_KEY:-}"
REMOTE_DIR="${REMOTE_DIR:-public_html}"

# Helpers
info()    { echo "  $1"; }
success() { echo "✓ $1"; }
error()   { echo "✗ $1" >&2; exit 1; }

SSH_OPTS="-p $SSH_PORT -o StrictHostKeyChecking=no"

if [ -n "$SSH_KEY" ]; then
  SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
  SSH_CMD="ssh $SSH_OPTS"
  RSYNC_CMD="rsync -az --delete -e 'ssh $SSH_OPTS'"
elif [ -n "$SSH_PASS" ]; then
  if ! command -v sshpass &>/dev/null; then
    error "sshpass niet gevonden. Installeer via: brew install hudochenkov/sshpass/sshpass"
  fi
  SSH_CMD="sshpass -p '$SSH_PASS' ssh $SSH_OPTS"
  RSYNC_CMD="sshpass -p '$SSH_PASS' rsync -az --delete -e 'ssh $SSH_OPTS'"
else
  error "Geen SSH_KEY of SSH_PASS ingesteld in .env"
fi

# Build
info "Bouwen..."
npm run build --silent
success "Build klaar"

# Upload
info "Uploaden naar $SSH_USER@$SSH_HOST:$REMOTE_DIR..."
eval "$RSYNC_CMD dist/ $SSH_USER@$SSH_HOST:$REMOTE_DIR/"
success "Upload klaar"

# Fix permissions
info "Permissies instellen..."
eval "$SSH_CMD $SSH_USER@$SSH_HOST \
  'find $REMOTE_DIR/assets -type f | xargs chmod 644 && find $REMOTE_DIR/assets -type d | xargs chmod 755'"
success "Permissies OK"

echo ""
echo "Deploy klaar → https://$SSH_HOST"
