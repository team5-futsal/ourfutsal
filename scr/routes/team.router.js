import express from 'express';
import { prisma } from '../utils/prisma/index.js';

const router = express.Router();

/** 팀 편성 추가 **/
// JWT 필요
router.put('/team/add/', async (req, res, next) => {
    const { playerId } = req.body;
    const { accountId } = req.user;

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
    const { accountId } = req.user;

    // 편성된 선수 검색
    const findTeam = await prisma.roster.findFirst({
        where: {
            playerId: +playerId,
            accountId: +accountId,
            isPicked: true,
        },
    });

    if (!findTeam) {
        return res.status(409).json({ message: ' 팀에 편성중인 선수가 아닙니다. ' });
    }

    await prisma.roster.update({
        data: {
            isPicked: false,
        },
        where: {
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
    const { userId } = req.user;

    const findTeam = await prisma.roster.update({
        data: {
            isPicked: false,
        },
        where: {
            userId: +userId,
            isPicked: true,
        },
    });

    if (!findTeam) {
        return res.status(404).json({ message: ' 팀에 편성중인 선수가 없습니다. ' });
    }

    return res.status(200).json({ message: ` 모든 선수가 편성 해제되었습니다. ` });
});

/** 팀 편성 조회**/
// JWT 필요없음
router.get('/team/find/:userId', async (req, res, next) => {
    const { userId } = req.params;

    const findTeam = await prisma.roster.findMany({
        where: {
            userId: +userId,
            isPicked: true,
        },
        select: {
            playerId: true,
            positionId: true,
            player: {
                select: {
                    playerName: true,
                },
            },
        },
    });

    //?????????
    // const result = findTeam.map(value => ({
    //     playerId: value.playerId,
    //     playerName: value.player.playerName,
    // }));

    if (!findTeam) {
        return res.status(404).json({ message: ' 해당 유저는 편성중인 선수가 없습니다. ' });
    }

    // 추후 전달 메세지 가공 (사실 모름)
    return res.status(200).json({ message: findTeam });
});

// 교체 선수 계획-- 추후 상의 //

export default router;
