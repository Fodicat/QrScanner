import express from 'express';
import { getAllLectures, CreateLectures, AddStudents, RemoveStudent } from '../controllers/lecturesController.js';

const router = express.Router();

router.get('/', getAllLectures);
router.post('/', CreateLectures);
router.post('/student/Add', AddStudents)
router.post('/student/Remove', RemoveStudent)

export default router;