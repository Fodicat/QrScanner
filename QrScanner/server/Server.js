import express from "express";
import https from "https";
import fs from "fs";
import path from "path";

import userRoutes from './routes/userRoutes.js';
import lecturesRoutes from './routes/lecturesRoutes.js';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/lectures', lecturesRoutes);
app.use('/api/users', userRoutes);

const PORT = 3000;

// Читаем ключ и сертификат
const httpsOptions = {
  key: fs.readFileSync(path.resolve('./cert/key.pem')),
  cert: fs.readFileSync(path.resolve('./cert/cert.pem')),
};

// Запускаем HTTPS сервер
https.createServer(httpsOptions, app).listen(PORT, '192.168.0.6', () => {
  console.log(`HTTPS сервер запущен на https://192.168.0.6:${PORT}`);
});
