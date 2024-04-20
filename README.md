# Polizei Zeitung

![Showcase Image](https://i.ibb.co/gb20Xk0/Screenshot-2024-04-20-073408.png)

Your platform for anonymous tips on criminals, missing persons and the latest police reports in Germany. This project utilizes scraping technology to scrape the latest missing and wanted persons from german police websites. Tech stack: Node.js, Next.js, MongoDB & Docker.

## Getting Started
### Prerequisites

- Node.js (version 12 or higher)
- Docker
- MongoDB Database

### Installation
1. Clone the repo

```sh

git clone https://github.com/0xBitBuster/polizei-zeitung.git

```

2. Enter your API Keys and Server Configuration in `docker-compose.dev.yaml` (development), `docker-compose.yaml` (production) and `next.config.js`


### Usage
To start the server in development mode, run:
```bash
docker-compose -f docker-compose.dev.yaml up --build
```
To run the server in production mode, run:
```bash
docker-compose up --build
```

* In development, the server runs on following ports: `3000` (frontend) and `4000` (backend)

* In production, the server runs on following ports: `80` (http), `81` (nginx proxy manager), `443` (https)

* In production, after you started the server, you need to configure the nginx proxy whilst redirect all frontend ("/") traffic to `http(s)://frontend:3000` and all backend ("/api/*") traffic to `http(s)://backend:4000`. 

Default Nginx Proxy Manager credentials are "admin@example.com" (Email) and "changeme" (Password)
Default Admin Website is located at "/admin" and the default password is "changeme"
