# 🚛 LogistiX – Deployment Guide

> Stand: April 2026 · ~935 KB kompiliert

---

## Voraussetzungen

- Docker & Docker Compose
- Git
- Reverse Proxy (Nginx / CloudPanel / Traefik) für HTTPS

---

## 1. Installation

```bash
git clone https://github.com/Riggouh/logistix-beta.git
cd logistix-beta
./start.sh
```

Der Container startet auf **Port 3914**.

---

## 2. Reverse Proxy (Nginx / CloudPanel)

LogistiX läuft als Docker-Container auf Port 3914. Der Reverse Proxy muss **alle Requests** (inkl. `/api/`) weiterleiten.

### Nginx

```nginx
server {
    listen 80;
    server_name logistix.deine-domain.de;

    location / {
        proxy_pass http://127.0.0.1:3914;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### CloudPanel

In **Sites → Vhost → Nginx-Konfiguration** den `location /`-Block auf `proxy_pass http://127.0.0.1:3914;` setzen.

> ⚠️ Wichtig: `/api/` muss an den Container durchgeleitet werden, sonst funktioniert Login nicht!

---

## 3. HTTPS (Let's Encrypt)

```bash
sudo certbot --nginx -d logistix.deine-domain.de
```

---

## 4. Architektur

```
Browser ──→ Nginx (HTTPS) ──→ Docker (Port 3914)
                                  ├── server.js (Node.js)
                                  │   ├── GET/POST /api/storage
                                  │   └── Static: public/index.html
                                  └── /data/ (Volume)
                                      ├── personal.json (Spielstände)
                                      └── shared.json (Leaderboard, Users)
```

### Storage API

| Methode | Endpoint | Beschreibung |
|---------|----------|-------------|
| GET | `/api/storage?key=X&shared=false` | Wert lesen |
| POST | `/api/storage` | Wert schreiben |
| DELETE | `/api/storage?key=X&shared=false` | Wert löschen |
| GET | `/api/storage/list?prefix=X&shared=false` | Keys auflisten |

---

## 5. Updates

```bash
cd logistix-beta
git pull
docker-compose build --no-cache && docker-compose up -d
```

Spielstände bleiben erhalten (Docker Volume `logistix-data`).

---

## 6. Backup & Restore

### Backup

```bash
docker cp $(docker-compose ps -q logistix):/data/ ./backup/
```

### Restore

```bash
docker cp ./backup/. $(docker-compose ps -q logistix):/data/
```

---

## 7. Befehle

| Befehl | Aktion |
|--------|--------|
| `./start.sh` | Starten (mit Build) |
| `./stop.sh` | Stoppen |
| `docker-compose logs -f` | Logs |
| `docker-compose exec logistix cat /app/server.js` | Server.js prüfen |
| `docker-compose exec logistix ls /data/` | Daten prüfen |
| `curl http://127.0.0.1:3914/api/storage?key=test&shared=false` | API testen |

---

## 8. Troubleshooting

| Problem | Ursache | Lösung |
|---------|---------|--------|
| Login: 404 auf `/api/storage` | Nginx leitet `/api/` nicht weiter | Proxy-Config prüfen, `proxy_pass` muss alle Pfade abdecken |
| Login: 404 auf `/api/storage` | Alte `server.js` im Container | `docker-compose build --no-cache && docker-compose up -d` |
| Spielstand weg | Volume gelöscht | Backup einspielen |
| Container startet nicht | Port belegt | `lsof -i :3914` prüfen |
| Karte lädt nicht | CDN nicht erreichbar | Internetverbindung prüfen |

---

*LogistiX · April 2026*
