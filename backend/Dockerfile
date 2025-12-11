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

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (bcrypt will build correctly with build tools)
RUN npm install

# Generate Prisma Client (doesn't need database connection)
RUN npx prisma generate

# Copy source code (excluding node_modules via .dockerignore)
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

