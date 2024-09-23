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
//init
const players = [...player1, ...player2]
const fieldSize = 100;
const score = [0,0];
const initPosion = players.map(p=>p.position)

const spConsume = {
    pass:5,
    dribble:10,
    defence:10
}

const defence = (host) => {
    const defenders = players.filter(p => p.team != host.team)
    const nearest = Math.min(...defenders.map(d => d.distance))
    const defender = defenders.find(d => d.distance <= nearest)

    if (defender.curSp < spConsume.defence)
        return { prob: 0, defender: false }

    let defChance = 70 - defender.distance
    defChance = defChance <= 0 ? 0 : defChance / 100

    return { prob: defChance + defender.def / 1000, defender: defender }
}

const shoot = (host) => {
    let goalPosition = 100;
    if (host.team == 2) goalPosition = 0;
    const goalDistance = 95 - Math.abs(goalPosition - host.position)
    const goal = (goalDistance <= 0 ? 0 : goalDistance / 100)
    const def = defence(host);
    const kickPower = host.str / 1000;

    return { prob: goal - def.prob + kickPower, host: host, defender: def.defender }
}

const pass = (host) => {
    const teamMembers = players.filter(p => p.team == host.team && p.name != host.name)
    const nearest = Math.min(...teamMembers.map(d => d.distance))
    const teamMember = teamMembers.find(d => d.distance <= nearest)

    if (teamMember.curSp < spConsume.pass)
        return { prob: 0, host: false, defebder: false }

    let passChance = 130 - teamMember.distance
    passChance = passChance <= 0 ? 0 : passChance / 100
    const def = defence(teamMember);

    return { prob: passChance - def.prob, host: host, teamMember: teamMember, defebder: def.defender }
}

const dribble = (host) => {
    if (host.curSp < spConsume.dribble)
        return { prob: 0, host: false, defebder: false }

    const def = defence(host);

    return { prob: 1 - def.prob, host: host, defebder: def.defender }
}

function lostBall(){
    players.forEach(p=> p.hasBall = false)
}

function positionReset(){
    players.forEach((p,i)=>p.position = initPosion[i])
}

function foward(host, long){
    const direction = host.team==1 ? 1 : -1
    host.position += long * direction
    // players.filter(p=>p.team == host.team).position += long * direction
}

const action = {
    shoot:(shoot)=>{
        if(shoot.host){
            shoot.host.curSp -= spConsume.shoot //스테미나 소모
        } 
        lostBall() // 공 초기화

        if(Math.random() < shoot.prob){ // 성공 판정
            score[shoot.host.team-1] += 1
            players.filter(p=> p.team != shoot.host.team)[0].hasBall = true
            console.log(`team${shoot.host.team} 득점 성공 score-${score[0]}:${score[1]}`)
        } else if(shoot.defender){
            console.log(`team${shoot.defender.team} ${shoot.defender.name} 수비 성공`)
            shoot.defender.curSp -= spConsume.defence
            shoot.defender.hasBall = true //공 이동
        } else 
            console.log(`team${shoot.host.team} 득점 실패 score-${score[0]}:${score[1]}`)
            players.filter(p=> p.team != shoot.host.team)[0].hasBall = true
    },
    pass:(pass)=>{
        lostBall()
        if(pass.teamMember)
            pass.teamMember.curSp -= spConsume.pass //스테미나 소모
        
        if(Math.random() < pass.prob){
            if(pass.teamMember){
                console.log(`team${pass.host.team} ${pass.host.name} 패스 성공`)
                pass.teamMember.hasBall = true
                foward(pass.teamMember, 10)
            } else {
                console.log(`team${pass.host.team} ${pass.host.name} 패스 실책`)
                players.filter(p=> p.team != pass.host.team)[0].hasBall = true
            } //스테미나가 부족해 실행 못한 경우'
        } else if(pass.defender){
            console.log(`team${pass.defender.team} ${pass.defender.name} 수비 성공`)
            pass.defender.curSp -= spConsume.defence
            pass.defender.hasBall = true //공 이동
        } else{
            console.log(`team${pass.host.team} ${pass.host.name} 패스 실책`)
            players.filter(p=> p.team != pass.host.team)[0].hasBall = true
        }
    },
    dribble:(dribble)=>{
        lostBall()
        if(dribble.host)
            dribble.host.curSp -= spConsume.dribble //스테미나 소모
        if(Math.random() < dribble.prob){
            if(dribble.host){
                console.log(`${dribble.host.name} 드리블 성공`)
                dribble.host.hasBall = true
                foward(dribble.host, 30)
            } else {
                console.log(`${dribble.host.name} 드리블 실패`)
                players.filter(p=> p.team != dribble.host.team)[0].hasBall = true
            } //스테미나가 부족해 실행 못한 경우'
        } else if(dribble.defender){
            console.log(`team${dribble.defender.team} ${dribble.defender.name} 수비 성공`)
            dribble.defender.curSp -= spConsume.defence
            dribble.defender.hasBall = true //공 이동
        } else{
            console.log(`${dribble.host.name} 드리블 실책`)
            players.filter(p=> p.team != dribble.host.team)[0].hasBall = true
        }
    }
}


let turn = 0;
while (turn < 45) {
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
        probs.push(`${key}:${value.prob.toFixed(3)}`)
        if(decide.prob < value.prob){
            decide.act = key
            decide.prob = value.prob
        }
    }

    // console.log(probs)
    action[decide.act](choices[decide.act])
    // console.log(players.map(p=>`${p.team}${p.name} p:${p.position} sp:${p.curSp}`))
    turn++;
}
//턴 끝
//후반전 반복
//승패 판정
if(score[0]!=score[1])
    console.log(`team${score.indexOf(Math.max(...score))+1} 승리 score-${score[0]}:${score[1]}`)
else
    console.log(`team${score.indexOf(Math.max(...score))+1} 무승부 score-${score[0]}:${score[1]}`)
//MMR 점수 지급