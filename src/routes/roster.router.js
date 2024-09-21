import express from 'express';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/** 보유 선수 조회 **/
// 강화수치가 같은 중복 선수는 거름!!
router.get('/roster', authMiddleware, async (req, res) => {
    const { accountId } = req.user;

    // 각 중복선수 카운트
    const countPlayer = await prisma.$queryRaw`
      SELECT
        roster.rosterId,
        roster.playerId,
        roster.isPicked,
        roster.enhanceCount,
        player.positionId,
        player.playerName,
        player.playerStrength,
        player.playerDefense,
        player.playerStamina,
        COUNT(*) as playerQuantity
      FROM roster
      JOIN player ON roster.playerId = player.playerId
      WHERE roster.accountId = ${+accountId}
      GROUP BY roster.playerId, roster.enhanceCount
      ORDER BY roster.playerId ASC, roster.enhanceCount ASC, roster.isPicked ASC;
    `;

    if (countPlayer.length === 0) {
        return res.status(404).json({ message: '보유한 선수가 없습니다.' });
    }

    const result = countPlayer.map(asc => ({
        playerQuantity: parseInt(asc.playerQuantity),
        rosterId: asc.rosterId,
        playerId: asc.playerId,
        playerName: asc.playerName,
        isPicked: Boolean(asc.isPicked),
        enhanceCount: asc.enhanceCount,
        playerStrength: asc.playerStrength,
        playerDefense: asc.playerDefense,
        playerStamina: asc.playerStamina,
    }));
    console.log(result);

    return res.status(200).json({ data: result });
});

/** 선수 판매 **/
router.delete('/roster/sell', authMiddleware, async (req, res) => {
    const { accountId } = req.user;
    const { rosterId } = req.body;

    const rosterFind = await prisma.roster.findFirst({
        where: {
            rosterId: +rosterId,
            accountId: +accountId,
        },
        select: {
            player: {
                select: {
                    playerName: true,
                },
            },
        },
    });

    if (!rosterFind) {
        return res.status(404).json({ message: ' 보유하고 있지 않은 선수입니다. ' });
    }

    if (rosterFind.isPicked === true) {
        return res.status(409).json({ message: ' 편성중인 선수는 판매할 수 없습니다. ' });
    }

    await prisma.roster.delete({
        where: {
            rosterId: +rosterId,
        },
    });

    const getCash = await prisma.account.update({
        data: {
            cash: req.user.cash + 300,
        },
        where: {
            accountId: +accountId,
        },
    });

    return res.status(201).json({
        message: `${rosterFind.player.playerName} 선수를 300Cash에 판매했습니다. 소지금 : ${getCash.cash}`,
    });
});

export default router;
