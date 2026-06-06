# world-cup-app — Infraestructura AWS

Infraestructura como código (IaC) para la aplicación World Cup, desplegada en AWS mediante AWS SAM / CloudFormation. Provisiona una instancia EC2 que corre el frontend, backend y base de datos a través de Docker Compose.

## Arquitectura

```
Internet
   │
   ▼
Internet Gateway
   │
   ▼
VPC (10.0.0.0/16)
   └── Public Subnet (10.0.1.0/24 · us-east-1a)
           │
           ▼
       Security Group
       ├── TCP 22   → SSH (configurable por CIDR)
       ├── TCP 80   → HTTP  (0.0.0.0/0)
       └── TCP 443  → HTTPS (0.0.0.0/0)
           │
           ▼
       EC2 t2.medium (Amazon Linux 2023)
       ├── Elastic IP (IP fija)
       ├── EBS gp3 30 GB (cifrado)
       ├── IAM Role → SSM + CloudWatch
       └── /opt/app  ← directorio de la aplicación
```

### Recursos creados por la plantilla

| Recurso | Tipo | Notas |
|---|---|---|
| `wc-vpc-{env}` | VPC | CIDR `10.0.0.0/16`, DNS habilitado |
| `wc-igw-{env}` | Internet Gateway | Adjunto a la VPC |
| `wc-subnet-public-{env}` | Subnet pública | `10.0.1.0/24`, `us-east-1a` |
| `wc-rt-public-{env}` | Route Table | Ruta `0.0.0.0/0` → IGW |
| `wc-sg-{env}` | Security Group | Puertos 22, 80, 443 |
| `wc-ec2-role-{env}` | IAM Role | Políticas SSM + CloudWatch |
| `wc-eip-{env}` | Elastic IP | IP estática para la instancia |
| `wc-server-{env}` | EC2 Instance | Amazon Linux 2023, `t2.medium` |

### Bootstrap automático (UserData)

Al lanzar, la instancia instala automáticamente:

- Docker (habilitado como servicio)
- Docker Compose v2
- AWS CLI v2
- Utilidades: `git`, `htop`, `curl`, `unzip`, `jq`
- Directorio `/opt/app` (propiedad de `ec2-user`)

## Requisitos previos

- [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) configurado (`aws configure`)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- Key pair EC2 creada en la cuenta y región objetivo

## Parámetros de la plantilla

| Parámetro | Valor por defecto | Descripción |
|---|---|---|
| `EnvironmentName` | `prod` | Entorno: `dev`, `staging` o `prod` |
| `InstanceType` | `t2.medium` | Tipo de instancia EC2 |
| `KeyPairName` | *(requerido)* | Nombre del Key Pair en AWS EC2 |
| `AllowedSSHCidr` | `0.0.0.0/0` | CIDR autorizado para SSH (restringir en prod) |
| `VolumeSize` | `30` | Tamaño del volumen raíz en GB |

## Despliegue

### Primera vez

```bash
sam build
sam deploy --guided
```

El flag `--guided` solicita de forma interactiva la región, stack name y parámetros, y guarda la configuración en `samconfig.toml`.

### Despliegues siguientes

```bash
sam build
sam deploy
```

`samconfig.toml` ya tiene los valores guardados (stack `world-cup-app`, key pair `wc-keypair-prod`).

### Sólo validar la plantilla

```bash
sam validate --lint
```

## Outputs del stack

Tras el despliegue, CloudFormation expone los siguientes valores:

| Output | Descripción |
|---|---|
| `PublicIP` | Elastic IP de la instancia (también exportada como `wc-{env}-public-ip`) |
| `PublicDNS` | DNS público de la instancia |
| `InstanceId` | ID de la instancia EC2 |
| `SSHCommand` | Comando SSH listo para usar |
| `VpcId` | ID de la VPC |

```bash
aws cloudformation describe-stacks \
  --stack-name world-cup-app \
  --query "Stacks[0].Outputs"
```

## Conectarse a la instancia

```bash
# Con el output SSHCommand del stack:
ssh -i wc-keypair-prod.pem ec2-user@<PublicIP>

# O via SSM (sin necesidad de abrir el puerto 22):
aws ssm start-session --target <InstanceId>
```

## Destruir la infraestructura

```bash
sam delete --stack-name world-cup-app
```

> **Nota:** la Elastic IP se libera al eliminar el stack, pero el Key Pair debe borrarse manualmente desde la consola de EC2 si ya no se necesita.

## Estructura del repositorio

```
world-cup-app/
├── template.yaml      # Plantilla CloudFormation/SAM (fuente de verdad)
├── samconfig.toml     # Configuración de SAM CLI (parámetros por defecto)
└── README.md          # Este archivo
```
