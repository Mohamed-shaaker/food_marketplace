#!/bin/sh
# start.sh — Docker entrypoint for Render deployment
# Render injects $PORT at runtime. This script expands it correctly
# before exec-ing uvicorn so the process gets PID 1 (no shell wrapper).
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --proxy-headers \
  --forwarded-allow-ips="*"
