import express from 'express';
import { getAllUsers, createUser, login, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);
router.post('/login', login);
router.delete('/:id', deleteUser);

export default router;
