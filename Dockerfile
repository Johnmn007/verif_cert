# ========================================================
# Dockerfile Multietapa: Frontend (React) + Backend (FastAPI)
# Listo para despliegue en un solo servicio de Railway
# ========================================================

# 1. Construir el Frontend SPA
FROM node:24-alpine AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY src ./src
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# 2. Construir la imagen final con Python y FastAPI
FROM python:3.12-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY --from=frontend-builder /app/dist ./dist

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
