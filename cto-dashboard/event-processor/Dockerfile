FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Copy Prisma files
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "start"]
