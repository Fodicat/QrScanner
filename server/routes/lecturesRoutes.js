import express from 'express';
import { getAllLectures, getLectureById, CreateLectures, AddStudents, RemoveStudent } from '../controllers/lecturesController.js';

const router = express.Router();

router.get('/', getAllLectures);
router.get('/:id', getLectureById);
router.post('/', CreateLectures);
router.post('/student/Add', AddStudents);
router.post('/student/Remove', RemoveStudent);

export default router;