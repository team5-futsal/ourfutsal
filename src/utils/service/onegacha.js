import { prisma } from '../prisma/index.js';

// 가차를 돌리자

export default async function (gachaTry, accountId) {
    const answer = [];

    // 선수 목록 조회
    const players = await prisma.player.findMany({
        select: {
            playerId: true,
            playerName: true,
        },
    });

    for (let i = 0; i < gachaTry; i++) {
        let randomPlayer = Math.floor(Math.random() * players.length - 1) + 1;
        answer.push({
            playerId: players[randomPlayer].playerId,
            playerName: players[randomPlayer].playerName,
            accountId: +accountId,
        });
    }

    return answer;
}
