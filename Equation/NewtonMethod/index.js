import { equation, derivativeEquation } from "../equation.js";

const input = document.getElementById("initialGuessInput");
const resultSpan = document.getElementById("resultSpan");
const chartCanvas = document.getElementById("functionChart");
let chart = null;
let chartExists = false;

// Проверка, есть ли ошибка
function hasError() {
  return resultSpan.textContent.toLowerCase().includes("ошибка");
}

// Метод Ньютона
function findRootNewton(
  initialGuess = 5,
  epsilon = 1e-6,
  maxIterations = 1000
) {
  let x = initialGuess;

  for (let i = 0; i < maxIterations; i++) {
    const derivative = derivativeEquation(x);
    if (derivative === 0)
      throw new Error("Производная равна нулю, деление невозможно");

    const nextX = x - equation(x) / derivative;
    if (Math.abs(nextX - x) < epsilon) return nextX;
    x = nextX;
  }

  throw new Error("Метод Ньютона не сошёлся");
}

// Отображение результата и графика
function updateVisibility() {
  resultSpan.style.display = resultSpan.textContent.trim() ? "block" : "none";
  chartCanvas.style.display = !chartExists || hasError() ? "none" : "block";
}

// Построение графика функции с корнем
function drawChart(start = -10, end = 10, root = null, step = 0.1) {
  const values = [];
  const labels = [];

  for (let x = start; x <= end; x += step) {
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
            data: values.map((y, i) => ({ x: parseFloat(labels[i]), y })),
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
    chart.data.datasets[0].data = values.map((y, i) => ({
      x: parseFloat(labels[i]),
      y,
    }));
    chart.data.datasets[1].data = rootData;
    chart.options.scales.y.min = minY - padding;
    chart.options.scales.y.max = maxY + padding;
    chart.update();
  }
}

// Обработка формы
function handleSubmit(event) {
  event.preventDefault();

  try {
    const initialGuess = parseFloat(input.value.trim());
    if (isNaN(initialGuess))
      throw new Error("Введите корректное числовое значение");

    const root = findRootNewton(initialGuess);
    resultSpan.textContent = `Корень уравнения: x ≈ ${root.toFixed(6)}`;

    // Построим график вокруг корня
    drawChart(root - 5, root + 5, root);
    updateVisibility();
  } catch (err) {
    console.error(err);

    resultSpan.textContent = `Ошибка: ${err.message}`;
    chartCanvas.style.display = "none";
    updateVisibility();
  }
}

const form = document.getElementById("form");
form.addEventListener("submit", handleSubmit);
