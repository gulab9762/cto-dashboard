#!/bin/bash

set -e

# Configuration
SERVICES=${1:-"all"}

echo "🚀 Starting pipeline: Rebuild and Restart [$SERVICES]"

wait_for_keycloak() {
  echo "⏳ Waiting for Keycloak to be ready (this takes ~30s on first boot)..."
  until docker exec keycloak sh -c "exec 3<>/dev/tcp/localhost/8080 && echo 'GET /health/ready HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n' >&3 2>/dev/null" 2>/dev/null | grep -q "200"; do
    printf '.'
    sleep 3
  done
  echo ""
  echo "✅ Keycloak is ready!"
  echo "   🔑 Admin Console : http://localhost:8080/admin  (admin / admin)"
  echo "   🌐 Realm         : http://localhost:8080/realms/cto-dashboard"
  echo "   📋 OIDC Discovery: http://localhost:8080/realms/cto-dashboard/.well-known/openid-configuration"
}

if [ "$SERVICES" == "sso" ] || [ "$SERVICES" == "keycloak" ]; then
  echo "📦 Starting Keycloak SSO..."
  docker-compose up -d keycloak
  wait_for_keycloak
elif [ "$SERVICES" == "all" ]; then
  echo "📦 Rebuilding all services..."
  docker-compose build
  echo "🔄 Restarting all services..."
  docker-compose up -d
  echo ""
  echo "🔑 SSO Endpoints:"
  echo "   Admin Console : http://localhost:8080/admin  (admin / admin)"
  echo "   CTO Realm     : http://localhost:8080/realms/cto-dashboard"
else
  echo "📦 Rebuilding $SERVICES..."
  docker-compose build $SERVICES
  echo "🔄 Restarting $SERVICES (without restarting dependencies)..."
  docker-compose up -d --no-deps $SERVICES
fi

echo ""
echo "✅ Pipeline completed!"
docker-compose ps

