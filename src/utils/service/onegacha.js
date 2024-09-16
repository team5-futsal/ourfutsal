import { prisma } from '../prisma/index.js';

// 가차를 돌리자

export default async function (req, res, gachaTry) {
    // const { accountId } = req.user;
    const accountId = 3;

    const gachaPrice = gachaTry * 1000;

    // // 돈 계산 나중에
    // if (req.user.cach < gachaPrice) {
    //     throw new Error('notEnoughMoney');
    // }

    // await prisma.account.update({
    //     data: {
    //         cash: req.user.cash - gachaPrice,
    //     },
    //     where: {
    //         accountId: +accountId,
    //     },
    // });

    // 전체 선수 대상 = 전체 선수 중 가장 높은 Id 찾기
    const findMaximumPlayerId = await prisma.player.findFirst({
        orderBy: {
            playerId: 'desc',
        },
    });

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

    // // 선수 이름 찾아오기
    // const findName = await prisma.player.findFirst({
    //     where: {
    //         playerId: randomPlayer,
    //     },
    // });

    return manyPlayer(accountId, gachaTry);
}
