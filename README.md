# 计算器

黑白极简的四则运算计算器。前端 HTML/CSS/JS，后端 Python 标准库，无第三方依赖。

## 运行

```bash
python server.py          # 默认 http://127.0.0.1:8000
PORT=8010 python server.py  # 自定义端口
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

## 结构

```
server.py            HTTP 服务 + 表达式求值
static/index.html    页面结构
static/style.css     黑白主题样式
static/app.js        交互逻辑
```
