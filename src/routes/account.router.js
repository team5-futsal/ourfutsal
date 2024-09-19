import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import authMiddleware from '../middlewares/auth.middleware.js';
import { createAccessToken } from '../utils/tokens/tokens.js';
import { UserValidation } from '../utils/validation.js';

const router = express.Router();

/** 사용자 회원가입 API **/
router.post('/account/regist', async (req, res, next) => {
    try {
        // const validateBody = await validSchema.account.validateAsync(req.body);

        // const { userId, password } = validateBody;
        // // 아이디 중복 확인
        // const isExistUser = await prisma.account.findFirst({
        //     where: {
        //         userId,
        //     },
        // });

        // if (isExistUser) {
        //     return res.status(409).json({ message: '이미 존재하는 아이디입니다.' });
        // }
        const newUser = new UserValidation(req.body);
        const validationInfo = await newUser.validation();

        if (!validationInfo.success) {
            return res.status(401).json({ errorMessage: validationInfo.msg });
        }

        // 사용자 비밀번호를 암호화합니다.
        const hashedPassword = await bcrypt.hash(newUser.password, 10);

        // Users 테이블에 사용자를 추가합니다.
        const user = await prisma.account.create({
            data: {
                userId: newUser.userId,
                password: hashedPassword,
            },
        });

        return res.status(201).json({
            userId: newUser.userId,
            message: '회원가입이 완료되었습니다.',
        });
    } catch (error) {
        next(error);
    }
});

/** 사용자 로그인 API **/
router.post('/account/login', async (req, res, next) => {
    const { userId, password } = req.body;
    const user = await prisma.account.findFirst({ where: { userId } });

    if (!user) return res.status(401).json({ message: '존재하지 않는 아이디입니다.' });
    // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
    else if (!(await bcrypt.compare(password, user.password)))
        return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

    // 로그인에 성공하면, 사용자의 userId를 바탕으로 토큰을 생성합니다.
    const accessToken = createAccessToken(user.accountId);

    // authotization 헤더에 Bearer 토큰 형식으로 JWT를 저장합니다.
    // res.header('authorization', `Bearer ${accessToken}`);
    res.cookie('authorization', `Bearer ${accessToken}`, {
        httpOnly: true,
        secure: false,
        sameSite: 'Strict',
        maxAge: 1000 * 60 * 60 * 24 * 1,
    });
    return res.status(200).json({ isLogin: true });
});

/** 사용자 조회 API **/
router.get('/account', authMiddleware, async (req, res, next) => {
    const { accountId } = req.user;

    const user = await prisma.account.findFirst({
        where: { accountId: +accountId },
        select: {
            userId: true,
            createdAt: true,
        },
    });

    return res.status(200).json({ data: user });
});

/** 사용자 전체 조회 */
router.get('/account/all', async (req, res, next) => {
    const users = await prisma.account.findMany({
        select: {
            userId: true,
            createdAt: true,
        },
    });

    return res.status(200).json({ data: users, message: 'asdsad' });
});

/** 사용자 수정 API */
router.patch('/account', authMiddleware, async (req, res, next) => {
    const { accountId } = req.user;
    const { userId, password } = req.body;
});

export default router;
