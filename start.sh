#!/bin/bash

echo "Starting CTO Dashboard full setup..."

# 1. Start Docker compose for infrastructure from the root directory
echo "Starting infrastructure (Kafka, databases) via docker-compose..."
# Re-use existing containers if already up, simply brings them up if down
docker compose up -d

echo "Starting all backend services and frontend concurrently in this terminal..."
# 2. Run all services concurrently
# We use npx concurrently to keep everything inside this single Antigravity embedded terminal tab without spawning external CMD popups
npx -y concurrently \
  -n "EventProcessor,IntegrationService,APIGateway,FEDashboard" \
  -c "bgBlue.bold,bgMagenta.bold,bgGreen.bold,bgCyan.bold" \
  "cd event-processor-java && java -jar target/event-processor-1.0.0-SNAPSHOT.jar" \
  "cd integration-service-java && java -jar target/integration-service-1.0.0-SNAPSHOT.jar" \
  "cd api-gateway-java && java -jar target/api-gateway-java-0.0.1-SNAPSHOT.jar" \
  "cd fe-dashboard && npm run dev"

echo "All services exited."
