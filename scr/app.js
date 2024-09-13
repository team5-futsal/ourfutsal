import express from 'express';
import cookieParser from 'cookie-parser';
import ErrorHandlerMiddleware from './middlewares/error-handler.middleware.js'
import UsersRouter from './routes/users.router.js';
import charactersRouter from './routes/characters.router.js'
import itemsRouter from './routes/items.router.js'
import inventoryRouter from './routes/inventory.router.js'
import gearsRouter from './routes/gears.router.js'

const app = express();
const PORT = 3333;

app.use(express.json());
app.use(cookieParser());
app.use('/api', [UsersRouter, charactersRouter, itemsRouter, inventoryRouter, gearsRouter]);

// 에러 핸들링 미들웨어를 등록합니다.
app.use(ErrorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});