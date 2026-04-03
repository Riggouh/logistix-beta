# 🚛 LogistiX – Deployment Guide

> Browser-basiertes Logistik-Strategiespiel als Single-HTML-File.
> Stand: März 2026 · v6 · ~235 KB kompiliert

---

## 📋 Inhaltsverzeichnis

1. [Architektur-Überblick](#architektur-überblick)
2. [Systemanforderungen](#systemanforderungen)
3. [Option A: Statisches Hosting](#option-a-statisches-hosting)
4. [Option B: Node.js + PostgreSQL](#option-b-nodejs--postgresql)
5. [Option C: Docker Compose](#option-c-docker-compose)
6. [Datenbank-Schema](#datenbank-schema)
7. [Backend-Anbindung](#backend-anbindung)
8. [HTTPS & Domain](#https--domain)
9. [Admin-Panel](#admin-panel)
10. [Monitoring & Backup](#monitoring--backup)
11. [Troubleshooting](#troubleshooting)

---

## Architektur-Überblick

```
┌─────────────────────────────────────────────────────┐
│  Browser (Client)                                    │
│  ┌───────────────────────────────────────────────┐  │
│  │  logistix.html (Single File, ~235 KB)         │  │
│  │  ├── Leaflet.js (CDN) → Kartendarstellung     │  │
│  │  ├── OSRM API → Straßenrouting                │  │
│  │  ├── Nominatim API → Stadtsuche               │  │
│  │  └── window.storage / fetch API → Speichern   │  │
│  └───────────────────────────────────────────────┘  │
│                        │                             │
│                        ▼                             │
│  ┌─────────────── Speicher-Optionen ──────────────┐ │
│  │  A) In-Memory (_memStore) ← Fallback           │ │
│  │  B) window.storage ← Claude.ai Umgebung        │ │
│  │  C) REST API → Node.js Server → PostgreSQL     │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Externe Dienste (kostenlos, kein API-Key nötig)

| Dienst | Zweck | Rate-Limit |
|--------|-------|------------|
| CartoDB Voyager | Kartentiles | Unbegrenzt (Fair Use) |
| OSRM | Straßenrouting | ~1 Req/s |
| Nominatim | Stadtsuche (Fallback) | 1 Req/s |

### Projekt-Struktur

```
logistix/
├── build.sh                    # Kompiliert → eine HTML-Datei
├── INSTALL.md                  # Diese Datei
└── src/
    ├── template_head.html      # CDN-Links (Leaflet, Fonts)
    ├── template_body.html      # HTML-Struktur
    ├── css/main.css            # Styling (~320 Zeilen)
    └── js/
        ├── data/cities.js      # 346 Städte weltweit
        ├── data/constants.js   # Fahrzeuge, Waren, Gebäude, Rezepte
        ├── game/state.js       # Auth, Speichern, Laden
        ├── game/quests.js      # Missionen
        ├── game/actions.js     # Spielaktionen
        ├── game/tick.js        # Game Loop (1 Hz)
        ├── game/cache.js       # Route-/Such-Cache
        ├── game/admin.js       # Admin-Panel
        ├── ui/map.js           # Leaflet-Karte
        ├── ui/search.js        # Hybrid-Suche
        ├── ui/render.js        # UI-Rendering (~950 Zeilen)
        └── init.js             # Startup
```

### Kompilieren

```bash
cd logistix/
bash build.sh > logistix.html
```

Keine Build-Tools, kein npm, kein Webpack nötig — reines Bash-Concatenate.

---

## Systemanforderungen

### Client (Browser)

| | Minimum | Empfohlen |
|---|---------|-----------|
| Browser | Chrome 90+, Firefox 90+ | Aktuellste Version |
| RAM | 256 MB frei | 512 MB frei |
| Bildschirm | 1024×768 | 1920×1080+ |
| Internet | Für Karten + Routing | Stabil, >1 Mbit/s |

### Server (nur Option B/C)

| | Minimum | Empfohlen | 100+ Spieler |
|---|---------|-----------|-------------|
| OS | Ubuntu 22.04+ | Ubuntu 24.04 LTS | Ubuntu 24.04 |
| RAM | 512 MB | 1 GB | 2 GB |
| CPU | 1 vCPU | 2 vCPUs | 4 vCPUs |
| Speicher | 100 MB | 1 GB | 5 GB |
| Node.js | 18.x | 22.x LTS | 22.x LTS |
| PostgreSQL | 14 | 16 | 16 |

### Empfohlene Hoster

| Hoster | Ab Preis/Monat | Empfehlung |
|--------|---------------|------------|
| Hetzner Cloud | 3,79€ (CX22) | Beste Preis-Leistung EU |
| Netcup | 2,99€ | Günstig, DE-Standort |
| DigitalOcean | $6 | Einfache Einrichtung |
| Vercel/Netlify | Kostenlos | Nur Option A |

---

## Option A: Statisches Hosting

Die kompilierte HTML funktioniert direkt im Browser. Spielstände im Browser-Speicher.

> ⚠️ Spielstände gehen bei In-Memory beim Schließen verloren. Für Persistenz → Option B/C.

### Nginx

```bash
sudo mkdir -p /var/www/logistix
sudo cp logistix.html /var/www/logistix/index.html
```

```nginx
server {
    listen 80;
    server_name logistix.deine-domain.de;
    root /var/www/logistix;
    index index.html;

    add_header X-Frame-Options "SAMEORIGIN" always;
    gzip on;
    gzip_types text/html application/javascript text/css;
}
```

### Apache

```apache
<VirtualHost *:80>
    ServerName logistix.deine-domain.de
    DocumentRoot /var/www/logistix
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html
    </IfModule>
</VirtualHost>
```

### Zero-Config Hoster

```bash
# Vercel
npx vercel --prod logistix.html

# GitHub Pages: index.html ins Repo → Pages aktivieren
```

---

## Option B: Node.js + PostgreSQL

Persistente Spielstände, Multi-User, Admin-Zugriff.

### 1. Server vorbereiten

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib
```

### 2. Datenbank einrichten

```bash
sudo -u postgres psql << 'SQL'
CREATE USER logistix WITH PASSWORD 'SICHERES_PASSWORT';
CREATE DATABASE logistix OWNER logistix;
SQL

sudo -u postgres psql -d logistix -f db/schema.sql
```

### 3. Projekt deployen

```bash
sudo mkdir -p /opt/logistix && cd /opt/logistix
npm ci --production
cp logistix.html public/index.html

cat > .env << ENV
PORT=3000
DATABASE_URL=postgresql://logistix:SICHERES_PASSWORT@localhost:5432/logistix
SESSION_SECRET=$(openssl rand -hex 32)
ADMIN_PASSWORD=admin-passwort
NODE_ENV=production
ENV
chmod 600 .env
```

### 4. PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 start server.js --name logistix
pm2 save && pm2 startup
```

### 5. Nginx Reverse Proxy

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

    gzip on;
    gzip_types text/html application/json application/javascript;
}
```

---

## Option C: Docker Compose

### docker-compose.yml

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    env_file: .env
    environment:
      - DATABASE_URL=postgresql://logistix:${DB_PASSWORD}@db:5432/logistix
    depends_on:
      db: { condition: service_healthy }

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    environment:
      POSTGRES_DB: logistix
      POSTGRES_USER: logistix
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U logistix"]
      interval: 10s

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/logistix.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on: [app]

volumes:
  pgdata:
```

### Dockerfile

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY server.js ./
COPY public/ ./public/
EXPOSE 3000
USER node
CMD ["node", "server.js"]
```

```bash
docker compose up -d          # Starten
docker compose logs -f app    # Logs
docker compose exec db pg_dump -U logistix logistix > backup.sql  # Backup
```

---

## Datenbank-Schema

```sql
-- db/schema.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    security_question TEXT,
    security_answer VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE saves (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    save_data JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cache (
    key VARCHAR(500) PRIMARY KEY,
    value JSONB NOT NULL,
    expires_at TIMESTAMP
);

CREATE TABLE admin_log (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT NOW(),
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(20) NOT NULL,
    message TEXT,
    data JSONB
);

CREATE INDEX idx_saves_user ON saves(user_id);
CREATE INDEX idx_cache_expires ON cache(expires_at);
CREATE INDEX idx_log_timestamp ON admin_log(timestamp DESC);
```

---

## Backend-Anbindung

In `src/js/game/state.js` die Speicher-Funktionen ersetzen:

### REST API (für Option B/C)

```javascript
async function storeGet(key) {
    try {
        const r = await fetch('/api/save/' + encodeURIComponent(key));
        if (!r.ok) throw new Error(r.status);
        const d = await r.json();
        return d ? JSON.stringify(d) : null;
    } catch(e) { return _memStore[key] || null; }
}

async function storeSet(key, value) {
    _memStore[key] = value;
    try {
        await fetch('/api/save/' + encodeURIComponent(key), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: value
        });
    } catch(e) {}
}
```

### localStorage (für Option A mit Persistenz)

```javascript
async function storeGet(key) {
    try { return localStorage.getItem(key); }
    catch(e) { return _memStore[key] || null; }
}

async function storeSet(key, value) {
    _memStore[key] = value;
    try { localStorage.setItem(key, value); } catch(e) {}
}
```

Danach: `bash build.sh > public/index.html`

---

## HTTPS & Domain

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d logistix.deine-domain.de
sudo certbot renew --dry-run  # Test
```

DNS: `A`-Record auf Server-IP zeigen.

---

## Admin-Panel

Im Spiel: **Ctrl+Shift+A** → Passwort eingeben (Standard: `logistix2026`)

| Tab | Funktion |
|-----|----------|
| 📋 Log | Aktivitätslog, JSON-Export |
| 👥 Spieler | Accounts verwalten |
| 📊 Stats | Cache, Spieleranzahl |
| 🔧 Tools | Geld/Ticks/Cache/Lager |

---

## Monitoring & Backup

### Automatisches Backup (Cron)

```bash
# Täglich 3:00 Uhr
echo '0 3 * * * root pg_dump -U logistix logistix | gzip > /var/backups/logistix/$(date +\%Y\%m\%d).sql.gz' | sudo tee /etc/cron.d/logistix-backup
sudo mkdir -p /var/backups/logistix
```

### Wiederherstellen

```bash
gunzip < backup.sql.gz | psql -U logistix logistix
```

---

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| Karte lädt nicht | Ports 80/443 offen? CDN erreichbar? |
| Spielstand weg | Server-Backend verwenden (Option B/C) |
| 502 Bad Gateway | `pm2 restart logistix` |
| DB-Verbindung | `sudo systemctl start postgresql` |
| Port belegt | `lsof -i :3000` → Port ändern |

```bash
pm2 logs logistix              # App-Logs
sudo tail -f /var/log/nginx/error.log  # Nginx
```

---

## Quick-Start Checkliste

```
□ Server aufsetzen (Ubuntu 24.04)
□ Node.js 22 + PostgreSQL 16
□ Datenbank + Schema
□ bash build.sh > public/index.html
□ .env konfigurieren
□ PM2 starten + Auto-Start
□ Nginx Reverse Proxy
□ Domain + DNS
□ Let's Encrypt HTTPS
□ Backup-Cron
□ Spielen! 🎮
```

---

*LogistiX v6 · März 2026*
