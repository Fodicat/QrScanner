let countdownInterval;

document.getElementById('student-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const group = document.getElementById('group').value.trim();

  if (!name || !group) {
    alert('Пожалуйста, введите имя и группу!');
    return;
  }

  const timestamp = new Date().toISOString();
  const data = {
    name,
    group,
    timestamp
  };

  const canvas = document.getElementById('qrcode');
  const timerDisplay = document.getElementById('timer');

  // Очистка
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  timerDisplay.textContent = '';
  clearInterval(countdownInterval);

  // Генерация QR-кода
  const qr = new QRious({
    element: canvas,
    value: JSON.stringify(data),
    size: 256,
    level: 'H'
  });

  // Таймер 3 минуты
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
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      timerDisplay.textContent = '⛔ Время действия QR‑кода истекло. Сгенерируйте заново.';
    } else {
      updateTimer();
    }
  }, 1000);
});
