# SICV

Aplicacion MVP para certificacion y verificacion institucional.

## Levantar todo con Docker

```bash
docker compose up --build
```

Servicios:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- OpenAPI: http://localhost:8000/docs
- PostgreSQL: localhost:5433

Credenciales locales de PostgreSQL:

- Base de datos: `sicv`
- Usuario: `sicv`
- Password: `sicv_dev_password`
- Clave admin local: `sicv-admin-local`

La base se inicializa con tablas y datos demo desde `docker/postgres/init`.
Los documentos cargados se guardan en el volumen Docker `sicv_uploads` y sus metadatos/hash se registran en PostgreSQL.
Cada certificado nuevo genera automaticamente un token publico no secuencial y un QR SVG de verificacion. El QR queda disponible desde el expediente administrativo para descargarlo e insertarlo en el certificado fisico o digital.

Regla de acceso: el QR generado, los documentos internos y toda modificacion administrativa solo estan disponibles mediante endpoints `/api/v1/admin/*` protegidos por `X-Admin-Token`. En Docker local la clave se define con `ADMIN_API_TOKEN`.

## Comandos utiles

```bash
docker compose down
docker compose down -v
docker compose logs -f backend
docker compose logs -f frontend
```

Usa `docker compose down -v` solo si quieres borrar el volumen local de PostgreSQL y recrear la data demo desde cero.

## pgAdmin

Para conectarte desde pgAdmin al PostgreSQL del contenedor:

- Host: `localhost`
- Puerto: `5433`
- Base de datos: `sicv`
- Usuario: `sicv`
- Password: `sicv_dev_password`
