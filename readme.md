# 💊 Pharmacy SaaS Platform

A full-stack Pharmacy Management SaaS application with Dockerized architecture.

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

3. Run the docker commands to start the bakcend server and frontend.

```bash
docker compose build
```

```bash
docker compose up -d
```

To stop the running containers, run

```bash
docker compose down
```

Now after this your project will be ready to run.

The endpoints.

#### Get item

| Service    | Url                     |
| :--------- | :---------------------- |
| `Frontend` | (http://localhost:5173) |
| `Backennd` | (http://localhost:5000) |
| `Adminer ` | (http://localhost:8080) |
