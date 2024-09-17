import { prisma } from '../prisma/index.js';

// 가차를 돌리자

export default async function (req, res, gachaTry) {
    const { accountId } = req.user;

    const gachaPrice = gachaTry * 1000;

    // 선불 요금제
    if (req.user.cash < gachaPrice) {
        throw new Error('notEnoughMoney');
    }

    await prisma.account.update({
        data: {
            cash: req.user.cash - gachaPrice,
        },
        where: {
            accountId: +accountId,
        },
    });

    // 전체 선수 대상 = 전체 선수 중 가장 높은 Id 찾기
    const findMaximumPlayerId = await prisma.player.findFirst({
        orderBy: {
            playerId: 'desc',
        },
    });

    // create 를 반복문으로 돌렸습니다...
    const manyPlayer = async function aabb(accountId, gachaTry) {
        // 가차 선수 범위
        let answer = [];
        for (let i = 0; i < gachaTry; i++) {
            let randomPlayer = Math.round(Math.random() * (findMaximumPlayerId.playerId - 1)) + 1;

            // 랜덤 선수 획득
            const getGacha = await prisma.roster.create({
                data: {
                    playerId: randomPlayer,
                    accountId: +accountId,
                },
            });

            answer += randomPlayer;
        }
        return answer;
    };

    return manyPlayer(accountId, gachaTry);
}
