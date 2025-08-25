#!/bin/bash

set -e
echo "[Entrypoint] DOMAIN_NAME is: $DOMAIN_NAME"
echo "[Entrypoint] Substituting Nginx config..."
envsubst '${DOMAIN_NAME}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

if [ ! -s /etc/nginx/conf.d/default.conf ]; then
	echo "[Entrypoint] ERROR: Nginx config substitution failed. File is empty."
	cat /etc/nginx/conf.d/default.conf.template
	exit 1
fi

echo "[Entrypoint] Nginx config after substitution:"
cat /etc/nginx/conf.d/default.conf

echo "[Entrypoint] Starting Uvicorn..."
uvicorn main:app --host 0.0.0.0 --port 8000 &

echo "[Entrypoint] Starting Nginx..."
nginx -g "daemon off;"