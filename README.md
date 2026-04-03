# 🚛 LogistiX

Browser-basiertes Logistik-Strategiespiel. Baue Produktionen auf, manage Fahrzeugflotten, erfülle Aufträge und steige im Leaderboard auf.

## Quickstart

```bash
git clone https://github.com/Riggouh/logistix-beta.git
cd logistix-beta
chmod +x start.sh stop.sh
./start.sh
```

→ Spiel öffnen: **http://localhost:3000**

## Voraussetzungen

- Linux-Server (Ubuntu/Debian empfohlen)
- Docker + Docker Compose

```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin -y
sudo systemctl enable docker && sudo systemctl start docker
```

## Über eine Domain erreichbar machen

Reverse Proxy (z.B. in CloudPanel oder Nginx) auf Port **3000** zeigen:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Befehle

| Aktion | Befehl |
|--------|--------|
| Starten | `./start.sh` |
| Stoppen | `./stop.sh` |
| Logs | `docker compose logs -f` |
| Update | `git pull && docker compose up -d --build` |
| Backup | `docker compose cp logistix:/app/data ./backup` |

## Features

- 🌍 346 Städte weltweit
- 🏭 Produktionsgebäude & Rezepte
- 🚛 Fahrzeugflotten-Management
- 📦 Aufträge & Daueraufträge
- 🤝 Allianzsystem mit Gebieten
- 🏆 Leaderboard
- 💾 Serverseitige Spielstände (von jedem Gerät spielbar)
