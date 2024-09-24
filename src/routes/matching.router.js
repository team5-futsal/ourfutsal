import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validSchema from '../utils/joi/valid.schema.js';
import errors from '../utils/errors/error.constructor.js';
import nojam from '../utils/service/nojamgame.js';

const router = express.Router();

/** 랭킹 조회 API **/
router.get('/rank', async (req, res, next) => {
    try {
        // 유저 정보 조회
        const sortedMMR = await prisma.account.findMany({
            select: {
                userId: true,
                accountId: true,
                mmr: true,
            },
            orderBy: {
                mmr: 'desc',
            },
        });

        if (!sortedMMR) {
            return res.status(404).json({ message: '유저 정보가 없습니다.' });
        }

        for (const accountInfo of sortedMMR) {
            const games = await prisma.results.count({
                where: {
                    accountId: +accountInfo.accountId,
                },
            });
            const wins = await prisma.results.count({
                where: {
                    accountId: +accountInfo.accountId,
                    result: 1,
                },
            });
            // 판수가 0일 경우 승률:0
            accountInfo['winRate'] = games ? Math.floor(wins / games, 2) : 0;
        }

        return res.status(200).json({ data: sortedMMR, message: '랭크 조회 성공' });
    } catch (error) {
        next(error);
    }
});

/** 사용자 게임 가능 확인 API **/
router.post('/custom', authMiddleware, async (req, res, next) => {
    try {
        const myUserInfo = req.user;
        const { userId } = req.body;

        if (myUserInfo.accountId === +userId) return res.status(412).json({ message: '자신은 입력할 수 없습니다.' });

        const myActivePlayers = await prisma.roster.count({
            where: {
                accountId: myUserInfo.accountId,
                isPicked: true, // 출전하는 경우
            },
        });
        // 선출 3명보다 적으면 안됨.
        if (myActivePlayers < 3) {
            return res.status(412).json({ message: '선출 인원이 부족합니다.' });
        }

        // 유저 정보 조회
        const isExistUser = await prisma.account.findFirst({
            where: {
                accountId: +userId,
            },
            select: {
                accountId: true,
                userId: true,
                mmr: true,
            },
        });
        if (!isExistUser) {
            return res.status(404).json({ message: '유저 정보가 없습니다.' });
        }

        const activePlayers = await prisma.roster.count({
            where: {
                accountId: +isExistUser.accountId,
                isPicked: true, // 출전하는 경우
            },
        });
        if (activePlayers < 3) {
            return res.status(412).json({ message: '상대 유저의 선출 인원이 부족합니다.' });
        }

        const matchResult = await nojam(myUserInfo.accountId, +userId);

        return res.status(200).json({ user: isExistUser, message: matchResult });
    } catch (error) {
        next(error);
    }
});

/** 경쟁전 매칭 API **/
router.get('/match', authMiddleware, async (req, res, next) => {
    try {
        const myUserInfo = req.user;

        // Roster 선출 명수 확인
        const myActivePlayers = await prisma.roster.count({
            where: {
                accountId: +myUserInfo.accountId,
                isPicked: true, // 출전하는 경우
            },
        });
        // 선출 3명보다 적으면 안됨.
        if (myActivePlayers < 3) {
            return res.status(412).json({ message: '선출 인원이 부족합니다.' });
        }

        const myInfo = await prisma.account.findFirst({
            where: { accountId: +myUserInfo.accountId },
            select: {
                mmr: true,
            },
        });

        // 가장 근접한 MMR 확인
        // 근접한 유저를 찾는데 많은 컴퓨팅 파워가 소모됨. 방법을 고려할 필요가 있음.

        // 나의 MMR과 다른 유저의 유클리드 거리를 계산
        const nearestMMR = await prisma.$queryRaw`SELECT abs(${myInfo.mmr} - mmr, 2) as distance, accountId, userId, mmr FROM account ORDER BY 1`;
      
        for (const user of nearestMMR) {
            const activePlayers = await prisma.roster.count({
                where: {
                    accountId: +user.accountId,
                    isPicked: true, // 출전하는 경우
                },
            });
            if (activePlayers < 3) {
                continue;
            }
            return res.status(200).json({ data: user, message: '매칭 성공' });
        }

        return res.status(404).json({ message: '적합한 유저가 존재하지 않습니다.' });
    } catch (error) {
        next(error);
    }
});

//mmr 정산 API

export default router;
