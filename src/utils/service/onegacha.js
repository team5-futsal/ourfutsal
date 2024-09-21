import { prisma } from '../prisma/index.js';

// 가차를 돌리자

export default async function (gachaTry, accountId) {
    const allPlayers = [];
    const answer = [];

    // 선수 목록 조회
    const players = await prisma.player.findMany({
        include: true,
    });

    for (let i in players) {
        allPlayers.push(players[i].playerId);
    }

    console.log(allPlayers);

    for (let i = 0; i < gachaTry; i++) {
        let randomPlayer = Math.floor(Math.random() * allPlayers.length - 1) + 1;
        answer.push({
            playerId: allPlayers[randomPlayer],
            accountId: +accountId,
        });
    }
    console.log(answer);
    return answer;
}
