import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

/** 팀 편성 추가 **/
// JWT 필요
router.put('/team/add/', async (req, res, next) => {
    const { playerId } = req.body;
    // const { accountId } = req.user; 검증미들웨어 구현예정
    const accountId = 1;

    // 현재 팀에 편성된 선수 몇명인지 검색
    const findTeamCount = await prisma.roster.findMany({
        where: {
            playerId: +playerId,
            accountId: +accountId,
            isPicked: true,
        },
    });

    if (findTeamCount.length >= 3) {
        return res.status(409).json({ message: ' 이미 3명이 편성되었습니다. ' });
    }

    // 보유중인 해당 선수 검색
    // 중복 선수를 보유중일때, 우선 rosterId 가 낮은것이 선택되는 상태
    const findPlayer = await prisma.roster.findFirst({
        where: {
            playerId: +playerId,
            accountId: +accountId,
            isPicked: false,
        },
    });

    if (!findPlayer) {
        return res.status(409).json({ message: ' 보유하고 있지 않은 선수입니다.' });
    }

    await prisma.roster.update({
        data: {
            isPicked: true,
        },
        where: {
            rosterId: findPlayer.rosterId,
            playerId: +playerId,
            accountId: +accountId,
            isPicked: false,
        },
    });

    return res.status(200).json({ message: ` ??? 선수가 편성되었습니다.` });
});

/** 팀 편성 제외 **/
// JWT 필요
router.put('/team/exclude', async (req, res, next) => {
    const { playerId } = req.body;
    // const { accountId } = req.user; 검증미들웨어 구현예정
    const accountId = 1;

    // 편성된 선수 검색
    const findTeam = await prisma.roster.findFirst({
        where: {
            playerId: +playerId,
            accountId: +accountId,
            isPicked: true,
        },
    });

    if (!findTeam) {
        return res.status(404).json({ message: ' 팀에 편성중인 선수가 아닙니다. ' });
    }

    await prisma.roster.update({
        data: {
            isPicked: false,
        },
        where: {
            rosterId: findTeam.rosterId,
            playerId: +playerId,
            accountId: +accountId,
            isPicked: true,
        },
    });
    return res.status(200).json({ message: ` ??? 선수가 편성에서 제외됐습니다. ` });
});

/** 팀 편성 비우기 **/
// JWT 필요
router.put('/team/empty', async (req, res, next) => {
    // const { accountId } = req.user; 검증미들웨어 구현예정
    const accountId = 1;

    const findTeam = await prisma.roster.findMany({
        where: {
            accountId: +accountId,
            isPicked: true,
        },
    });

    await prisma.roster.updateMany({
        data: {
            isPicked: false,
        },
        where: {
            rosterId: findTeam.rosterId,
            isPicked: true,
        },
    });

    if (!findTeam[0]) {
        return res.status(404).json({ message: ' 팀에 편성중인 선수가 없습니다. ' });
    }

    return res.status(200).json({ message: ` 모든 선수가 편성 해제되었습니다. ` });
});

/** 팀 편성 조회**/
// JWT 필요없음
router.get('/team/find/:accountId', async (req, res, next) => {
    const { accountId } = req.params;

    if (!accountId) {
        return res.status(404).json({ message: ' 존재하지 않는 유저 입니다. ' });
    }
    const findTeam = await prisma.roster.findMany({
        where: {
            accountId: +accountId,
            isPicked: true,
        },
        select: {
            playerId: true,
            player: {
                select: {
                    playerName: true,
                    playerStrength: true,
                    PlayerDefense: true,
                    playerStamina: true,
                },
            },
        },
    });

    const result = findTeam.map(extract => ({
        playerId: extract.playerId,
        playerName: extract.player.playerName,
        playerStrength: extract.player.playerStrength,
        PlayerDefense: extract.player.PlayerDefense,
        playerStamina: extract.player.playerStamina,
    }));

    if (!findTeam) {
        return res.status(404).json({ message: ' 해당 유저는 편성중인 선수가 없습니다. ' });
    }

    // 추후 전달 메세지 가공 (사실 잘 모름)
    return res.status(200).json(result);
});

// 교체 선수 계획-- 추후 상의 //

export default router;
