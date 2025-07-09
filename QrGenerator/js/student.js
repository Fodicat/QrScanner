let countdownInterval;

document.getElementById('student-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  if (!name) {
    alert('Введите ваше имя!');
    return;
  }

  // Генерируем случайный 6‑значный ID
  const studentId = Math.floor(100000 + Math.random() * 900000).toString();
  const timestamp = new Date().toISOString();
  const data = { name, studentId, timestamp };

  // Очистка предыдущего QR и таймера
  const canvas = document.getElementById('qrcode');
  const timerDisplay = document.getElementById('timer');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  timerDisplay.textContent = '';
  clearInterval(countdownInterval);

  // Генерация QR‑кода через QRious (поддерживает кириллицу)
  const qr = new QRious({
    element: canvas,
    value: JSON.stringify(data),
    size: 256,
    level: 'H'  // высокий уровень коррекции ошибок
  });

  // Запуск таймера на 3 минуты
  let timeLeft = 180;
  function updateTimer() {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    timerDisplay.textContent = `QR‑код активен: ${m}:${s}`;
  }

  updateTimer();
  countdownInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      // Удаляем QR-код
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timerDisplay.textContent = '⛔ Время действия QR‑кода истекло. Сгенерируйте заново.';
    } else {
      updateTimer();
    }
  }, 1000);
});
