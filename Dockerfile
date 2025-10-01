# /Dockerfile
# Build the application
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Create the production image
FROM node:18-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production


COPY --from=builder /usr/src/app/dist ./dist


RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs
USER nodeuser

EXPOSE 4000
CMD ["ls", "-lR", "/usr/src/app"]
