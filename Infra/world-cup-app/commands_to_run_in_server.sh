#!/bin/bash

cd /opt/app || exit
git clone https://github.com/DevMGcode/WC.git .

sam list stack-outputs

BUILDX_VERSION=$(curl -s https://api.github.com/repos/docker/buildx/releases/latest | grep '"tag_name"' | cut -d'"' -f4)

sudo curl -Lo /usr/local/lib/docker/cli-plugins/docker-buildx \
  "https://github.com/docker/buildx/releases/download/${BUILDX_VERSION}/buildx-${BUILDX_VERSION}.linux-amd64"

sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx

DOMINIO=ec2-34-198-230-124.compute-1.amazonaws.com

sed -i "s/server_name ;/server_name $DOMINIO;/g" nginx.conf nginx-bootstrap.conf
sed -i "s|/etc/letsencrypt/live//|/etc/letsencrypt/live/$DOMINIO/|g" nginx.conf

docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d ec2-34-198-230-124.compute-1.amazonaws.com -d www.ec2-34-198-230-124.compute-1.amazonaws.com \
  --email alvaroeduardo831@gmail.com --agree-tos --no-eff-email
