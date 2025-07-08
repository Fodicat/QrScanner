import mysql from "mysql2/promise";

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'qrscanner'
});

db.connect((err) => {
    if (err) {
        console.error("Ошибка подключение к базе данных", err)
    } else {
        console.log("Успешное подключение а базе данных")
    }
})

export default db;