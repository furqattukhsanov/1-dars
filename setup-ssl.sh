#!/bin/bash
# Serverda bir marta ishga tushiring: bash setup-ssl.sh

sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

sudo certbot --nginx -d lolamarket.uz -d www.lolamarket.uz \
  --non-interactive --agree-tos -m furqattukhsanov@gmail.com

sudo systemctl reload nginx
echo "✅ SSL tayyor!"
