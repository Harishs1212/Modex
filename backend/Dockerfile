FROM node:20-slim

WORKDIR /app

# Install postgresql-client, netcat, and build dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    netcat-traditional \
    openssl \
    libssl-dev \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy only package files first
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies cleanly - fresh install to rebuild native modules for Linux
RUN npm install && npm rebuild

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Use entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]

