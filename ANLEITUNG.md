# 🚛 LogistiX – Server-Installation

## Installation (5 Minuten)

### 1. Docker installieren
```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin -y
sudo systemctl enable docker && sudo systemctl start docker
```

### 2. Repo klonen
```bash
git clone https://github.com/Riggouh/logistix-beta.git
cd logistix-beta
chmod +x start.sh stop.sh
```

### 3. Starten
```bash
./start.sh
```
Spiel läuft auf Port **3000** → `http://DEINE-SERVER-IP:3000`

## Reverse Proxy (CloudPanel)

Neue Seite erstellen, dann unter **Vhost** einfügen:
```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
}
```
Dann SSL/TLS → Let's Encrypt aktivieren.

## Update
```bash
git pull && docker-compose up -d --build
```

## Backup
```bash
docker compose cp logistix:/app/data ./backup
```
