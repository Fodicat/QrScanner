import db from '../db/connection.js';

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM teachers');
    res.json(rows);
  } catch (err) {
    console.error('Ошибка при получении пользователей:', err); // ← логируем ошибку в консоль
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM teachers WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = rows[0];

    console.log(user)

    if (user.password !== password) {
      console.log(user.password)
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    // Здесь можно сгенерировать токен или просто вернуть данные
    res.json({ message: 'Успешный вход', user });
  } catch (err) {
    console.error('Ошибка при входе:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const createUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    await db.execute('INSERT INTO teachers (Email, Password) VALUES (?, ?)', [email, password]);
    res.status(201).json({ message: 'Пользователь создан' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при создании пользователя' });
  }
};
