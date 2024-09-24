import { prisma } from '../../../src/utils/prisma/index.js';

// 일반게임- 사용자 설정 게임

// 로드
export default async function (pp, op) {
    const playerId = pp;
    const opponentPlayerId = op;

    const playerEntry = await prisma.roster.findMany({
        where: {
            accountId: playerId,
            isPicked: true,
        },
        include: {
            player: true,
        },
    });

    const opponentEntry = await prisma.roster.findMany({
        where: {
            accountId: opponentPlayerId,
            isPicked: true,
        },

        include: {
            player: {
                include: true,
            },
        },
    });

    const enhanceValue = await prisma.enhances.findFirst({
        where: {
            enhanceId: 1,
        },
    });

    const playerPower = await prisma.$queryRaw`
SELECT SUM(playerStrength+playerDefense+playerStamina+(enhanceCount*${enhanceValue.increaseValue})) as playerSum
FROM roster as rs inner join  player as pl on rs.playerId = pl.playerId  
where rs.accountId = ${pp} and rs.isPicked = 1;
`;

    const opponentPower = await prisma.$queryRaw`
SELECT SUM(playerStrength+playerDefense+playerStamina+(enhanceCount*${enhanceValue.increaseValue})) as opponentSum
FROM roster as rs inner join  player as pl on rs.playerId = pl.playerId  
where rs.accountId = ${op} and rs.isPicked = 1
`;

    const playerTotal = +playerPower[0].playerSum;
    const opponentTotal = +opponentPower[0].opponentSum;

    console.log(playerTotal);
    console.log(opponentTotal);

    // 경기 결과
    const roulette = Math.random() * (playerTotal + opponentTotal);
    console.log(roulette);

    if (roulette < playerTotal) {
        return ` 승리했습니다....내 전투력 :${playerTotal} 상대 전투력 :${opponentTotal}`;
    } else {
        return ` 패배했습니다 !! 내 전투력 :${playerTotal} 상대 전투력 :${opponentTotal}`;
    }
}
