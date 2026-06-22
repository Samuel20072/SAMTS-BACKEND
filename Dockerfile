# ============================================================
# Stage 1: Build
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar manifiestos de dependencias primero (cache layer)
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDeps para compilar)
RUN npm ci

# Copiar el código fuente
COPY . .

# Compilar TypeScript -> dist/
RUN npm run build

# ============================================================
# Stage 2: Production
# ============================================================
FROM node:22-alpine AS production

WORKDIR /app

# Instalar únicamente dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar artefactos de compilación
COPY --from=builder /app/dist ./dist

# Usuario no-root por seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

# Arrancar en modo producción
CMD ["node", "dist/main"]
