# ---- 1) Build stage: Vite 빌드
FROM node:20-alpine AS builder
WORKDIR /app

# 의존성 캐시 최적화
COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .

ARG VITE_API_BASE=https://algovision.co.kr
ARG VITE_BASE=/
ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_BASE=${VITE_BASE}

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK CMD curl -fsS http://localhost:80/ || exit 1