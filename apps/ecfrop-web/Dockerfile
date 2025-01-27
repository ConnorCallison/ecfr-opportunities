FROM node:20-slim AS builder

# Install OpenSSL and other build dependencies
RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Copy the entire workspace for Nx build
COPY . .

# Install all dependencies (including dev dependencies)
RUN npm install

# Build the app using Nx
RUN npx nx build ecfrop-web

# Production stage
FROM node:20-slim

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Copy built app from builder stage
COPY --from=builder /app/dist/apps/ecfrop-web/build ./build
COPY --from=builder /app/apps/ecfrop-web/public ./public

# Copy database package
COPY libs/database ./libs/database

# Install only production dependencies
RUN npm install --omit=dev

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"] 