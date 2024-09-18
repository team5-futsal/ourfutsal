import express from 'express';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

/** 보유 선수 조회
 인증 미들웨어를 통해
 로그인 여부 확인 및
 해당 유저인지 체크 **/
router.get('/roster', /*미들웨어*/ async (req, res) => {

    const accountId = 1;
    // const { accountId } = req.user; 검증미들웨어 구현예정

    const myPlayers = await prisma.roster.findMany({
        where: {
            accountId: +accountId,
        },

    });

    if (myPlayers.length === 0) {
        return res.status(404).json({ message: '보유한 선수가 없습니다.' });
    }

    return res.status(200).json({ data: myPlayers });
});

/** playerName을 받아와야할거 같은데
 선수 판매 **/
router.delete('/roster/:playerName', /*미들웨어*/ async (req, res) => {

    const accountId = 1;
    // const { accountId } = req.user; 검증미들웨어 구현예정

    const isPlayerExists = await prisma.roster.findMany({
        where: {
            accountId: +accountId,
            playerName: req.params.playerName,
        },
    });

    if(isPlayerExists.length === 0) {
        return res.status(404).json({ message: '해당 선수를 보유하고 있지 않습니다.' });
    }


    await prisma.roster.delete({
        where: {
            accountId: +accountId,
            playerName: req.params.playerName,
        },
    });

    return res.status(200).json({
        message: '삭제 성공!',
        '남은 동명 선수 수량': isPlayerExists.length - 1,
    });
})

export default router;