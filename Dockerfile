# Use Ubuntu base image
FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js 20.x and npm
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files for root
COPY package*.json ./
COPY tsconfig.json ./

# Copy PWA package files
COPY src/pwa/package*.json ./src/pwa/
COPY src/pwa/tsconfig*.json ./src/pwa/
COPY src/pwa/vite.config.ts ./src/pwa/
COPY src/pwa/tailwind.config.js ./src/pwa/
COPY src/pwa/postcss.config.js ./src/pwa/

# Install root dependencies
RUN npm install --include=dev

# Install PWA dependencies
RUN cd src/pwa && npm install --include=dev

# Copy all source code
COPY src ./src

# Build TypeScript (API + Bot)
RUN npm run build:api

# Build PWA
RUN npm run build:pwa

# Remove dev dependencies to reduce image size
RUN npm prune --omit=dev && cd src/pwa && npm prune --omit=dev

# Create data directory for JSON storage
RUN mkdir -p /app/data

# Set volume for persistent data
VOLUME ["/app/data"]

# Expose API port
EXPOSE 3000

# Default command runs the API (which also serves PWA in production)
CMD ["npm", "run", "start:api"]