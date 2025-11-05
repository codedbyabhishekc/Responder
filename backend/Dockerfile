FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM base AS runtime
WORKDIR /app
COPY . .
EXPOSE 4000
CMD ["sh", "-c", "node db.js --init && node server.js"]
