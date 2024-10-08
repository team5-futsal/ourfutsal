import express from 'express';
import AuthMiddleware from '../middlewares/auth.middleware.js';
import { prisma } from '../utils/prisma/index.js';
import { Prisma } from '@prisma/client';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/** 보유 선수 조회 **/
// 강화수치가 같은 중복 선수는 그룹화 후 카운트
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
      GROUP BY  roster.isPicked , roster.playerId, roster.enhanceCount
      ORDER BY  roster.isPicked DESC, roster.playerId ASC, roster.enhanceCount DESC;

    `;

    if (countPlayer.length === 0) {
        return res.status(404).json({ message: '보유한 선수가 없습니다.' });
    }

    const findEnhance = await prisma.enhances.findMany({
        select: {
            increaseValue: true,
        },
    });

    const result = countPlayer.map(asc => ({
        playerQuantity: parseInt(asc.playerQuantity),
        rosterId: asc.rosterId,
        playerId: asc.playerId,
        playerName: asc.playerName + ` +${asc.enhanceCount}`,
        isPicked: Boolean(asc.isPicked),
        playerStrength: asc.playerStrength + ` +(${findEnhance[asc.enhanceCount].increaseValue})`,
        playerDefense: asc.playerDefense + ` +(${findEnhance[asc.enhanceCount].increaseValue})`,
        playerStamina: asc.playerStamina + ` +(${findEnhance[asc.enhanceCount].increaseValue})`,
    }));

    return res.status(200).json({ data: result });
});

/** 선수 판매 **/
router.delete('/roster/sell', authMiddleware, async (req, res) => {
    try {
        const { accountId } = req.user;
        const { rosterId } = req.body;

        const rosterFind = await prisma.roster.findFirst({
            where: {
                rosterId: +rosterId,
                accountId: +accountId,
            },
            select: {
                isPicked: true,
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

        const [deletePlayer, getCash] = await prisma.$transaction(
            async tx => {
                const deletePlayer = await tx.roster.delete({
                    where: {
                        rosterId: +rosterId,
                    },
                });

                const getCash = await tx.account.update({
                    data: {
                        cash: req.user.cash + 300,
                    },
                    where: {
                        accountId: +accountId,
                    },
                });
                return [deletePlayer, getCash];
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            },
        );
        return res.status(201).json({
            message: `${rosterFind.player.playerName} 선수를 300Cash에 판매했습니다. 소지금 : ${getCash.cash}`,
        });
    } catch (error) {
        return res.status(409).json({ message: error.message });
    }
});

// 선수 강화 API 작동가능
// 시간이 촉박하여 최적화가 미흡합니다.
router.put('/roster/enhance', authMiddleware, async (req, res, next) => {
    const { rosterId } = req.body;
    const { accountId } = req.user;

    try {
        const findPlayer = await prisma.roster.findFirst({
            where: {
                rosterId: +rosterId,
                accountId: +accountId,
            },
            orderBy: {
                rosterId: 'asc',
            },
            include: {
                player: {
                    select: {
                        playerName: true,
                    },
                },
            },
        });

        if (!findPlayer) {
            return res.status(404).json({ message: ' 보유중인 선수가 아닙니다. ' });
        }

        if (findPlayer.enhanceCount >= 5) {
            return res.status(404).json({ message: ' 더 이상 강화할 수 없습니다. ' });
        }

        const enhanceTry = await prisma.enhances.findFirst({
            where: { enhanceId: findPlayer.enhanceCount + 2 },
        });

        const enhanceCost = 1000 * (findPlayer.enhanceCount + 1);

        if (req.user.cash < enhanceCost) {
            return res.status(409).json({ message: ` Cash 가 부족합니다. 강화비용 : ${enhanceCost} ` });
        }

        // 재료 선정
        const findMaterials = await prisma.roster.findMany({
            where: {
                accountId: +accountId,
                playerId: +findPlayer.playerId,
                isPicked: false,
                enhanceCount: findPlayer.enhanceCount,
                NOT: {
                    rosterId: +rosterId,
                },
            },
            orderBy: {
                rosterId: 'asc',
            },
        });

        //대상카드1장, 재료2장 필요
        if (findMaterials.length < 2) {
            return res.status(409).json({ message: ' 강화 재료가 부족합니다. (동일 강화, 동일 선수 2장 소모) ' });
        }

        const randomGoGo = Math.floor(Math.random() * 100 + 1);
        const result = await prisma.$transaction(
            async tx => {
                const payCash = await tx.account.update({
                    data: {
                        cash: req.user.cash - enhanceCost,
                    },
                    where: {
                        accountId: +accountId,
                    },
                });

                await tx.roster.deleteMany({
                    where: {
                        rosterId: {
                            in: [findMaterials[0].rosterId, findMaterials[1].rosterId],
                        },
                    },
                });

                if (randomGoGo < enhanceTry.successRate) {
                    const goEnhance = await tx.roster.update({
                        data: {
                            enhanceCount: findPlayer.enhanceCount + 1,
                        },
                        where: {
                            rosterId: findPlayer.rosterId,
                        },
                    });
                    return res.status(201).json({
                        message: ` + ${goEnhance.enhanceCount} ${findPlayer.player.playerName}으로 강화 성공 !! 잔돈${payCash.cash} `,
                    });
                } else {
                    return res.status(201).json({ message: `강화 실패 ! ` });
                }
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            },
        );

        return result;
    } catch (error) {
        return res.status(409).json({ message: error.message });
    }
});

export default router;
