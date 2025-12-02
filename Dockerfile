# --- Stage 1: Builder ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy all project files
COPY . .

# --- Stage 2: Runtime ---
FROM node:20-alpine AS runtime
WORKDIR /app

# ❌ Removed: ENV NODE_ENV=production

# Copy everything from builder
COPY --from=builder /app /app

# Expose app port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
