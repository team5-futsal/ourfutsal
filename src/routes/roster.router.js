import express from 'express';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/** 보유 선수 조회 **/
// 강화수치가 같은 중복 선수는 거름!!!!
router.get('/roster', authMiddleware, async (req, res) => {
    const { accountId } = req.user;

    const myPlayers = await prisma.roster.findMany({
        where: {
            accountId: +accountId,
        },
        include: {
            player: true,
        },
        distinct: ['playerId', 'enhanceCount'],
    });

    if (myPlayers.length === 0) {
        return res.status(404).json({ message: '보유한 선수가 없습니다.' });
    }

    return res.status(200).json({ data: myPlayers });
});

/** playerName을 받아와야할거 같은데
 선수 판매 **/
router.delete('/roster/sell', authMiddleware, async (req, res) => {
    const { accountId } = req.user;
    const { rosterId } = req.body;

    const rosterFind = await prisma.roster.findFirst({
        where: {
            rosterId: +rosterId,
            accountId: +accountId,
        },
    });

    if (!rosterFind) {
        return res.status(404).json({ message: ' 보유하고 있지 않은 선수입니다. ' });
    }

    console.log(isPlayerExists);

    await prisma.roster.delete({
        where: {
            rosterId: +rosterId,
        },
    });

    return res.status(200).json({
        message: '삭제 성공!',
        '남은 동명 선수 수량': isPlayerExists.length - 1,
    });
});

export default router;
