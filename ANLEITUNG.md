# 🚛 LogistiX – Server-Installation

## Was ist drin?

```
logistix/
├── start.sh             ← Spiel starten (1 Klick)
├── stop.sh              ← Spiel stoppen
├── docker-compose.yml   ← Container-Konfiguration
├── Dockerfile           ← Container-Bauplan
├── server.js            ← Backend
└── public/
    └── index.html       ← Das Spiel
```

---

## Installation (5 Minuten)

### 1. Docker installieren (falls noch nicht vorhanden)

```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin -y
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. Diesen Ordner auf den Server kopieren

Per SFTP (z.B. FileZilla) oder per SCP:
```bash
scp -r logistix/ benutzer@dein-server:~/
```

### 3. Starten

```bash
cd ~/logistix
chmod +x start.sh stop.sh
./start.sh
```

**Das war's!** Das Spiel läuft auf Port **3000**.

Teste es: `http://DEINE-SERVER-IP:3000`

---

## Über Domain erreichbar machen (Reverse Proxy)

Damit das Spiel unter `logistix.deine-domain.de` erreichbar ist:

### Option A: CloudPanel

1. **Neue Seite erstellen** → „Reverse Proxy" (falls verfügbar)
   - Domain: `logistix.deine-domain.de`
   - Ziel: `http://127.0.0.1:3000`

2. Falls kein Reverse-Proxy-Typ:
   „Statische Seite" erstellen, dann unter **Vhost** diese Nginx-Konfiguration einfügen:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
}
```

3. **SSL/TLS** → Let's Encrypt aktivieren

### Option B: Nginx direkt (ohne CloudPanel)

```bash
sudo nano /etc/nginx/sites-available/logistix
```

Einfügen:
```nginx
server {
    listen 80;
    server_name logistix.deine-domain.de;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktivieren:
```bash
sudo ln -s /etc/nginx/sites-available/logistix /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

HTTPS:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d logistix.deine-domain.de
```

### DNS einstellen

Beim Domain-Anbieter einen **A-Record** erstellen:
- **Name:** `logistix`
- **Wert:** Die IP deines Servers

---

## Befehle

| Was | Befehl |
|-----|--------|
| Starten | `./start.sh` |
| Stoppen | `./stop.sh` |
| Logs ansehen | `docker compose logs -f` |
| Neustarten | `docker compose restart` |
| Update (neue index.html) | Datei ersetzen → `docker compose up -d --build` |
| Backup der Spielstände | `docker compose cp logistix:/app/data ./backup` |

---

## Häufige Fragen

**Wo sind die Spielstände?**
Alle Daten liegen auf dem Server in einem Docker-Volume. Spieler können sich von jedem Gerät einloggen und weiterspielen.

**Kann ich das Spiel updaten?**
Neue `index.html` in den `public/` Ordner legen, dann `docker compose up -d --build`.

**Können mehrere Leute gleichzeitig spielen?**
Ja! Jeder registriert sich mit eigenem Account. Allianzen, Leaderboard – alles funktioniert.

**Port 3000 ist belegt?**
In `docker-compose.yml` ändern: `"3000:3000"` → z.B. `"3001:3000"`. Dann den Reverse Proxy auf den neuen Port zeigen.

**Spielstände sichern?**
```bash
docker compose cp logistix:/app/data ./backup
```

**Spielstände wiederherstellen?**
```bash
docker compose cp ./backup/. logistix:/app/data
docker compose restart
```
