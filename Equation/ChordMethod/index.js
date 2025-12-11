import { equation } from "../equation.js";

const input = document.getElementById("intervalInput");
const resultSpan = document.getElementById("resultSpan");
const chartCanvas = document.getElementById("functionChart");
const form = document.getElementById("form");
let chart = null;
let chartExists = false;

// Проверка на ошибки
function hasError() {
  return resultSpan.textContent.toLowerCase().includes("ошибка");
}

// Метод секущих (хорд)
function findRootSecant(x0 = 0, x1 = 10, epsilon = 1e-6, maxIterations = 1000) {
  for (let i = 0; i < maxIterations; i++) {
    const f0 = equation(x0);
    const f1 = equation(x1);

    if (f1 - f0 === 0) throw new Error("Деление на ноль, метод не применим");

    const x2 = x1 - (f1 * (x1 - x0)) / (f1 - f0);

    if (Math.abs(x2 - x1) < epsilon) return x2;

    x0 = x1;
    x1 = x2;
  }
  throw new Error("Метод хорд не сошёлся");
}

// Отображение результата и графика
function updateVisibility() {
  resultSpan.style.display = resultSpan.textContent.trim() ? "block" : "none";
  // chartCanvas.style.display = !chartExists || hasError() ? "none" : "block";
}

// Парсинг интервала вида "[a, b]"
function parseInterval(intervalStr) {
  const parts = intervalStr.replace(/[\[\]\s]/g, "").split(",");
  const a = Number(parts[0]);
  const b = Number(parts[1]);

  if (isNaN(a) || isNaN(b)) throw new Error("Неверный формат интервала");

  return [a, b];
}

// Построение графика функции с корнем
function drawChart(a, b, root = null, step = 0.01) {
  const values = [];
  const labels = [];

  for (let x = a; x <= b; x += step) {
    values.push(equation(x));
    labels.push(x);
  }

  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const padding = (maxY - minY) * 0.1;

  const rootData = root !== null ? [{ x: root, y: equation(root) }] : [];

  if (!chart) {
    chart = new Chart(chartCanvas, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "y = f(x)",
            data: values.map((y, i) => ({ x: labels[i], y })),
            borderColor: "blue",
            showLine: true,
            pointRadius: 0,
          },
          {
            label: "Корень",
            data: rootData,
            borderColor: "red",
            backgroundColor: "red",
            pointRadius: 6,
            type: "scatter",
          },
        ],
      },
      options: {
        scales: {
          x: { type: "linear" },
          y: { min: minY - padding, max: maxY + padding },
        },
      },
    });
    chartExists = true;
  } else {
    chart.data.datasets[0].data = values.map((y, i) => ({ x: labels[i], y }));
    chart.data.datasets[1].data = rootData;
    chart.options.scales.y.min = minY - padding;
    chart.options.scales.y.max = maxY + padding;
    chart.update();
  }
}

// Обработка формы
function handleSubmit(event) {
  event.preventDefault(); // предотвращаем перезагрузку

  try {
    const [x0, x1] = parseInterval(input.value.trim());
    if (equation(x0) * equation(x1) >= 0) {
      throw new Error("На концах интервала функция должна иметь разные знаки");
    }

    const root = findRootSecant(x0, x1);
    resultSpan.textContent = `Корень уравнения: x ≈ ${root.toFixed(6)}`;

    // drawChart(x0, x1, root);
    updateVisibility();
  } catch (err) {
    resultSpan.textContent = `Ошибка: ${err.message}`;
    updateVisibility();
  }
}

form.addEventListener("submit", handleSubmit);
