let countdownInterval;

document.getElementById('student-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const group = document.getElementById('group').value.trim();
  const timestamp = new Date().toISOString();

  if (!name || !group) {
    alert('Заполните все поля!');
    return;
  }

  if (name.length > 20 || group.length > 20) {
    alert('Максимум 20 символов в имени и группе!');
    return;
  }

  const data = {
    n: name,
    g: group,
    t: timestamp
  };

  const encoded = encodeURIComponent(JSON.stringify(data));

  document.getElementById("qrcode").innerHTML = "";
  document.getElementById("timer").textContent = "";
  clearInterval(countdownInterval);

  new QRCode(document.getElementById("qrcode"), {
    text: encoded,
    width: 256,
    height: 256,
    correctLevel: QRCode.CorrectLevel.L // наименьшая коррекция — больше места
  });

  let timeLeft = 180;
  const timerDisplay = document.getElementById("timer");

  function updateTimerDisplay() {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');
    timerDisplay.textContent = `QR-код активен: ${minutes}:${seconds}`;
  }

  updateTimerDisplay();

  countdownInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      document.getElementById("qrcode").innerHTML = "";
      timerDisplay.textContent = "⛔ Время действия QR-кода истекло.";
    } else {
      updateTimerDisplay();
    }
  }, 1000);
});
