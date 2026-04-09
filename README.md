# 🚛 LogistiX

**Browser-basiertes Logistik-Strategiespiel** — Baue dein globales Logistik-Imperium!

> Single-HTML-File · ~935 KB kompiliert · Docker-Ready

---

## 🎮 Features

- 🌍 **500+ Städte** weltweit mit realen Koordinaten
- 🚚 **30+ Fahrzeugtypen** (LKW, Züge, Schiffe, Flugzeuge)
- 📦 **60+ Warenarten** inkl. Verarbeitung & Rezepte
- 🏭 **Gebäude & Fabriken** bauen und upgraden
- 🤝 **Allianzen** mit anderen Spielern gründen
- 📊 **Leaderboard** — wer hat das größte Imperium?
- 🗺️ **Live-Karte** mit Leaflet (OpenStreetMap)
- 📱 **Mobile-optimiert** (PWA-fähig)
- 🔒 **Multi-User** mit gehashten Passwörtern
- 🛡️ **Admin-Panel** (Ctrl+Shift+A)

---

## 🚀 Quick Start (Docker)

```bash
git clone https://github.com/Riggouh/logistix-beta.git
cd logistix-beta
./start.sh
```

Spiel öffnen: `http://localhost:3914`

### Befehle

| Befehl | Aktion |
|--------|--------|
| `./start.sh` | Container starten |
| `./stop.sh` | Container stoppen |
| `docker-compose logs -f` | Logs anzeigen |

---

## 📁 Projektstruktur

```
logistix-beta/
├── public/
│   └── index.html          # Kompiliertes Spiel
├── server.js               # Node.js Backend (Storage API)
├── Dockerfile              # Container-Image
├── docker-compose.yml      # Docker Setup
├── start.sh / stop.sh      # Start/Stop Scripts
├── LICENSE                 # All Rights Reserved
├── README.md               # Diese Datei
├── INSTALL.md              # Deployment-Anleitung
└── ANLEITUNG.md            # Spielanleitung
```

---

## ⚙️ Technologie

| Komponente | Technologie |
|------------|-------------|
| Frontend | Vanilla JS, CSS, Single HTML |
| Karte | Leaflet.js (CDN) |
| Routing | OSRM API |
| Backend | Node.js (HTTP) |
| Storage | JSON-Dateien (personal.json / shared.json) |
| Container | Docker + Docker Compose |
| Persistenz | Docker Named Volume (`logistix-data`) |

---

## 📄 Lizenz

All Rights Reserved © 2024–2026 Rico. Siehe [LICENSE](LICENSE).
