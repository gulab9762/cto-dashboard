#!/bin/bash

# Configuration
SERVICES=${1:-"all"}

echo "🚀 Starting pipeline: Rebuild and Restart [$SERVICES]"

if [ "$SERVICES" == "all" ]; then
    echo "📦 Rebuilding all services..."
    docker-compose build
    echo "🔄 Restarting all services..."
    docker-compose up -d
else
    echo "📦 Rebuilding $SERVICES..."
    docker-compose build $SERVICES
    echo "🔄 Restarting $SERVICES (without restarting dependencies)..."
    docker-compose up -d --no-deps $SERVICES
fi

echo "✅ Pipeline completed!"
docker-compose ps
