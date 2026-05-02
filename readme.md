# 💊 Pharmacy SaaS Platform

A full-stack Pharmacy Management SaaS application with Dockerized architecture.

## 📚 Documentation

- [Auth Flow](./docs/auth-flow.md)
- [Sidebar Navigation](./docs/sidebar-navigation.md)
- [Permissions Guide](./docs/permissions-guide.md)

## 🧰 Tech Stack

- **Backend:** Node.js + Express + TypeScript + Prisma
- **Database:** PostgreSQL
- **Cache:** Redis
- **Frontend:** Vite + React
- **DevOps:** Docker & Docker Compose

## 🚀 Getting Started

### Prerequisites

- Docker
- Docker Compose

### Setup

1. Clone the repository:

```bash
git clone https://github.com/appdevelopment-sws/dawadukaan.git
cd dawadukaan
```

2. Add .env to the project (check .env.sample for reference).

```bash
cd backend
cp .env.sample .env
```

```bash
cd ..
```


3. Run the docker commands to start the bakcend server and frontend.

```bash
docker compose build
```

```bash
docker compose up -d
```

To seed the database run:

```bash
docker exec -it dawadukaan-backend-1 npx prisma migrate dev

docker exec -it dawadukaan-backend-1 npx prisma db seed
```

Now after this your project will be ready to run.

The endpoints.

#### Get item

| Service    | Url                     |
| :--------- | :---------------------- |
| `Frontend` | (http://localhost:5173) |
| `Backennd` | (http://localhost:5000) |
| `Adminer ` | (http://localhost:8080) |

To stop the running containers, run

```bash
docker compose down
```
migrate the database

```bash
docker compose exec backend npx prisma migrate deploy  
```