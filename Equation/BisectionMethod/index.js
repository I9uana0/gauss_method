import { equation } from "../equation.js";

const input = document.getElementById("intervalInput");
const resultSpan = document.getElementById("resultSpan");
const chartCanvas = document.getElementById("functionChart");
let chart = null;
let chartExists = false;

// Функция для проверки, есть ли ошибка
function hasError() {
  return resultSpan.textContent.toLowerCase().includes("ошибка");
}

// Метод половинного деления
function findRootBisection(a, b, epsilon = 1e-6) {
  let left = a;
  let right = b;

  while (right - left > epsilon) {
    const midpoint = (left + right) / 2;
    if (equation(left) * equation(midpoint) < 0) {
      right = midpoint;
    } else {
      left = midpoint;
    }
  }

  return (left + right) / 2;
}

// Парсинг интервала вида "[a, b]"
function parseInterval(intervalStr) {
  const parts = intervalStr.replace(/[\[\]\s]/g, "").split(",");
  const start = Number(parts[0]);
  const end = Number(parts[1]);

  if (isNaN(start) || isNaN(end)) {
    throw new Error("Неверный формат интервала");
  }

  return [start, end];
}

// Отображение результата и графика
function updateVisibility() {
  resultSpan.style.display = resultSpan.textContent.trim() ? "block" : "none";
  // chartCanvas.style.display = !chartExists || hasError() ? "none" : "block";
}

// Построение графика функции
// Построение графика функции с корнем
function drawChart(a, b, root = null, step = 0.1) {
  const values = [];
  const labels = [];

  for (let x = a; x <= b; x += step) {
    values.push(equation(x));
    labels.push(x.toFixed(2));
  }

  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const padding = (maxY - minY) * 0.1;

  // Данные для корня
  const rootData = root !== null ? [{ x: root, y: equation(root) }] : [];

  if (!chart) {
    chart = new Chart(chartCanvas, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "y = f(x)",
            data: Array.from(
              { length: Math.floor((b - a) / step) + 1 },
              (_, i) => {
                const x = a + i * step;
                return { x, y: equation(x) };
              }
            ),
            borderColor: "blue",
            showLine: true, // соединяет точки линией
            pointRadius: 0,
          },
          {
            label: "Корень",
            data: [{ x: root, y: equation(root) }],
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
          y: { beginAtZero: false },
        },
      },
    });

    chartExists = true;
  } else {
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.data.datasets[1].data = rootData;
    chart.options.scales.y.min = minY - padding;
    chart.options.scales.y.max = maxY + padding;
    chart.update();
  }
}

// Обработка отправки формы
function handleSubmit(event) {
  event.preventDefault();

  try {
    const [a, b] = parseInterval(input.value.trim());

    if (equation(a) * equation(b) >= 0) {
      throw new Error(
        "На концах интервала функция имеет одинаковый знак. Нет корня."
      );
    }

    const root = findRootBisection(a, b);
    resultSpan.textContent = `Корень уравнения: x ≈ ${root.toFixed(6)}`;

    // drawChart(a, b, root);
    updateVisibility();
  } catch (err) {
    resultSpan.textContent = `Ошибка: ${err.message}`;
    updateVisibility();
  }
}

const form = document.getElementById("form");
form.addEventListener("submit", handleSubmit);
