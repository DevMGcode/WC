# Despliegue en AWS — Orionix Gol

> 📝 **Nota:** La infraestructura migró de Azure a **AWS EC2**. El stack
> Docker es agnóstico, así que los pasos a partir de "Conectarse e instalar
> Docker" son idénticos. Solo cambia el proveedor donde aprovisionas la VM.

## Requisitos previos
- Cuenta de AWS activa (con tarjeta para el free tier)
- Par de llaves SSH (.pem)
- Dominio propio o usar el DNS público de EC2 (`ec2-XX-XX-XX-XX.compute.amazonaws.com`)
- Git instalado en tu máquina local

---

## PASO 1 — Crear la VM en AWS (EC2)

1. AWS Console → **EC2 → Launch Instance**.
2. Configuración recomendada:
   - **AMI:** Ubuntu Server 22.04 LTS (free tier elegible)
   - **Instance type:** `t3.small` (2 vCPU, 2 GB RAM) — ~$15/mes
     o `t3.medium` (2 vCPU, 4 GB RAM) — ~$30/mes (recomendado para Spring Boot)
   - **Key pair:** crea o reutiliza una `.pem`
   - **Security group (firewall):** permite puertos
     - 22 (SSH) — restringe a tu IP
     - 80 (HTTP) — abierto al mundo
     - 443 (HTTPS) — abierto al mundo
   - **Storage:** 20 GB gp3 mínimo

3. Una vez creada, anota la **IP pública** o el **DNS público** de la instancia.

---

## PASO 2 — Conectarse a la VM e instalar Docker

```bash
# Conectarse por SSH (cambia la ruta de la .pem y la IP)
chmod 400 ~/.ssh/tu-llave.pem
ssh -i ~/.ssh/tu-llave.pem ubuntu@<IP_PUBLICA_VM>

# Instalar Docker
curl -fsSL https://get.docker.com | sh

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

## PASO 5 — Configurar el dominio en los archivos nginx

Hay DOS archivos nginx en este repo:
- `nginx-bootstrap.conf` → solo HTTP, sin SSL. Se usa para emitir el cert.
- `nginx.conf` → HTTP→HTTPS redirect + bloque SSL. Se usa después.

Reemplaza el dominio en AMBOS:

```bash
DOMINIO=orionixgol.com   # cambia esto por tu dominio real
sed -i "s/TU_DOMINIO/$DOMINIO/g" nginx-bootstrap.conf
sed -i "s/TU_DOMINIO/$DOMINIO/g" nginx.conf
```

---

## PASO 6 — Obtener certificado SSL (HTTPS gratuito)

⚠️ El nginx.conf final tiene un bloque `listen 443 ssl` que apunta a un cert
que aún NO existe. Si arrancas nginx con ese config sin tener el cert, falla
con "cannot load certificate". Por eso usamos primero el bootstrap.

### Fase 1: Bootstrap (solo HTTP)

```bash
# 1. Apuntar el mount de nginx al config bootstrap (sin SSL).
#    Edita docker-compose.prod.yml línea ~101, cambia:
#       - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
#    por:
#       - ./nginx-bootstrap.conf:/etc/nginx/conf.d/default.conf:ro
#
#    Alternativa con sed (más rápido):
sed -i 's|./nginx.conf:/etc/nginx/conf.d/default.conf|./nginx-bootstrap.conf:/etc/nginx/conf.d/default.conf|g' docker-compose.prod.yml

# 2. Arrancar SOLO nginx en modo HTTP (no necesita backend/frontend todavía)
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d nginx

# 3. Probar que el HTTP responde (debe devolver "Orionix Gol — esperando...")
curl http://$DOMINIO/

# 4. Obtener el certificado
docker compose -f docker-compose.prod.yml --env-file .env.prod run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d $DOMINIO -d www.$DOMINIO \
  --email meligarcia3412@gmail.com \
  --agree-tos --no-eff-email
```

Si todo va bien, certbot te dirá `Successfully received certificate.` y el cert
queda guardado en el volumen `certbot_certs` del compose.

### Fase 2: Switch a HTTPS

```bash
# 1. Volver al config con HTTPS
sed -i 's|./nginx-bootstrap.conf:/etc/nginx/conf.d/default.conf|./nginx.conf:/etc/nginx/conf.d/default.conf|g' docker-compose.prod.yml

# 2. Recargar nginx con el nuevo config (ya tiene el cert disponible)
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --force-recreate nginx

# 3. Probar HTTPS
curl https://$DOMINIO/ -I
# → debería devolver HTTP/2 200 (o 307 redirect a /es)
```

---

## PASO 7 — Arrancar todo

⚠️ El flag `--env-file .env.prod` es OBLIGATORIO en TODOS los comandos. Sin él, las
variables `${...}` del compose quedan vacías (compose por defecto solo lee `.env`,
no `.env.prod`). Alternativa: renombrar `.env.prod` a `.env`, pero perderías el
patrón de naming explícito por entorno.

```bash
cd ~/app/PRODUCCION_DEPLOY

# Build y arranque completo
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Ver logs
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f

# Ver estado de los contenedores
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
```

💡 Tip: para no repetir el flag, exporta un alias en tu sesión:
```bash
alias dcp='docker compose -f docker-compose.prod.yml --env-file .env.prod'
# Luego usa:
dcp up -d --build
dcp logs -f
dcp ps
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
docker compose -f docker-compose.prod.yml --env-file .env.prod restart backend

# Actualizar a nueva versión del código
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build backend frontend

# Ver uso de recursos
docker stats

# Backup de la base de datos
docker exec orionix-postgres pg_dump -U postgres worldcup2026_db > backup_$(date +%Y%m%d).sql
```

---

## Si usas el dominio gratuito de AWS (EC2 Public DNS)

Si no tienes dominio propio, AWS da uno así:
`ec2-XX-XX-XX-XX.compute-1.amazonaws.com`

- Aparece en la consola EC2 → Instance → **Public IPv4 DNS**.
- Sirve para pruebas, pero **NO recomendado para producción** porque cambia
  si reinicias la instancia (asigna **Elastic IP** para que sea estable).
- Para SSL con Let's Encrypt necesitas un dominio propio (Let's Encrypt
  rechaza los dominios `*.amazonaws.com`).

**Recomendación:** compra un dominio (Namecheap, Cloudflare, Route 53 — ~$10/año)
y apuntalo a la Elastic IP de tu EC2.

---

## 💳 Configurar Mercado Pago en producción (post-deploy)

Una vez la VM está corriendo y el dominio responde por HTTPS:

### 1. Verifica que las variables están en `.env.prod`
```
MERCADO_PAGO_MODE=real
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
MERCADO_PAGO_PUBLIC_KEY=APP_USR-...
MERCADO_PAGO_NOTIFICATION_URL=https://tu-dominio.com/api/v1/public/payments/mercadopago/webhook
```

### 2. Configura el webhook en el panel de Mercado Pago
1. Ve a https://www.mercadopago.com.co/developers/panel
2. Entra a tu aplicación → menú **"Webhooks"**.
3. Click **"Configurar notificaciones"** o **"Crear webhook"**.
4. **URL del webhook:**
   ```
   https://tu-dominio.com/api/v1/public/payments/mercadopago/webhook
   ```
5. **Eventos a notificar:** marca solo **`Payments`** (los demás no aplican).
6. Mercado Pago te da un **Secret** — cópialo.
7. Pégalo en `.env.prod`:
   ```
   MERCADO_PAGO_WEBHOOK_SECRET=tu-secret-de-mp
   ```
8. Redeploy del backend:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build backend
   ```

### 3. Prueba el flujo end-to-end
1. Entra a `https://tu-dominio.com/checkout` desde un navegador normal.
2. Paga con tu propia tarjeta real ($20.000 COP).
3. Verifica que:
   - Volviste a `/checkout/result?status=success`.
   - Tu usuario aparece como `isPremium: true` (consulta `GET /api/v1/users/{id}`).
   - En la BD: `SELECT * FROM subscription WHERE user_id = X` muestra `status='ACTIVE'`.
   - En el panel MP ves el pago.
4. **Si recibiste el pago pero el Premium NO se activó** → revisa los logs:
   ```bash
   docker logs orionix-backend --tail 100 | grep -i mercadopago
   ```
   El error más común es webhook que no llega (firewall) o firma inválida (secret mal pegado).

### 4. Retirar la plata a Nequi/banco
- Entra a https://www.mercadopago.com.co
- **"Retirar dinero"** → elige Nequi o tu banco asociado
- Llega en minutos (Nequi) o 1-3 días (banco)

---

## PWA (Progressive Web App) en producción

La PWA está lista en el código. En producción funciona automáticamente una vez que el sitio tiene HTTPS.

### Qué está implementado

| Archivo | Ubicación | Función |
|---|---|---|
| `manifest.json` | `Frontend/public/manifest.json` | Define nombre, íconos, colores, display standalone |
| `sw.js` | `Frontend/public/sw.js` | Service Worker — requerido para instalación |
| `ServiceWorkerRegistration.tsx` | `Frontend/src/components/` | Registra el SW en el cliente |
| Íconos | `Frontend/public/icons/` | 180×180, 192×192, 512×512 |

### Comportamiento por plataforma

| Plataforma | Instalación | Notas |
|---|---|---|
| Android (Chrome/Edge) | Banner automático "Agregar a pantalla de inicio" | Aparece después de visitar el sitio 2+ veces |
| iOS (Safari) | Manual: Compartir → "Agregar a pantalla de inicio" | Safari no muestra banner automático |
| Desktop (Chrome/Edge) | Ícono en barra de direcciones o `...` → Aplicaciones | Funciona igual en producción |

### No se requiere ningún paso extra en el deploy

El `manifest.json` y `sw.js` están en `public/` y se sirven estáticos por Next.js standalone. Nginx ya está configurado para servir archivos estáticos del frontend. Con HTTPS activo (Paso 6), el Service Worker se registra automáticamente.

### Si el ícono de instalación no aparece en producción

```bash
# Verificar que el manifest se sirve correctamente
curl https://tu-dominio.com/manifest.json

# Verificar que el SW se sirve
curl https://tu-dominio.com/sw.js

# En DevTools del navegador → Application → Manifest
# → debe mostrar: nombre, íconos y "display: standalone"
```

### Actualización de íconos o manifest en producción

```bash
# Después de cambiar iconos/manifest, solo rebuildear el frontend
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build frontend
```

### Probar en celular antes del deploy (ngrok)

```bash
# En tu máquina local con Docker corriendo en dev:
ngrok http 3000

# Abrí la URL https://xxxx.ngrok-free.app en el celular
# Chrome/Edge mostrará el banner de instalación automáticamente
```

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
