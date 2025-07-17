import db from '../db/connection.js';
import bcrypt from 'bcrypt';

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, lastName FROM teachers');
    res.json(rows);
  } catch (err) {
    console.error('Ошибка при получении пользователей:', err);
    res.status(500).json({ error: 'Ошибка при получении пользователей' });
  }
};

export const login = async (req, res) => {
  const { lastName, password } = req.body;
  console.log("Попытка входа:", { lastName, password: password ? '***' : undefined });

  try {
    const [rows] = await db.execute('SELECT * FROM teachers WHERE lastName = ?', [lastName]);
    console.log("Результат запроса в БД:", rows);

    if (rows.length === 0) {
      console.log("Пользователь не найден");
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = rows[0];

    // Сравниваем хешированный пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log("Неверный пароль");
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    console.log("Пользователь успешно вошел:", user.lastName);
    res.json({ message: 'Успешный вход', user: { id: user.id, lastName: user.lastName } });
  } catch (err) {
    console.error("Ошибка сервера:", err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const createUser = async (req, res) => {
  const { lastName, password } = req.body;
  
  if (!lastName || !password) {
    return res.status(400).json({ error: 'Фамилия и пароль обязательны' });
  }
  
  try {
    // Проверяем, не существует ли уже пользователь с такой фамилией
    const [existingUsers] = await db.execute('SELECT id FROM teachers WHERE lastName = ?', [lastName]);
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Пользователь с такой фамилией уже существует' });
    }
    
    // Хешируем пароль перед сохранением
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    await db.execute('INSERT INTO teachers (lastName, password) VALUES (?, ?)', [lastName, hashedPassword]);
    res.status(201).json({ message: 'Пользователь создан' });
  } catch (err) {
    console.error('Ошибка при создании пользователя:', err);
    res.status(500).json({ error: 'Ошибка при создании пользователя' });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await db.execute('DELETE FROM teachers WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json({ message: 'Пользователь удален' });
  } catch (err) {
    console.error('Ошибка при удалении пользователя:', err);
    res.status(500).json({ error: 'Ошибка при удалении пользователя' });
  }
};
