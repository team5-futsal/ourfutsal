//선수 정보 획득
class player {
    constructor(team, name, pNum, str, def, sp, position) {
        this.team = team;
        this.name = name;
        this.pNum = pNum; // playerNumber
        this.str = str;
        this.def = def;
        this.maxSp = sp;
        this.curSp = sp;
        this.position = position;
        this.hasBall = false;
        this.distance = 0;
    }
}

const player1Roster = [
    {
        "playerId": 4,
        "playerName": "ddd +2",
        "enhanceCount": 2,
        "playerStrength": "10+20",
        "PlayerDefense": "10+20",
        "playerStamina": "10+20"
    },
    {
        "playerId": 6,
        "playerName": "웨인루니 +1",
        "enhanceCount": 1,
        "playerStrength": "50+10",
        "PlayerDefense": "20+10",
        "playerStamina": "30+10"
    },
    {
        "playerId": 5,
        "playerName": "기성용 +1",
        "enhanceCount": 1,
        "playerStrength": "88+10",
        "PlayerDefense": "85+10",
        "playerStamina": "74+10"
    }]

const player2Roster = [
    {
        "playerId": 5,
        "playerName": "기성용 +0",
        "enhanceCount": 0,
        "playerStrength": "88+0",
        "PlayerDefense": "85+0",
        "playerStamina": "74+0"
    },
    {
        "playerId": 7,
        "playerName": "박지성 +0",
        "enhanceCount": 0,
        "playerStrength": "40+0",
        "PlayerDefense": "15+0",
        "playerStamina": "40+0"
    },
    {
        "playerId": 6,
        "playerName": "웨인루니 +0",
        "enhanceCount": 0,
        "playerStrength": "50+0",
        "PlayerDefense": "20+0",
        "playerStamina": "30+0"
    }]

//초기 선수 위치 설정
const player1 = new Array(3)
for (let i = 0; i < 3; i++) {
    player1[i] = new player(
        1,
        player1Roster[i].playerName,
        i,
        player1Roster[i].playerStrength.split('+').reduce((acc, cur) => (+acc) + (+cur)),
        player1Roster[i].PlayerDefense.split('+').reduce((acc, cur) => (+acc) + (+cur)),
        player1Roster[i].playerStamina.split('+').reduce((acc, cur) => (+acc) + (+cur)),
        i * 16
    )
}

const player2 = new Array(3)
for (let i = 0; i < 3; i++) {
    player2[i] = new player(
        2,
        player2Roster[i].playerName,
        i,
        player2Roster[i].playerStrength.split('+').reduce((acc, cur) => (+acc) + (+cur)),
        player2Roster[i].PlayerDefense.split('+').reduce((acc, cur) => (+acc) + (+cur)),
        player2Roster[i].playerStamina.split('+').reduce((acc, cur) => (+acc) + (+cur)),
        100 - i * 16
    )
}

//코인 토스
//선수에게 공 지급
// Random utill
function Random(n) {
    return Math.floor(Math.random() * n)
}

if (Math.random() < 0.5) {
    player1[2].hasBall = true;
    const startTeam = true;
} else {
    player2[2].hasBall = true;
    const startTeam = false;
}
const players = [...player1, ...player2]

//턴 진행
//공 소지자 찾기
const host = players.find(p => p.hasBall)

//공 소지자와의 각 플레이어들의 거리를 입력
players.forEach(p => {
    p.distance = Math.abs(host.position - p.position)
})

// 각 행동의 확률 계산
const choices = { shoot: shoot(host), pass: pass(host), dribble: dribble(host) }
const probs = []
const decide = {act:"shoot", prob:0}

// 가장 확률이 높은 행동을 선택
for (const [key, value] of Object.entries(choices)){
    if(decide.prob < value.prob){
        decide.act = key
        decide.prob = value.prob
    }
}

console.log(decide)


while (host.hasBall && false) {
    players.forEach(p => {
        p.distance = Math.abs(players[hostIndex].position - p.position)
    })
}

function shoot(host) {
    let goalPosition = 100;
    if (host.team == 2) goalPosition = 0;
    const goalDistance = 95 - Math.abs(goalPosition - host.position)
    const goal = (goalDistance <= 0 ? 0 : goalDistance / 100)
    const def = defence(host);
    const kickPower = host.str / 1000;

    return { prob: goal - def.prob + kickPower, host: host, defender: def.defender }
}

function pass(host) {
    const spConsume = 5

    const teamMembers = players.filter(p => p.team == host.team && p.name != host.name)
    const nearest = Math.min(...teamMembers.map(d => d.distance))
    const teamMember = teamMembers.find(d => d.distance <= nearest)

    if (teamMember.curSp < spConsume)
        return 0

    let passChance = 150 - teamMember.distance
    passChance = passChance <= 0 ? 0 : passChance / 100
    const def = defence(teamMember);

    return { prob: passChance - def.prob, host: teamMember, defebder: def.defender }
}

function dribble() {
    const spConsume = 10

    if (host.curSp < spConsume)
        return 0

    const def = defence(host);

    return { prob: 0.95 - def.prob, host: host, defebder: def.defender }
}

function defence(host) {
    const spConsume = 5

    const defenders = players.filter(p => p.team != host.team)
    const nearest = Math.min(...defenders.map(d => d.distance))
    const defender = defenders.find(d => d.distance <= nearest)

    if (defender.curSp < spConsume)
        return 0

    let defChance = 50 - defender.distance
    defChance = defChance <= 0 ? 0 : defChance / 100

    return { prob: defChance + defender.def / 1000, defender: defender }
}

const action = {
    shoot:{
        //스테미나 소모
        //공 이동
        //위치 이동
    },
    pass:{
    },
    dribble:{

    }
}
//턴 끝
//후반전 반복
//승패 판정
//MMR 점수 지급