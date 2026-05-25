# Mundial 2026 Backend Starter

Base inicial del backend en **Spring Boot + Java 21 + PostgreSQL** con estilo **MVC** y organización modular por dominio.

## Incluye
- Configuración inicial de Spring Boot
- MVC base: controller, service, repository, entity, dto
- Seguridad base con `permitAll` para arrancar rápido
- Flyway con migración inicial
- PostgreSQL + Docker Compose
- Módulos core del MVP:
  - users
  - tournament
  - prediction

## Requisitos
- Java 21
- Maven 3.6.3+
- Docker Desktop (opcional)

## Ejecutar PostgreSQL local
```bash
docker compose up -d
```

## Ejecutar la app
```bash
./mvnw spring-boot:run
```

## Swagger
Una vez corriendo la app:
- http://localhost:8080/swagger-ui/index.html

## Variables importantes
Puedes sobreescribir estas variables por entorno:
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`

## Estructura base
```text
src/main/java/com/mundial2026/backend
 ├── common
 ├── config
 ├── security
 ├── user
 ├── tournament
 └── prediction
```

## Siguiente paso recomendado
1. Completar autenticación JWT real
2. Integrar Sportmonks desde un módulo `integration`
3. Agregar SSE o WebSocket para resultados en vivo
4. Añadir Redis para cache
