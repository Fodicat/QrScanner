let scannedData = null;
const statusEl = document.getElementById('status');
const scannedDataEl = document.getElementById('scanned-data');
const markBtn = document.getElementById('mark-attendance');

// Успешное сканирование QR
function onScanSuccess(decodedText, decodedResult) {
  try {
    const json = decodeURIComponent(decodedText);
    const data = JSON.parse(json);

    scannedData = {
      name: data.n,
      group: data.g,
      timestamp: data.t
    };

    scannedDataEl.innerHTML = `
      <p><strong>Имя студента:</strong> ${scannedData.name}</p>
      <p><strong>Группа:</strong> ${scannedData.group}</p>
      <p><strong>Время генерации:</strong> ${new Date(scannedData.timestamp).toLocaleString("ru-RU")}</p>
    `;

    markBtn.style.display = "block";
    statusEl.textContent = "✅ Данные получены. Нажмите 'Отметить присутствие'.";
  } catch (err) {
    statusEl.textContent = "❌ Ошибка при распознавании QR-кода.";
    console.error(err);
  }
}

function onScanFailure(error) {
  // Ошибки сканирования можно не отображать
}

const html5QrcodeScanner = new Html5QrcodeScanner(
  "reader", { fps: 10, qrbox: 250 }, false
);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);

// Отправка данных в Google Таблицу
markBtn.addEventListener('click', function () {
  if (!scannedData) {
    alert("Нет данных.");
    return;
  }

  const lessonId = prompt("Введите ID занятия (например, IT101):");
  if (!lessonId) {
    alert("ID занятия обязателен.");
    return;
  }

  const payload = {
    lessonId: lessonId,
    student: scannedData.name,
    group: scannedData.group,
    generatedAt: scannedData.timestamp,
    markedAt: new Date().toISOString()
  };

  fetch("https://script.google.com/macros/s/ТВОЙ_URL/exec", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.text())
    .then(msg => {
      statusEl.textContent = "✅ Отправлено: " + msg;
      scannedDataEl.innerHTML = "";
      scannedData = null;
      markBtn.style.display = "none";
    })
    .catch(err => {
      statusEl.textContent = "❌ Ошибка отправки: " + err;
      console.error(err);
    });
});
