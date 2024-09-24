// ELO 계산을 위한 함수
export function probability(rating1, rating2) {
    return 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
}

export function calculateElo(Ra, Rb, K, outcome) {
    let Pb = probability(Ra, Rb);
    let Pa = probability(Rb, Ra);

    Ra = Ra + K * (outcome - Pa);
    Rb = Rb + K * ((1 - outcome) - Pb);

    return { updatedRa: Ra, updatedRb: Rb };
}
