import db from '../db/connection.js';

export const getAllLectures = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM lectures');

    // Преобразуем поле students из строки в объект/массив для каждой лекции
    const lectures = rows.map(lecture => {
      let students = [];
      try {
        // Пробуем распарсить JSON, если поле корректно
        students = JSON.parse(lecture.students);
      } catch (e) {
        console.warn(`Ошибка парсинга students для лекции id=${lecture.id}`, e);
      }

      return {
        ...lecture,
        students,
      };
    });

    res.json(lectures);
  } catch (err) {
    console.error('Ошибка при получении лекций:', err);
    res.status(500).json({ error: 'Ошибка при получении лекций' });
  }
};


export const CreateLectures = async (req, res) => {
    const { title, date, showTotal, students, time, } = req.body;

    try{
        const [rows] = await db.execute('INSERT INTO lectures (id, title, date, time, showTotal, students) VALUES (?, ?, ?, ?, ?, ?)', 
            [null, title, date, time, showTotal, students]);
        res.json("Лекция создана");
    } catch (err) {
        console.error('Ошибка при создании лекций:', err); // ← логируем ошибку в консоль
        res.status(500).json({ error: 'Ошибка при создании лекций' });
    }
}

export const AddStudents = async (req, res) => {
  const { lectureId, name, group, isPresent } = req.body;

  try {
    const [rows] = await db.execute('SELECT students FROM lectures WHERE id = ?', [lectureId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Лекция не найдена' });
    }

    let students = [];
    try {
      students = JSON.parse(rows[0].students || '[]');
    } catch (e) {
      console.error("Ошибка парсинга JSON:", e);
      return res.status(500).json({ error: 'Ошибка чтения студентов' });
    }

    const newStudentId = students.length > 0 ? Math.max(...students.map(s => s.id || 0)) + 1 : 1;

    const newStudent = {
      id: newStudentId,
      name,
      group,
      isPresent: isPresent ?? true,
    };
    students.push(newStudent);

    await db.execute('UPDATE lectures SET students = ? WHERE id = ?', [JSON.stringify(students), lectureId]);

    res.json({ message: 'Студент добавлен', student: newStudent });
  } catch (err) {
    console.error('Ошибка при добавлении студента:', err);
    res.status(500).json({ error: 'Ошибка при добавлении студента' });
  }
};

export const RemoveStudent = async (req, res) => {
  const { lectureId, studentId } = req.body;

  try {
    const [rows] = await db.execute('SELECT students FROM lectures WHERE id = ?', [lectureId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Лекция не найдена' });
    }

    const studentsJson = rows[0].students || '[]';
    let students = JSON.parse(studentsJson);

    students = students.filter(student => student.id !== Number(studentId));

    students = students.map((student, index) => ({
      ...student,
      id: index + 1
    }));

    await db.execute(
      'UPDATE lectures SET students = ? WHERE id = ?',
      [JSON.stringify(students), lectureId]
    );

    res.json({ message: 'Студент удалён и ID обновлены', students });
  } catch (err) {
    console.error('Ошибка при удалении студента:', err);
    res.status(500).json({ error: 'Ошибка при удалении студента' });
  }
};



