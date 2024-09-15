import express from 'express';
import cookieParser from 'cookie-parser';
import ErrorHandlerMiddleware from './middlewares/error-handler.middleware.js'
import UsersRouter from './routes/users.router.js';
import charactersRouter from './routes/characters.router.js'
import itemsRouter from './routes/items.router.js'
import inventoryRouter from './routes/inventory.router.js'
import gearsRouter from './routes/gears.router.js'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = 3333;

app.use(express.urlencoded({ extended: true })); // 미들웨어 2
// 정적인 파일을 assets 폴더를 바탕으로 서빙을 한다는 구문
app.use(express.static(path.join(__dirname, 'browser'))); // 미들웨어 3
app.get('/api', (req,res) => {
  res.sendFile(path.join(__dirname, 'browser/index.html'));
})

app.get('/api/apiCategories', (req, res) => {
  res.sendFile(path.join(__dirname, 'browser/html/category.html'));
})

app.use(express.json());
app.use(cookieParser());
// app.use(express.urlencoded({ extended: true })); // 미들웨어 2
// // 정적인 파일을 assets 폴더를 바탕으로 서빙을 한다는 구문
// app.use('/api', express.static('./browser')); // 미들웨어 3

app.use('/api', [UsersRouter, charactersRouter, itemsRouter, inventoryRouter, gearsRouter]);

// 에러 핸들링 미들웨어를 등록합니다.
app.use(ErrorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});