import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/** 팀 편성 추가 **/
//rosterId를 받도록 수정
router.put('/team/add/', authMiddleware, async (req, res, next) => {
    const { rosterId } = req.body;
    const { accountId } = req.user;

    // 현재 팀에 편성된 선수 몇명인지 검색
    const findTeamCount = await prisma.roster.findMany({
        where: {
            accountId: +accountId,
            isPicked: true,
        },
    });

    if (findTeamCount.length >= 3) {
        return res.status(409).json({ message: ' 이미 3명이 편성되었습니다. ' });
    }

    // 해당 선수 검색
    const findThisPlayer = await prisma.roster.findFirst({
        where: {
            rosterId: +rosterId,
        },
        include: {
            player: true,
        },
    });

    if (!findThisPlayer) {
        return res.status(409).json({ message: ' 보유하고 있지 않은 선수입니다. ' });
    }

    // 중복 선수 검색
    const findSameId = await prisma.roster.findFirst({
        where: {
            accountId: +accountId,
            playerId: findThisPlayer.playerId,
            isPicked: true,
        },
    });

    if (findSameId) {
        return res.status(409).json({ message: ' 동일한 선수는 편성할 수 없습니다. ' });
    }

    await prisma.roster.update({
        data: {
            isPicked: true,
        },
        where: {
            rosterId: +rosterId,
        },
    });

    return res.status(200).json({ data: findThisPlayer });
});

/** 팀 편성 제외 **/
// JWT 필요
router.put('/team/exclude', authMiddleware, async (req, res, next) => {
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
        return res.status(404).json({ message: ' 팀에 편성중인 선수가 아닙니다. ' });
    }

    //이름 찾아오기
    const findName = await prisma.player.findFirst({
        where: {
            playerId: +playerId,
        },
    });

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
    return res
        .status(200)
        .json({ message: ` ${findName.playerName}+${findTeam.enhanceCount}  선수가 편성에서 제외됐습니다. ` });
});

/** 팀 편성 비우기 **/
// JWT 필요
router.put('/team/empty', authMiddleware, async (req, res, next) => {
    const { accountId } = req.user;

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

    if (findTeam.length === 0) {
        return res.status(404).json({ message: ' 팀에 편성중인 선수가 없습니다. ' });
    }

    return res.status(200).json({ message: ` 모든 선수가 편성 해제되었습니다. ` });
});

/** 다른 유저의 팀 편성 조회**/
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
            enhanceCount: true,
            player: {
                select: {
                    playerName: true,
                    playerStrength: true,
                    playerDefense: true,
                    playerStamina: true,
                },
            },
        },
    });

    if (findTeam.length === 0) {
        return res.status(404).json({ message: ' 해당 유저는 편성중인 선수가 없습니다. ' });
    }

    //강화 테이블 조회
    const findEnhance = await prisma.enhances.findFirst({
        where: {
            enhanceId: 1,
        },
    });

    // 강화수치 적용 예시
    const result = findTeam.map(extract => ({
        playerId: extract.playerId,
        playerName: extract.player.playerName + ` +${extract.enhanceCount}`,
        enhanceCount: extract.enhanceCount,
        playerStrength: extract.player.playerStrength + `+${findEnhance.increaseValue * extract.enhanceCount}`,
        playerDefense: extract.player.playerDefense + `+${findEnhance.increaseValue * extract.enhanceCount}`,
        playerStamina: extract.player.playerStamina + `+${findEnhance.increaseValue * extract.enhanceCount}`,
    }));
    // 뭘 전달해야할까
    return res.status(200).json(result);
});

/** 자신의 편성 조회 **/
// JWT 필요
router.get('/team/myfind', authMiddleware, async (req, res, next) => {
    const { accountId } = req.user;

    const findTeam = await prisma.roster.findMany({
        where: {
            accountId: +accountId,
            isPicked: true,
        },
        select: {
            playerId: true,
            enhanceCount: true,
            player: {
                select: {
                    playerName: true,
                    playerStrength: true,
                    playerDefense: true,
                    playerStamina: true,
                },
            },
        },
    });

    if (findTeam.length === 0) {
        return res.status(404).json({ message: ' 편성중인 선수가 없습니다.' });
    }

    //강화 테이블 조회
    const findEnhance = await prisma.enhances.findFirst({
        where: {
            enhanceId: 1,
        },
    });

    // 강화수치 적용 예시
    const result = findTeam.map(extract => ({
        playerId: extract.playerId,
        playerName: extract.player.playerName + ` +${extract.enhanceCount}`,
        enhanceCount: extract.enhanceCount,
        playerStrength: extract.player.playerStrength + `+${findEnhance.increaseValue * extract.enhanceCount}`,
        playerDefense: extract.player.playerDefense + `+${findEnhance.increaseValue * extract.enhanceCount}`,
        playerStamina: extract.player.playerStamina + `+${findEnhance.increaseValue * extract.enhanceCount}`,
    }));

    return res.status(200).json(result);
});

// 교체 선수 계획-- 추후 상의 //

export default router;
