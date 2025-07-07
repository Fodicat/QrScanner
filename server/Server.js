import express from "express";
import userRoutes from './routes/userRoutes.js';
import db from './db/connection.js';

const app = express();

app.use('/api/users', userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});