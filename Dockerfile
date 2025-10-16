# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm install -g typescript ts-node

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Create data directory for JSON storage
RUN mkdir -p /app/data

# Set volume for persistent data
VOLUME ["/app/data"]

# Run the bot
CMD ["npm", "start"]