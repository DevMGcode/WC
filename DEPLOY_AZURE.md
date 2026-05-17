# Guía de Despliegue a Producción — OrionixGol en Azure

## Arquitectura en Azure

```
GitHub (main branch)
       │
       ▼ GitHub Actions CI/CD
┌─────────────────────────────────────────┐
│           Azure Container Registry      │
│    (imagen backend + imagen frontend)   │
└──────────┬──────────────────┬───────────┘
           │                  │
           ▼                  ▼
  App Service (Backend)   App Service (Frontend)
  Java 21 / Spring Boot   Node 20 / Next.js
  Puerto 8080              Puerto 3000
           │
           ▼
  Azure Database for PostgreSQL
  (Flexible Server)
```

---

## PASO 1 — Preparar los Dockerfiles de Producción

Los actuales son `Dockerfile.dev` (con hot reload). Se necesita uno de producción para cada servicio.

### Backend — crear `Backend/worldCup/Dockerfile`

```dockerfile
# Build stage
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apt-get update && apt-get install -y maven && mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Frontend — crear `Frontend/mundial-app/Dockerfile`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]
```

> **Importante:** Para que funcione el standalone, agregar en `Frontend/mundial-app/next.config.js`:
> ```js
> output: 'standalone'
> ```

---

## PASO 2 — Crear recursos en Azure Portal

### 2.1 Resource Group
**Portal → Resource Groups → + Create**
- Nombre: `orionixgol-rg`
- Región: `East US` o `Brazil South` (más cercano a usuarios)

### 2.2 Azure Container Registry (ACR)
**Portal → Container Registries → + Create**
- Nombre: `orionixgolacr` *(único global, sin guiones ni mayúsculas)*
- Resource Group: `orionixgol-rg`
- SKU: `Basic`
- Admin user: **Enabled** ← obligatorio para App Service

Anotar al terminar:
- Login server: `orionixgolacr.azurecr.io`
- Usuario y contraseña: Portal → ACR → Access keys

### 2.3 Azure Database for PostgreSQL Flexible Server
**Portal → Azure Database for PostgreSQL → Flexible Server → + Create**
- Nombre: `orionixgol-db`
- Resource Group: `orionixgol-rg`
- PostgreSQL version: **17**
- Compute tier: `Burstable B1ms` *(más económico)*
- Admin username: `postgresadmin`
- Password: *(guardar seguro, mínimo 12 caracteres)*
- Networking → Public access + agregar IP actual como regla de firewall

**Después de crear:**
1. Ir al servidor → **Databases** → + Add → nombre: `worldcup2026_db`
2. Ir a **Networking** → Allow public access from Azure services: **ON**

### 2.4 App Service — Backend
**Portal → App Services → + Create → Web App**
- Nombre: `orionixgol-backend`
- Publish: **Container**
- OS: **Linux**
- Region: misma que el RG
- Plan: `B1` (Basic, ~$13 USD/mes)
- Image Source: **Azure Container Registry**
- Registry: `orionixgolacr`
- Image: `backend` *(se configura después del primer push)*

### 2.5 App Service — Frontend
**Portal → App Services → + Create → Web App**
- Nombre: `orionixgol-frontend`
- URL final: `https://orionixgol-frontend.azurewebsites.net`
- Publish: **Container**
- OS: **Linux**
- Plan: `B1`

---

## PASO 3 — Variables de Entorno en Azure

### Backend
**Portal → App Service `orionixgol-backend` → Configuration → Application settings → + New**

| Nombre | Valor |
|---|---|
| `DB_URL` | `jdbc:postgresql://orionixgol-db.postgres.database.azure.com:5432/worldcup2026_db?sslmode=require` |
| `DB_USERNAME` | `postgresadmin` |
| `DB_PASSWORD` | *(password del paso 2.3)* |
| `JWT_SECRET` | *(string aleatorio de 64+ caracteres — generar uno nuevo seguro)* |
| `MAIL_HOST` | `smtp.gmail.com` |
| `MAIL_PORT` | `587` |
| `MAIL_USERNAME` | `orionixgol@gmail.com` |
| `MAIL_PASSWORD` | `djsf dgjj mion kdep` |
| `FRONTEND_URL` | `https://orionixgol-frontend.azurewebsites.net` |
| `WEBSITES_PORT` | `8080` |

### Frontend
**Portal → App Service `orionixgol-frontend` → Configuration → Application settings → + New**

| Nombre | Valor |
|---|---|
| `NEXT_PUBLIC_PUBLIC_API_URL` | `https://orionixgol-backend.azurewebsites.net` |
| `INTERNAL_API_BASE_URL` | `https://orionixgol-backend.azurewebsites.net` |
| `NEXT_PUBLIC_APP_URL` | `https://orionixgol-frontend.azurewebsites.net` |
| `NEXT_PUBLIC_GA_ID` | `G-FJGDNVCDL5` |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://a39aa7b66ccd81d016ff6d3a7a78337f@o4511406011908096.ingest.de.sentry.io/4511406039040080` |
| `NEXT_PUBLIC_ENABLE_LIVE_TRACKING` | `false` |
| `NEXT_PUBLIC_ENABLE_VIDEO_HIGHLIGHTS` | `false` |
| `NEXT_PUBLIC_ENABLE_MONETARY_BETTING` | `false` |
| `WEBSITES_PORT` | `3000` |

> Después de agregar todas las variables → **Save** → **Restart**

---

## PASO 4 — GitHub Actions (CI/CD automático)

Crear el archivo `.github/workflows/deploy.yml` en la **raíz del repo**:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

env:
  ACR_LOGIN_SERVER: orionixgolacr.azurecr.io
  BACKEND_IMAGE: orionixgolacr.azurecr.io/backend
  FRONTEND_IMAGE: orionixgolacr.azurecr.io/frontend

jobs:
  # ── BUILD & PUSH BACKEND ──────────────────────────────
  build-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to ACR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.ACR_LOGIN_SERVER }}
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}

      - name: Build & push backend
        uses: docker/build-push-action@v5
        with:
          context: ./Backend/worldCup
          file: ./Backend/worldCup/Dockerfile
          push: true
          tags: |
            ${{ env.BACKEND_IMAGE }}:latest
            ${{ env.BACKEND_IMAGE }}:${{ github.sha }}

  # ── BUILD & PUSH FRONTEND ─────────────────────────────
  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to ACR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.ACR_LOGIN_SERVER }}
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}

      - name: Build & push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./Frontend/mundial-app
          file: ./Frontend/mundial-app/Dockerfile
          push: true
          tags: |
            ${{ env.FRONTEND_IMAGE }}:latest
            ${{ env.FRONTEND_IMAGE }}:${{ github.sha }}

  # ── DEPLOY BACKEND ────────────────────────────────────
  deploy-backend:
    needs: build-backend
    runs-on: ubuntu-latest
    steps:
      - name: Deploy backend to App Service
        uses: azure/webapps-deploy@v3
        with:
          app-name: orionixgol-backend
          publish-profile: ${{ secrets.AZURE_BACKEND_PUBLISH_PROFILE }}
          images: ${{ env.BACKEND_IMAGE }}:${{ github.sha }}

  # ── DEPLOY FRONTEND ───────────────────────────────────
  deploy-frontend:
    needs: build-frontend
    runs-on: ubuntu-latest
    steps:
      - name: Deploy frontend to App Service
        uses: azure/webapps-deploy@v3
        with:
          app-name: orionixgol-frontend
          publish-profile: ${{ secrets.AZURE_FRONTEND_PUBLISH_PROFILE }}
          images: ${{ env.FRONTEND_IMAGE }}:${{ github.sha }}
```

### Secrets necesarios en GitHub → Settings → Secrets and variables → Actions → New repository secret

| Secret | Cómo obtenerlo |
|---|---|
| `ACR_USERNAME` | Portal → ACR `orionixgolacr` → Access keys → Username |
| `ACR_PASSWORD` | Portal → ACR `orionixgolacr` → Access keys → Password |
| `AZURE_BACKEND_PUBLISH_PROFILE` | Portal → App Service `orionixgol-backend` → Overview → **Get publish profile** → copiar todo el XML |
| `AZURE_FRONTEND_PUBLISH_PROFILE` | Portal → App Service `orionixgol-frontend` → Overview → **Get publish profile** → copiar todo el XML |

---

## PASO 5 — Primer despliegue manual (verificación inicial)

Antes de confiar en el CI, hacer un push manual para verificar que todo funciona:

```bash
# Instalar Azure CLI si no lo tenés
# https://docs.microsoft.com/cli/azure/install-azure-cli

# Login
az login
az acr login --name orionixgolacr

# Build y push backend
cd Backend/worldCup
docker build -t orionixgolacr.azurecr.io/backend:latest .
docker push orionixgolacr.azurecr.io/backend:latest

# Build y push frontend
cd ../../Frontend/mundial-app
docker build -t orionixgolacr.azurecr.io/frontend:latest .
docker push orionixgolacr.azurecr.io/frontend:latest
```

Luego en Portal → cada App Service → **Deployment Center** → verificar imagen → **Save**.

---

## PASO 6 — Dominio personalizado (opcional)

Si tenés un dominio (ej. `orionixgol.com`):
1. Portal → App Service frontend → **Custom domains** → + Add custom domain
2. Agregar en tu proveedor DNS:
   ```
   CNAME  www  →  orionixgol-frontend.azurewebsites.net
   ```
3. Portal → **TLS/SSL** → Add App Service Managed Certificate (gratis)
4. Actualizar `NEXT_PUBLIC_APP_URL` y `FRONTEND_URL` con el dominio real

---

## PASO 7 — Checklist final antes de ir live

- [ ] `JWT_SECRET` cambiado por uno seguro (nunca usar el del `.env` local en producción)
- [ ] `DB_PASSWORD` fuerte (no usar `postgres`)
- [ ] SSL habilitado — el dominio `*.azurewebsites.net` ya viene con HTTPS
- [ ] `FRONTEND_URL` en el backend apunta a la URL real de Azure (para CORS)
- [ ] Conexión a PostgreSQL usa `sslmode=require` en el `DB_URL`
- [ ] Flyway ejecuta las migraciones (V1–V16) automáticamente en el primer arranque
- [ ] Sentry DSN configurado en frontend (llega email a `orionixgol@gmail.com` cuando haya errores)
- [ ] Google Analytics ID configurado (`G-FJGDNVCDL5`)
- [ ] Probar en producción: registro, login, verificación de email, predicciones
- [ ] Verificar logs: Portal → App Service → **Log stream**

---

## Costos estimados mensuales (Azure)

| Servicio | Plan | USD/mes aprox. |
|---|---|---|
| App Service Backend | B1 Basic | ~$13 |
| App Service Frontend | B1 Basic | ~$13 |
| PostgreSQL Flexible Server | Burstable B1ms | ~$12 |
| Container Registry | Basic | ~$5 |
| **Total estimado** | | **~$43/mes** |

> Para reducir costos en fase beta se puede usar un solo App Service Plan compartido entre frontend y backend.

---

## Referencia rápida — URLs de producción

| Servicio | URL |
|---|---|
| Frontend | `https://orionixgol-frontend.azurewebsites.net` |
| Backend API | `https://orionixgol-backend.azurewebsites.net` |
| Swagger UI | `https://orionixgol-backend.azurewebsites.net/swagger-ui.html` |
| Sentry Dashboard | `https://sentry.io` (cuenta `orionixgol@gmail.com`) |
| Google Analytics | `https://analytics.google.com` (ID: `G-FJGDNVCDL5`) |
