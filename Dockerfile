# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

# ---------- Stage 2: Production ----------
FROM node:20-alpine AS production

WORKDIR /app

# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY package*.json ./

ENV NODE_ENV=production
ENV PORT=4000
# Overridden at build/deploy time per version (1.0.0 / 1.1.0 / 2.0.0)
ARG APP_VERSION=2.0.0
ENV APP_VERSION=$APP_VERSION

USER appuser

EXPOSE 4000

# Health check for container/K8s monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/server.js"]
