import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import authMiddleware from '../middlewares/auth.middleware.js';
import { createAccessToken } from '../utils/tokens/tokens.js';
import validSchema from '../utils/joi/valid.schema.js';
import { UserValidation } from '../utils/validation.js';

const router = express.Router();


/** 사용자 회원가입 API **/
router.post('/account/regist', async (req, res, next) => {
    try {
        const validateBody = await validSchema.account.validateAsync(req.body);

        // 아이디 중복 확인
        const isExistUser = await prisma.account.findFirst({
            where: {
                userId:validateBody.userId,
            },
        });

        if (isExistUser) {
            throw new Error('AlreadyExistUser');
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
        const { userId, password } = req.body;
        const user = await prisma.account.findFirst({ where: { userId } });

        // 사용자 존재 여부 확인
        if (!user) throw new Error('AccountNotFound');
        // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
        else if (!(await bcrypt.compare(password, user.password))) throw new Error('InvalidPassword');

        // 로그인에 성공하면, 사용자의 userId를 바탕으로 토큰을 생성합니다.
        const accessToken = createAccessToken(user.accountId);

        // authotization 헤더에 Bearer 토큰 형식으로 JWT를 저장합니다.
        res.header('authorization', `Bearer ${accessToken}`);
        // res.cookie('authorization', `Bearer ${accessToken}`, {
        //     httpOnly: true,
        //     secure: false,
        //     sameSite: 'Strict',
        //     maxAge: 1000 * 60 * 60 * 24 * 1,
        // });
        return res.status(200).json({ isLogin: true, token: accessToken });
    } catch (err) {
        next(err);
    }
});


/** 사용자 조회 API **/
router.get('/account', authMiddleware, async (req, res, next) => {
    try {
        const { accountId } = req.user;

        const user = await prisma.account.findFirst({
            where: { accountId: +accountId },
            select: {
                userId: true,
                createdAt: true,
            },
        });

        if (!user) throw new Error('AccountNotFound');

        return res.status(200).json({ data: user, user: req.user });
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
router.patch('/account', authMiddleware, async (req, res, next) => {
    try {
        console.log(req.body);
        const { accountId } = req.user;
        const { password } = req.body;

        console.log(password);

        const user = await prisma.account.findFirst({ where: { accountId } });

        // 사용자 존재 여부 확인
        if (!user) throw new Error('AccountNotFound');
        // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
        // else if (!(await bcrypt.compare(password, user.password))) throw new Error('InvalidPassword');

        // 사용자가 맞다면 새로 입력한 비밀번호를 암호화합니다.
        const newHashedPassword = await bcrypt.hash(password, 10);
        // account 테이블에 있는 사용자를 수정합니다.
        const updatedUser = await prisma.account.update({
            data : {password: newHashedPassword},
            where: {accountId: accountId}
        })

        return res.status(201).json({message: '사용자의 정보가 변경되었습니다.'})

    } catch (err) {
        next(err);
    }
});


/** 계정 삭제 */
router.delete('/account', authMiddleware, async(req,res,next) => {
    try {
        const { accountId } = req.user;

        const user = await prisma.account.findFirst({
            where: { accountId }
        });

        const userId = user.userId;
        
        if(!user) 
            throw new Error('AccountNotFound');

        await prisma.account.delete({
            where: { accountId }
        })

        return res.status(201).json({ data:{userId, message: '요청한 사용자가 삭제되었습니다.'}});
    }
    catch(err) {
        next(err);
    }
})

export default router;