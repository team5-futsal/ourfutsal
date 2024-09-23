//선수 정보 획득
class player {
    constructor(team, name, str, def, sp, position) {
        this.team = team;
        this.name = name;
        this.str = str;
        this.def = def;
        this.sp = sp;
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
    }
]

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
    }
]

//초기 선수 위치 설정
const player1 = new Array(3)
for(let i=0; i<3; i++){
    player1[i] = new player(
        1,
        player1Roster[i].playerName, 
        player1Roster[i].playerStrength.split('+').reduce((acc,cur)=>(+acc)+(+cur)), 
        player1Roster[i].PlayerDefense.split('+').reduce((acc,cur)=>(+acc)+(+cur)), 
        player1Roster[i].playerStamina.split('+').reduce((acc,cur)=>(+acc)+(+cur)),
        i*16
    )
}

const player2 = new Array(3)
for(let i=0; i<3; i++){
    player2[i] = new player(
        2,
        player2Roster[i].playerName, 
        player2Roster[i].playerStrength.split('+').reduce((acc,cur)=>(+acc)+(+cur)), 
        player2Roster[i].PlayerDefense.split('+').reduce((acc,cur)=>(+acc)+(+cur)), 
        player2Roster[i].playerStamina.split('+').reduce((acc,cur)=>(+acc)+(+cur)),
        100-i*16
    )
}


//코인 토스
//선수에게 공 지급
// Random utill
function Random(n) {
    return Math.floor(Math.random() * n)
}

if(Math.random() < 0.5){
    player1[2].hasBall = true;
    const startTeam = true;
} else {
    player2[2].hasBall = true;
    const startTeam = false;
}
const players = [...player1, ...player2]

//턴 진행
//공 소지자 찾기
let hostIndex = players.findIndex(p=>p.hasBall)
while(players[hostIndex].hasBall && false){
    players.forEach(p=>{
        p.distance = Math.abs(players[hostIndex].position - p.position)
    })
}

function shoot(host){
    let goalPosition = 100;
    if(host.team==2) goalPosition = 0;
    const goalDistance = 100-Math.abs(goalPosition - host.position)
    const goal = (goalDistance? goalDistance: 1)/100
    const def = defence(host)


    return Math.random()< goal*def ? true : false
}   

function pass(){

}

function dribble(){

}

function defence(host){
    const defenders = players.filter(p=>p.team != host.team).map((p,i)=> [p.distance,i])
    nearest = defenders.findIndex(d=> d == Math.min(...defenders))
}

//턴 끝
//후반전 반복
//승패 판정
//MMR 점수 지급