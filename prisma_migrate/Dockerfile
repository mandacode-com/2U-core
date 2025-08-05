# Base image with Node 24
FROM node:24-alpine AS base

# =============================
# 1. Dependencies Layer
# =============================
FROM base AS deps

# Compatibility packages (if needed)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy only prisma_migrate dependencies
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# =============================
# 2. Prisma Client Layer
# =============================
FROM base AS prisma-builder

WORKDIR /app

# Copy installed deps
COPY --from=deps /app/node_modules ./node_modules

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# =============================
# 3. Minimal Runtime for Migration
# =============================
FROM base AS runtime

WORKDIR /app

# Set non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy entire node_modules to avoid missing nested deps like 'jiti'
COPY --from=prisma-builder /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=prisma-builder /app/prisma ./prisma

CMD ["npx", "prisma", "migrate", "deploy"]
