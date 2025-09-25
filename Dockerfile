# /Dockerfile
# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# 1. Instala dependencias de compilación
COPY package*.json ./
RUN npm ci

# 2. Copia el resto del código y compila
COPY . .
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine
WORKDIR /usr/src/app

# Copia solo los package.json y vuelve a instalar en modo producción
COPY package*.json ./
RUN npm ci --only=production

# Copia artefactos compilados de la etapa builder
COPY --from=builder /usr/src/app/dist ./dist

# Configura usuario no root por seguridad
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs
USER nodeuser

EXPOSE 3000
CMD ["node", "dist/main.js"]
