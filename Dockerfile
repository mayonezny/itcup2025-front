# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build-time ENV для Vite (если нужно пробросить URL на этапе сборки)
# пример: docker build ... --build-arg VITE_API_URL=http://localhost:10001
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

ARG VITE_LOGIN
ENV VITE_LOGIN=${VITE_LOGIN}

ARG VITE_GRAPHANA_LINK
ENV VITE_GRAPHANA_LINK=${VITE_GRAPHANA_LINK}

ARG VITE_GRAYLOG_LINK
ENV VITE_GRAYLOG_LINK=${VITE_GRAYLOG_LINK}

RUN npm run build

# ---------- runtime ----------
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Статика фронта
COPY --from=build /app/dist ./

# Наш конфиг nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx","-g","daemon off;"]
