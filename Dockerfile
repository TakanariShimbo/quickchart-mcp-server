FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY index.ts ./

# Build the project
RUN npm run build