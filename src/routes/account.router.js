import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import authMiddleware from '../middlewares/auth.middleware.js';
import { createAccessToken, createRefreshToken, validateToken, getExistRefreshToken } from '../utils/tokens/tokens.js';
import { getUser } from '../utils/service/validation.js';
import validSchema from '../utils/joi/valid.schema.js';

const router = express.Router();

/** 사용자 회원가입 API **/
router.post('/account/regist', async (req, res, next) => {
    try {
        const validateBody = await validSchema.account.validateAsync(req.body);

        // 아이디 중복 확인
        const user = await prisma.account.findFirst({
            where: {
                userId: validateBody.userId,
            },
        });

        if (user) {
            return res.status(409).json({ errorMessage: '이미 존재하는 아이디입니다.' });
        }

        // 사용자 비밀번호를 암호화합니다.
        const hashedPassword = await bcrypt.hash(validateBody.password, 10);

        // Users 테이블에 사용자를 추가합니다.
        const newUser = await prisma.account.create({
            data: {
                userId: validateBody.userId,
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
    try {
        console.log(req.body);
        const { userId, password } = req.body;
        const user = await prisma.account.findFirst({ where: { userId } });

        // 사용자 존재 여부 확인
        if (!user) return res.status(404).json({ errorMessage: '존재하지 않는 사용자입니다.' });

        // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
        if (!(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ errorMessage: '비밀번호가 일치하지 않습니다.' });

        // 로그인에 성공하면 refreshToken과 AccessToken을 발급합니다.
        // 단, 리프레시토큰은 tokenStorage에 저장되어 있는지 확인(만료도 확인)하여 발급합니다.
        // 리프레시토큰 만료날짜 확인은 현재 시간보다 expiredAt이 큰 토큰이 있는지 확인하는 방법으로 합니다.
        let isExistsRefresh = true;

        const curRefreshToken = await getExistRefreshToken(user.accountId);

        if (!curRefreshToken) {
            isExistsRefresh = false;
        }

        if (!isExistsRefresh) {
            const refreshToken = createRefreshToken(user.accountId);
            const createAtRefreshToken = Math.floor((new Date().getTime() + 1) / 1000);
            // 리프레시토큰의 만료기한을 가져온다.
            const expiredDate = validateToken(refreshToken, process.env.OUR_SECRET_REFRESH_KEY).exp;

            await prisma.tokenStorage.create({
                data: {
                    accountId: user.accountId,
                    token: refreshToken,
                    createdAt: createAtRefreshToken,
                    expiredAt: expiredDate, // 가져온 만료기한을 그대로 기입
                },
            });
            // refreshToken을 쿠키에 저장하여 사용
            // 근데 만약... 쿠키가 만료되지 않았는데 삭제되었다면 어떡하지?
            // => 재로그인을 요청할 예정
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 1000 * 60 * 10, // 현재 3분 설정
            });
            console.log('리프레시토큰 만료로 재발급합니다.');
        } else {
            // refreshToken이 아직 유효할때 그대로 쿠키로 저장
            res.cookie('refreshToken', curRefreshToken.token, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 1000 * 60 * 10, // 현재 3분 설정
            });
            console.log('리프레시토큰 유효합니다.');
        }

        const accessToken = createAccessToken(user.accountId);
        // res.header('authorization', `Bearer ${accessToken}`);

        return res.status(200).json({ isLogin: true, accessToken });
    } catch (err) {
        next(err);
    }
});

/** 계정 로그아웃 */
router.get('/account/logout', authMiddleware, async (req, res, next) => {
    const user = await prisma.account.findUnique({
        where: { accountId: req.user.accountId },
    });

    if (!user) {
        return res.status(404).json({ errorMessage: '유저를 찾을 수 없습니다.' });
    }

    res.clearCookie('refreshToken');
    // 헤더에 저장된 토큰 삭제
    return res.status(200).json({ message: '로그아웃 되었습니다.' });
});

/** 사용자 조회 API **/
router.get('/account', authMiddleware, async (req, res, next) => {
    try {
        const user = await prisma.account.findUnique({
            where: { accountId: req.user.accountId },
        });

        if (!user) {
            return res.status(404).json({ errorMessage: '유저를 찾을 수 없습니다.' });
        }

        return res.status(200).json({ user });
    } catch (err) {
        next(err);
    }
});

/** 사용자 전체 조회 */
router.get('/account/all', async (req, res, next) => {
    try {
        const users = await prisma.account.findMany({
            select: {
                userId: true,
                createdAt: true,
            },
        });

        if (users.length < 0) {
            throw new Error('AccountNotFound');
        }

        return res.status(200).json({ data: users });
    } catch (err) {
        next(err);
    }
});

/** 사용자 수정 API */
router.put('/account', authMiddleware,  async (req, res, next) => {
    try {
        const { password } = req.body;
        const user = await prisma.account.findUnique({
            where: { accountId: req.user.accountId },
        });

        if (!user) {
            return res.status(404).json({ errorMessage: '유저를 찾을 수 없습니다.' });
        }
        // 사용자가 맞다면 새로 입력한 비밀번호를 암호화합니다.
        const newHashedPassword = await bcrypt.hash(password, 10);
        // account 테이블에 있는 사용자를 수정합니다.
        await prisma.account.update({
            data: { password: newHashedPassword },
            where: { accountId: req.user.accountId },
        });

        return res.status(201).json({ message: '사용자의 정보가 변경되었습니다.' });
    } catch (err) {
        next(err);
    }
});

/** 계정 삭제 */
router.delete('/account', authMiddleware, async (req, res, next) => {
    try {
        const user = await prisma.account.findUnique({
            where: { accountId: req.user.accountId },
        });

        if (!user) {
            return res.status(404).json({ errorMessage: '유저를 찾을 수 없습니다.' });
        }

        await prisma.account.delete({
            where: { accountId: req.user.accountId },
        });

        res.clearCookie('refreshToken');

        return res.status(201).json({ data: { userId: user.userId, message: '요청한 사용자가 삭제되었습니다.' } });
    } catch (err) {
        next(err);
    }
});

export default router;
