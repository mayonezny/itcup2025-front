# Dockerfile.node-serve
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=/api
ARG VITE_LOGIN=colonelsarkisyan
ARG VITE_GRAPHANA_LINK=https://lol.ru
ARG VITE_GRAYLOG_LINK=https://kek.ru
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_LOGIN=$VITE_LOGIN
ENV VITE_GRAPHANA_LINK=$VITE_GRAPHANA_LINK
ENV VITE_GRAYLOG_LINK=$VITE_GRAYLOG_LINK
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
