FROM node:20-slim AS base
RUN apt-get update && apt-get install -y openssl

# Setup workspace
FROM base AS workspace
WORKDIR /app
COPY . .
RUN npm install
RUN npx nx build ecfrop-web

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and dependencies
COPY --from=workspace /app/apps/ecfrop-web/build ./build
COPY --from=workspace /app/apps/ecfrop-web/public ./public
COPY --from=workspace /app/apps/ecfrop-web/package.json .
COPY --from=workspace /app/libs/database ./libs/database

# Install production dependencies
RUN npm install --omit=dev

# Start the app
CMD ["npm", "start"] 