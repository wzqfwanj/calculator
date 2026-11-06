# 计算器

黑白极简的四则运算计算器。前端 HTML/CSS/JS，后端 Python 标准库，无第三方依赖。

线上地址：https://wkeeli.cn/calc/

## 运行

```bash
python server.py              # 默认 http://127.0.0.1:8000
PORT=8090 python server.py    # 自定义端口
```

## 功能

- 加、减、乘、除，括号，小数，正负号，退格，清空
- 键盘输入：数字、`+ - * / ( ) .`、`Enter` 计算、`Backspace` 退格、`Esc` 清空
- 明暗主题切换，跟随系统偏好并记忆选择
- 计算在后端完成，表达式通过 AST 白名单求值，不使用 `eval`

## 接口

`POST /api/calc`

```json
{ "expr": "1+2*3" }
```

成功返回 `{"result": "7"}`；失败返回 400 和 `{"error": "..."}`。

前端用相对路径请求 `api/calc`，所以挂在 `/calc/` 子路径下也能正常工作。

## 结构

```
server.py                        HTTP 服务 + 表达式求值
static/index.html                页面结构
static/style.css                 黑白主题样式
static/app.js                    交互逻辑
deploy/deploy.sh                 dev 机部署脚本
deploy/calculator.service        systemd 单元
deploy/caddy-wkeeli.cn.snippet   跳板机 Caddy 反代片段
```

## 部署

服务跑在 dev 机（180.76.180.249）的 8090 端口，由跳板机（8.133.209.25）的 Caddy
按 `/calc/` 子路径反代并签发 HTTPS 证书。

```bash
# 1. dev 机
ssh dev 'bash -s' < deploy/deploy.sh

# 2. 跳板机：把 snippet 内容插进 wkeeli.cn 站点块，然后
ssh aliyun 'caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy'
```
