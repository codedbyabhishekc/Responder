# Build
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN printf 'server {   listen 80;   server_name _;   root /usr/share/nginx/html;   location / { try_files $uri /index.html; }   add_header Access-Control-Allow-Origin "*" always;   add_header Access-Control-Allow-Headers "*" always;   add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;   if ($request_method = OPTIONS) { return 204; } }\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
