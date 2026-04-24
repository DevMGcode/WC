# WC

Proyecto con dos modulos:

- Frontend: [Frontend](Frontend)
- Backend: [Backend](Backend)

## Ejecutar con Docker (desarrollo)

Desde la raiz del repo:

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml up -d --build
```

Servicios:

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- PostgreSQL: localhost:5434
- pgAdmin: http://localhost:5050

## Detener

```bash
docker compose -f Backend/worldCup/docker-compose.dev.yml down
```
