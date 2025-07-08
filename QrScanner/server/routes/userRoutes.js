import express from 'express';
import { getAllUsers, createUser, login } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);
router.post('/login', login);

export default router;
