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
    const { playerName } = req.body;

    const playerId = await prisma.player.findFirst({
        where: {
            playerName: playerName,
        },
    });

    if (!playerId) {
        return res.status(404).json({ message: ' 존재하지 않는 선수 입니다' });
    }

    const isPlayerExists = await prisma.roster.findMany({
        where: {
            accountId: +accountId,
            playerId: +playerId.playerId,
        },
    });

    console.log(isPlayerExists);

    if (isPlayerExists.length === 0) {
        return res.status(404).json({ message: '해당 선수를 보유하고 있지 않습니다.' });
    }

    await prisma.roster.delete({
        where: {
            accountId: +accountId,
            playerId: +playerId.playerId,
            rosterId: isPlayerExists[isPlayerExists.length - 1].rosterId,
        },
    });

    return res.status(200).json({
        message: '삭제 성공!',
        '남은 동명 선수 수량': isPlayerExists.length - 1,
    });
});

export default router;
