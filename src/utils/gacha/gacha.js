import { prisma } from '../prisma/index.js';

export default async function (accountId, gachaQuantity) {
    const playerCount = await prisma.player.count();
    const allPlayersId = [];
    const pickedPlayer = [];

    // 플레이어DB에서 모두 검색 및 릴레이션 데이터까지 추출
    const findPlayers = await prisma.player.findMany({
        include: true,
    });

    // 모든 플레이어의 playerId 추출
    for (let i in findPlayers) {
        allPlayersId.push(findPlayers[i].playerId);
    }

    for (let i = 0; i < gachaQuantity; i++) {
        const randomPlayers = Math.floor(Math.random() * allPlayersId.length) + 1;
        pickedPlayer.push({
            playerId: allPlayersId[randomPlayers],
            accountId : +accountId
        });
        console.log('randomPlayers는: ', randomPlayers);
    }


    return pickedPlayer;
}
