const exprEl = document.getElementById("expr");
const resultEl = document.getElementById("result");
const themeBtn = document.getElementById("theme");

let expr = "";
let justEvaluated = false;

const SYMBOL = { "*": "×", "/": "÷", "-": "−" };

function pretty(text) {
  return text.replace(/[*/+\-]/g, (ch) => SYMBOL[ch] || ch);
}

function render() {
  exprEl.textContent = pretty(expr);
  if (!resultEl.classList.contains("error")) {
    resultEl.textContent = "0";
  }
}

function showError(message) {
  exprEl.textContent = pretty(expr);
  resultEl.textContent = message;
  resultEl.classList.add("error");
}

function clearError() {
  resultEl.classList.remove("error");
}

function reset() {
  expr = "";
  justEvaluated = false;
  clearError();
  exprEl.textContent = "";
  resultEl.textContent = "0";
}

function append(ch) {
  clearError();
  if (justEvaluated) {
    // 结果后直接输数字则重新开始，输运算符则接着算
    if (/[0-9.(]/.test(ch)) {
      expr = "";
    }
    justEvaluated = false;
    resultEl.textContent = "0";
  }
  expr += ch;
  exprEl.textContent = pretty(expr);
}

function backspace() {
  clearError();
  if (justEvaluated) {
    reset();
    return;
  }
  expr = expr.slice(0, -1);
  exprEl.textContent = pretty(expr);
}

function toggleSign() {
  clearError();
  if (!expr) return;
  const match = expr.match(/(\d+\.?\d*)$/);
  if (match) {
    const start = expr.length - match[0].length;
    expr = expr.slice(0, start) + "(-" + match[0] + ")";
  } else {
    expr = expr.startsWith("-") ? expr.slice(1) : "-" + expr;
  }
  exprEl.textContent = pretty(expr);
}

async function evaluate() {
  if (!expr) return;
  clearError();
  exprEl.textContent = pretty(expr) + " =";
  try {
    const resp = await fetch("api/calc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expr }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      showError(data.error || "计算出错");
      return;
    }
    resultEl.textContent = data.result;
    expr = data.result;
    justEvaluated = true;
  } catch (err) {
    showError("网络错误，请稍后重试");
  }
}

function handleKey(key) {
  if (/^[0-9.()]$/.test(key)) {
    append(key);
  } else if (["+", "-", "*", "/"].includes(key)) {
    append(key);
  } else if (key === "C") {
    reset();
  } else if (key === "back") {
    backspace();
  } else if (key === "sign") {
    toggleSign();
  } else if (key === "=") {
    evaluate();
  }
}

document.querySelector(".keys").addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-key]");
  if (btn) handleKey(btn.dataset.key);
});

document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (/^[0-9.()+\-*/]$/.test(key)) {
    event.preventDefault();
    handleKey(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    evaluate();
  } else if (key === "Backspace") {
    event.preventDefault();
    backspace();
  } else if (key === "Escape" || key.toLowerCase() === "c") {
    event.preventDefault();
    reset();
  }
});

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeBtn.setAttribute("aria-label", theme === "dark" ? "切换到亮色主题" : "切换到暗色主题");
  try {
    localStorage.setItem("calc-theme", theme);
  } catch (err) {
    /* 隐私模式下忽略 */
  }
}

themeBtn.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
});

const saved = (() => {
  try {
    return localStorage.getItem("calc-theme");
  } catch (err) {
    return null;
  }
})();
const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(saved || (prefersDark ? "dark" : "light"));

render();
resultEl.textContent = "0";
