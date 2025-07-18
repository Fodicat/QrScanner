import express from 'express';
import { getAllLectures, getLectureById, CreateLectures, AddStudents, RemoveStudent, getLecturesByteacherid } from '../controllers/lecturesController.js';

const router = express.Router();

// lecturesRoutes.js или в твоём router-файле
router.get('/', getAllLectures);                // Получить все лекции
router.get('/:id', getLectureById);              // Получить лекцию по id
router.post('/', CreateLectures);                 // Создать новую лекцию

// Получить лекции по teacherid (через query-параметр)
router.get('/lec/by-teacher', getLecturesByteacherid); 

// Работа со студентами
router.post('/student/add', AddStudents);
router.post('/student/remove', RemoveStudent);

export default router;