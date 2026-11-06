"""极简计算器：静态页面托管 + 四则运算求值接口（仅标准库）。"""
import ast
import json
import operator
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

BASE = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(BASE, "static")

OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}

MAX_LEN = 100


def _eval(node):
    if isinstance(node, ast.Constant) and type(node.value) in (int, float):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in OPS:
        return OPS[type(node.op)](_eval(node.left), _eval(node.right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in OPS:
        return OPS[type(node.op)](_eval(node.operand))
    raise ValueError("表达式不支持")


def format_number(value):
    if isinstance(value, float):
        if value != value or value in (float("inf"), float("-inf")):
            raise ValueError("结果超出范围")
        if value.is_integer() and abs(value) < 1e16:
            return str(int(value))
        return repr(round(value, 10)).rstrip("0").rstrip(".") if "." in repr(value) else repr(value)
    return str(value)


def calculate(expr):
    """把表达式字符串交给后端求值，返回格式化后的结果字符串。"""
    if not isinstance(expr, str) or not expr.strip():
        raise ValueError("请输入表达式")
    if len(expr) > MAX_LEN or "\n" in expr:
        raise ValueError("表达式过长")
    try:
        result = _eval(ast.parse(expr, mode="eval").body)
    except ZeroDivisionError:
        raise ValueError("不能除以零")
    except SyntaxError:
        raise ValueError("表达式不完整")
    return format_number(result)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC, **kwargs)

    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/api/calc":
            self._send_json({"error": "接口不存在"}, 404)
            return
        length = int(self.headers.get("Content-Length") or 0)
        if length > 1024:
            self._send_json({"error": "请求过大"}, 413)
            return
        try:
            payload = json.loads(self.rfile.read(length) or b"{}")
            expr = payload.get("expr", "")
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._send_json({"error": "请求格式错误"}, 400)
            return
        try:
            self._send_json({"result": calculate(expr)})
        except ValueError as exc:
            self._send_json({"error": str(exc)}, 400)

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args))


def main():
    port = int(os.environ.get("PORT", 8000))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"计算器已启动：http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()


if __name__ == "__main__":
    main()
