# ── Stage 1: Build ───────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Install deps first (better caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────
FROM nginx:1.25-alpine

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
