# Despliegue en Azure — Orionix Gol

## Requisitos previos
- Cuenta de Azure activa
- Dominio propio (opcional, Azure da uno gratis)
- Git instalado en tu máquina local

---

## PASO 1 — Crear la VM en Azure

1. Ve al portal de Azure → **Máquinas virtuales → Crear**
2. Configuración recomendada:
   - **Imagen:** Ubuntu Server 22.04 LTS
   - **Tamaño:** Standard_B2s (2 vCPU, 4 GB RAM) — ~$30/mes
   - **Autenticación:** Clave SSH (más seguro que contraseña)
   - **Puertos de entrada:** 22 (SSH), 80 (HTTP), 443 (HTTPS)

3. Una vez creada, anota la **IP pública** de la VM.

---

## PASO 2 — Conectarse a la VM e instalar Docker

```bash
# Conectarse por SSH
ssh azureuser@<IP_PUBLICA_VM>

# Instalar Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Instalar Docker Compose
sudo apt-get install -y docker-compose-plugin

# Verificar
docker --version
docker compose version
```

---

## PASO 3 — Subir el código al servidor

```bash
# En tu máquina local — clonar el repo en la VM
ssh azureuser@<IP_PUBLICA_VM> "git clone https://github.com/DevMGcode/WC.git ~/app"

# O copiar directamente con scp
scp -r ./PRODUCCION_DEPLOY azureuser@<IP_PUBLICA_VM>:~/app/PRODUCCION_DEPLOY
```

---

## PASO 4 — Configurar variables de entorno

```bash
# En la VM
cd ~/app/PRODUCCION_DEPLOY

# Copiar el ejemplo y editar
cp .env.prod.example .env.prod
nano .env.prod
```

Rellena todos los valores `<CAMBIAR_...>`:

| Variable | Qué poner |
|---|---|
| `DB_PASSWORD` | Contraseña segura (mínimo 20 caracteres) |
| `POSTGRES_PASSWORD` | La misma que DB_PASSWORD |
| `JWT_SECRET` | Resultado de: `openssl rand -base64 48` |
| `APIFOOTBALL_API_KEY` | Tu clave de api-sports.io |
| `MAIL_USERNAME` | Tu cuenta Gmail |
| `MAIL_PASSWORD` | App Password de Google (16 chars) |
| `FRONTEND_URL` | `https://tu-dominio.com` |
| `NEXT_PUBLIC_API_URL` | `https://tu-dominio.com/api` |
| `NEXT_PUBLIC_APP_URL` | `https://tu-dominio.com` |
| `NEXT_PUBLIC_WS_URL` | `wss://tu-dominio.com/ws` |

---

## PASO 5 — Configurar el dominio en nginx.conf

```bash
# Reemplazar TU_DOMINIO en nginx.conf
sed -i 's/TU_DOMINIO/orionixgol.com/g' nginx.conf
```

---

## PASO 6 — Obtener certificado SSL (HTTPS gratuito)

```bash
# 1. Arrancar solo nginx en modo HTTP temporalmente
docker compose -f docker-compose.prod.yml up -d nginx

# 2. Obtener el certificado
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d tu-dominio.com \
  --email meligarcia3412@gmail.com \
  --agree-tos --no-eff-email
```

---

## PASO 7 — Arrancar todo

```bash
cd ~/app/PRODUCCION_DEPLOY

# Build y arranque completo
docker compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Ver estado de los contenedores
docker compose -f docker-compose.prod.yml ps
```

---

## PASO 8 — Verificar que funciona

```bash
# Health check del backend (Spring Boot Actuator)
curl https://tu-dominio.com/actuator/health
# → debería devolver: {"status":"UP"}

# Endpoint público de prueba (lista de torneos)
curl https://tu-dominio.com/api/v1/public/tournaments

# Frontend responde
curl -I https://tu-dominio.com
# → debería devolver: HTTP/2 200 (o 307 redirect a /es)

# Ver logs del backend en vivo
docker logs orionix-backend -f

# Ver logs del frontend en vivo
docker logs orionix-frontend -f
```

---

## Comandos útiles en producción

```bash
# Reiniciar un servicio
docker compose -f docker-compose.prod.yml restart backend

# Actualizar a nueva versión del código
git pull
docker compose -f docker-compose.prod.yml up -d --build backend frontend

# Ver uso de recursos
docker stats

# Backup de la base de datos
docker exec orionix-postgres pg_dump -U postgres worldcup2026_db > backup_$(date +%Y%m%d).sql
```

---

## Si usas el dominio gratuito de Azure

Si no tienes dominio propio, Azure da uno así:
`orionixgol.eastus.cloudapp.azure.com`

Para configurarlo:
1. Portal Azure → VM → **Configuración IP** → **Etiqueta de nombre DNS**
2. Escribe `orionixgol` → el dominio queda como `orionixgol.eastus.cloudapp.azure.com`
3. Usa ese dominio en todas las variables `<CAMBIAR_tu-dominio>`

---

## Diferencias clave Dev vs Producción

| | Dev | Producción |
|---|---|---|
| `EMAIL_VERIFICATION_REQUIRED` | `false` | `true` |
| `SYNC_ENABLED` | `false` | `true` |
| SSL | No | Sí (Let's Encrypt) |
| pgAdmin | Expuesto en :5050 | No existe |
| Contraseñas BD | `postgres` | Seguras |
| URLs | `localhost` | Dominio real |
