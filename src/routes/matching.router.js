import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import nojam from '../utils/service/nojamgame.js';
import { calculateElo } from '../utils/elo/eloCalculator.js';
import { Prisma } from '@prisma/client';

const router = express.Router();

/** 랭킹 조회 API **/
router.get('/rank', async (req, res, next) => {
    try {
        // 유저 정보 조회
        const sortedMMR = await prisma.account.findMany({
            take: 5,
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
            // gamas:판수, wins: 이긴 횟수 -> 판수가 0일 경우 승률:0
            accountInfo['winRate'] = games ? Math.floor(wins / games, 2) : 0;
        }

        return res.status(200).json({ data: sortedMMR, message: '랭크 조회 성공' });
    } catch (error) {
        next(error);
    }
});

/** 사용자 게임 가능 확인 API **/
router.post('/match/custom', authMiddleware, async (req, res, next) => {
    try {
        const myUserInfo = req.user;
        const { accountId } = req.body;

        if (!+accountId) {
            return res.status(404).json({ errorMessage: '유저를 선택해주세요.' });
        }

        if (myUserInfo.accountId === +accountId)
            return res.status(412).json({ errorMessage: '자신은 입력할 수 없습니다.' });

        const myActivePlayers = await prisma.roster.count({
            where: {
                accountId: myUserInfo.accountId,
                isPicked: true, // 출전하는 경우
            },
        });
        // 선출 3명보다 적으면 안됨.
        if (myActivePlayers < 3) {
            return res.status(412).json({ errorMessage: '선출 인원이 부족합니다.' });
        }

        // 유저 정보 조회
        const isExistUser = await prisma.account.findFirst({
            where: {
                accountId: +accountId,
            },
            select: {
                accountId: true,
                userId: true,
                mmr: true,
            },
        });
        if (!isExistUser) {
            return res.status(404).json({ errorMessage: '유저 정보가 없습니다.' });
        }

        const activePlayers = await prisma.roster.count({
            where: {
                accountId: +isExistUser.accountId,
                isPicked: true, // 출전하는 경우
            },
        });
        if (activePlayers < 3) {
            return res.status(412).json({ errorMessage: '상대 유저의 선출 인원이 부족합니다.' });
        }

        // const matchResult = await nojam(myUserInfo.accountId, +userId);

        return res.status(200).json({ user: isExistUser /*message: matchResult*/ });
    } catch (error) {
        next(error);
    }
});

// 사용자게임 매칭 성공 이후 이 미들웨어를 실행시켜서 각 유저의 팀 정보에 대한 것을 가져올 예정
// 가져올 데이터는 최대한 join 하여 게임에 필요한 모든 데이터가 나올수 있게 한다.
router.post('/match/game', authMiddleware, async (req, res, next) => {
    try {
        const { targetAccountId } = req.body;
        const myAccountId = req.user.accountId;

        const enhanceInfo = await prisma.$queryRaw`
            select increaseValue
            from enhances`;

        const entrySearch = await prisma.$queryRaw`
            SELECT a.accountId, rosterId, r.playerId, p.positionId, enhanceCount, playerName, playerStrength, playerDefense, playerStamina
            FROM account a
            inner join roster r on a.accountId=r.accountId
            inner join player p on r.playerId=p.playerId
            where  r.isPicked=1 and (a.accountId=${myAccountId} or a.accountId = ${targetAccountId})
            order by field(a.accountId, ${myAccountId}) desc, p.playerStrength asc
            `;

        const player1 = [];
        const player2 = [];

        entrySearch.map((extract, index) => {
            const jsonData = {
                playerId: extract.playerId,
                playerName: extract.playerName,
                positionId: extract.positionId,
                playerStrength: extract.playerStrength + enhanceInfo[extract.enhanceCount].increaseValue,
                playerDefense: extract.playerDefense + enhanceInfo[extract.enhanceCount].increaseValue,
                playerStamina: extract.playerStamina + enhanceInfo[extract.enhanceCount].increaseValue,
            };
            if (index > 2) {
                player1.push(jsonData);
            } else {
                player2.push(jsonData);
            }
        });

        return res.status(200).json({
            player1,
            player2,
            matchUsers: {
                authUserId: +myAccountId,
                targetUserId: +targetAccountId,
            },
        });
    } catch {
        return res.status(404).json({ errorMessage: '참가 유저데이터를 불러오는 중 오류가 발생했습니다.' });
    }
});

/** 경쟁전 매칭 API **/
router.get('/match/rank', authMiddleware, async (req, res, next) => {
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
        let nearestMMRUser = await prisma.$queryRaw`
        SELECT a.accountId, userId, mmr
        FROM account a
        inner join roster r on a.accountId=r.accountId
        where mmr <= (select mmr
        from account
        where accountId = ${myUserInfo.accountId}) and
        a.accountId <> ${myUserInfo.accountId}
        group by accountId, isPicked
        having sum(isPicked)>=3
        ORDER BY mmr desc
        LIMIT 1
        `;

        // 나보다 낮은 유저가 없는 경우 위에 있는 유저 탐색
        // 원래는 MMR 구간별 DB가 따로 있어야 함..
        if (!nearestMMRUser) {
            nearestMMRUser = await prisma.$queryRaw`
            SELECT a.accountId, userId, mmr
            FROM account a
            inner join roster r on a.accountId=r.accountId
            where mmr >= (select mmr
            from account
            where accountId = ${myUserInfo.accountId}) and
            a.accountId <> ${myUserInfo.accountId}
            group by accountId, isPicked
            having sum(isPicked)>=3
            ORDER BY mmr asc
            LIMIT 1
            `;
        }
        console.log(nearestMMRUser);

        if(nearestMMRUser.length <= 0) {
            return res.status(404).json({ errorMessage: '적합한 유저가 존재하지 않습니다.' });
        }
        return res.status(200).json({ nearestMMRUser, message: '매칭 성공' });
    } catch (error) {
        next(error);
    }
});

// mmr 계산 api
router.put('/match', authMiddleware, async (req, res, next) => {
    try {
        const myUserInfo = req.user;
        // 요청 본문에서 데이터를 가져옴 (플레이어 A와 B의 레이팅, 경기 결과)
        const { opponentId, outcome } = req.body;

        const opponentUser = await prisma.account.findUnique({
            where: { accountId: +opponentId },
        });

        // K값 설정 (경기의 중요도에 따라 조정 가능)
        const K = 40;

        // ELO 계산
        const { updatedRa, updatedRb } = calculateElo(myUserInfo.mmr, opponentUser.mmr, K, outcome);

        await prisma.$transaction(
            async tx => {
                await tx.account.update({
                    data: {
                        mmr: updatedRb,
                    },
                    where: { accountId: +myUserInfo.accountId },
                });

                await tx.account.update({
                    data: {
                        mmr: updatedRa,
                    },
                    where: { accountId: +opponentId },
                });
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
            },
        );

        // 새로운 레이팅 값을 DB에 저장하거나 필요한 처리를 추가
        // 예시로는 응답으로 반환
        return res.status(200).json({
            message: 'ELO ratings updated successfully',
            player1Mmr: updatedRb,
            player2Mmr: updatedRa,
        });
    } catch (error) {
        next(error); // 에러 핸들링
    }
});

export default router;
