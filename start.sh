#!/bin/bash
echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║     🚛  LogistiX wird gestartet...   ║"
echo "  ╚══════════════════════════════════════╝"
echo ""
if ! docker info > /dev/null 2>&1; then
    echo "  ❌  Docker läuft nicht!"
    echo "     → sudo systemctl start docker"
    exit 1
fi
cd "$(dirname "$0")"
docker compose up -d --build 2>/dev/null || docker-compose up -d --build
echo ""
echo "  ✅  LogistiX läuft auf Port 3000!"
echo "  Lokal:    http://localhost:3000"
echo "  Netzwerk: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
