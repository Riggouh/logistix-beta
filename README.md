# 🚛 LogistiX

Browser-basiertes Logistik-Strategiespiel.

## Quickstart

```bash
git clone https://github.com/Riggouh/logistix-beta.git
cd logistix-beta
chmod +x start.sh stop.sh
./start.sh
```

→ Spiel öffnen: **http://localhost:3000**

## Voraussetzungen

```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin -y
sudo systemctl enable docker && sudo systemctl start docker
```

## Befehle

| Aktion | Befehl |
|--------|--------|
| Starten | `./start.sh` |
| Stoppen | `./stop.sh` |
| Logs | `docker compose logs -f` |
| Update | `git pull && docker-compose up -d --build` |
| Backup | `docker compose cp logistix:/app/data ./backup` |
