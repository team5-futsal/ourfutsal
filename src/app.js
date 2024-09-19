import express from 'express';
import cookieParser from 'cookie-parser';
import ErrorHandlerMiddleware from './middlewares/error-handler.middleware.js';
import accountRouter from './routes/account.router.js';
import productRouter from './routes/products.router.js';
import matchingRouter from './routes/matching.router.js';
import teamRouter from './routes/team.router.js';
import playersRouter from './routes/players.router.js';
import rosterRouter from './routes/roster.router.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3333;

app.use(express.urlencoded({ extended: true })); // 미들웨어 2
// 정적인 파일을 assets 폴더를 바탕으로 서빙을 한다는 구문
app.use(express.static(path.join(__dirname, 'browser'))); // 미들웨어 3


// 로그인 메인홈
app.get('/api', (req, res) => {
    res.sendFile(path.join(__dirname, 'browser/index.html'));
});

// API 카테고리 홈
app.get('/api/category', (req, res) => {
    res.sendFile(path.join(__dirname, 'browser/html/category.html'));
})


app.use(express.json());
app.use(cookieParser());
// app.use(express.urlencoded({ extended: true })); // 미들웨어 2
// // 정적인 파일을 assets 폴더를 바탕으로 서빙을 한다는 구문
// app.use('/api', express.static('./browser')); // 미들웨어 3


app.use('/api', [accountRouter, matchingRouter, teamRouter, productRouter, playersRouter, rosterRouter]);


// 에러 핸들링 미들웨어를 등록합니다.
app.use(ErrorHandlerMiddleware);

app.listen(PORT, () => {
    console.log(PORT, '포트로 서버가 열렸어요!');
});
