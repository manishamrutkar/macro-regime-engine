# ── Stage 1: Python engine dependencies ──────────────────────────────
FROM python:3.11-slim AS python-base

WORKDIR /python_engine

# Install Python dependencies first (cache layer)
COPY python_engine/requirements-cloud.txt .
RUN pip install --no-cache-dir -r requirements-cloud.txt

# Copy Python engine source
COPY python_engine/ .

# ── Stage 2: Node.js backend ─────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Install Python in Node image
RUN apk add --no-cache python3 py3-pip gcc musl-dev python3-dev linux-headers

# Copy Python deps from stage 1
COPY --from=python-base /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=python-base /python_engine /app/python_engine

# Install Node dependencies
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ .

# Create data directories
RUN mkdir -p /app/data/raw /app/data/processed

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-5000}/health || exit 1

EXPOSE ${PORT:-5000}

CMD ["node", "server.js"]
