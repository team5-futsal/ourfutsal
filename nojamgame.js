import { prisma } from './src/utils/prisma/index.js';

// 노잼게임 초안의 초안

// 로드 게임
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
SELECT SUM(playerStrength+playerDefense+playerStamina+(enhanceCount*${enhanceValue.increaseValue})) as pp
FROM roster as rs inner join  player as pl on rs.playerId = pl.playerId  
where rs.accountId = ${pp} and rs.isPicked = 1;
`;

    const opponentPower = await prisma.$queryRaw`
SELECT SUM(playerStrength+playerDefense+playerStamina+(enhanceCount*10)) as op
FROM roster as rs inner join  player as pl on rs.playerId = pl.playerId  
where rs.accountId = ${op} and rs.isPicked = 1
`;

    const playerTotal = +playerPower[0].pp;
    const opponentTotal = +opponentPower[0].op;

    console.log(playerTotal);
    console.log(opponentTotal);

    const roulette = Math.random() * (playerTotal + opponentTotal);
    console.log(roulette);

    if (roulette < playerTotal) {
        return ` 승리했습니다....내 전투력 :${playerTotal} 상대 전투력 :${opponentTotal}`;
    } else {
        return ` 패배했습니다 !! 내 전투력 :${playerTotal} 상대 전투력 :${opponentTotal}`;
    }
}
