#!/bin/bash
cd "$(dirname "$0")"
docker compose down
echo ""
echo "  🛑  LogistiX gestoppt."
echo "      Spielstände bleiben erhalten."
echo ""
