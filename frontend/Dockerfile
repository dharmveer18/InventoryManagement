# apps/frontend/Dockerfile
# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Vite builds to /dist by default
RUN npm run build

# --- Runtime stage (static via Nginx) ---
FROM nginx:alpine AS runner
# Copy optimized Nginx config (below)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Static files
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
