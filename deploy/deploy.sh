#!/bin/bash
# 在 dev 机（180.76.180.249）上执行：拉代码 -> 装 systemd 单元 -> 重启服务
set -euo pipefail

REPO="https://github.com/wzqfwanj/calculator.git"
APP_DIR="/opt/calculator"
PORT="8090"

if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch --depth 1 origin main
  git -C "$APP_DIR" reset --hard origin/main
else
  git clone --depth 1 "$REPO" "$APP_DIR"
fi

install -m 644 "$APP_DIR/deploy/calculator.service" /etc/systemd/system/calculator.service
systemctl daemon-reload
systemctl enable --now calculator.service
sleep 1
systemctl --no-pager --lines=0 status calculator.service | head -5 || true
curl -s -m 5 -X POST -H 'Content-Type: application/json' \
  -d '{"expr":"1+2*3"}' "http://127.0.0.1:${PORT}/api/calc"
echo
