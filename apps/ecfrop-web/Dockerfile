FROM node:20-slim

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Copy root package files
COPY package.json .
COPY package-lock.json .

# Copy built app and public files
COPY dist/apps/ecfrop-web/build ./build
COPY dist/apps/ecfrop-web/public ./public

# Copy database package
COPY libs/database ./libs/database

# Install production dependencies
RUN npm install --omit=dev

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# list the files in the current directory
RUN ls -la

CMD ["npm", "start"] 