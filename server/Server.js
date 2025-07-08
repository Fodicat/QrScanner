import express from "express";
import userRoutes from './routes/userRoutes.js';
import lecturesRoutes from './routes/lecturesRoutes.js'
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/lectures', lecturesRoutes)
app.use('/api/users', userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});