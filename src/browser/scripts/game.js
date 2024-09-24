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

export function game(player1Roster, player2Roster) {
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
    if (Math.random() < 0.5) {
        player1[2].hasBall = true;
    } else {
        player2[2].hasBall = true;
    }

    //init
    const players = [...player1, ...player2]
    const fieldSize = 100;
    const score = [0, 0];
    const initPosion = players.map(p => p.position)
    const gameLog = []

    const spConsume = {
        pass: 5,
        dribble: 10,
        defence: 10
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

    const utils = {
        lostBall: () => { players.forEach(p => p.hasBall = false) },
        positionReset: () => { players.forEach((p, i) => p.position = initPosion[i]) },
        foward: (host, long) => {
            const direction = host.team == 1 ? 1 : -1
            const position = host.position + long * direction
            if(position > fieldSize){
                host.position = fieldSize;
            } else if(position < 0){
                host.position = 0;
            } else{
                host.position += long * direction
            }
            
            // players.filter(p=>p.team == host.team).position += long * direction
        },
        Random: (n) => { return Math.floor(Math.random() * n) }
    }

    const action = {
        shoot: (shoot) => {
            let result = 0;
            if (shoot.host) {
                shoot.host.curSp -= spConsume.shoot //스테미나 소모
            }
            utils.lostBall() // 공 초기화
            if (players.find(p => p.hasBall))
                utils.positionReset() // 포지션 초기화

            if (Math.random() < shoot.prob) { // 성공 판정
                score[shoot.host.team - 1] += 1
                players.filter(p => p.team != shoot.host.team)[0].hasBall = true
                result = `team${shoot.host.team} 득점 성공 score-${score[0]}:${score[1]}`
            } else if (shoot.defender) {
                result = `team${shoot.defender.team} ${shoot.defender.name} 수비 성공`
                shoot.defender.curSp -= spConsume.defence
                shoot.defender.hasBall = true //공 이동
            } else {
                result = `team${shoot.host.team} 득점 실패 score-${score[0]}:${score[1]}`
                players.filter(p => p.team != shoot.host.team)[0].hasBall = true
            }

            // console.log(result)
            return { result: result }
        },
        pass: (pass) => {
            let result = 0;
            utils.lostBall()
            if (pass.teamMember)
                pass.teamMember.curSp -= spConsume.pass //스테미나 소모

            if (Math.random() < pass.prob) {
                if (pass.teamMember) {
                    result = `team${pass.host.team} ${pass.host.name} 패스 성공`
                    pass.teamMember.hasBall = true
                    utils.foward(pass.teamMember, 10)
                } else {
                    result = `team${pass.host.team} ${pass.host.name} 패스 실책`
                    players.filter(p => p.team != pass.host.team)[0].hasBall = true
                } //스테미나가 부족해 실행 못한 경우'
            } else if (pass.defender) {
                result = `team${pass.defender.team} ${pass.defender.name} 수비 성공`
                pass.defender.curSp -= spConsume.defence
                pass.defender.hasBall = true //공 이동
            } else {
                result = `team${pass.host.team} ${pass.host.name} 패스 실책`
                players.filter(p => p.team != pass.host.team)[0].hasBall = true
            }

            // console.log(result)
            return { result: result }
        },
        dribble: (dribble) => {
            let result = "";
            utils.lostBall()
            if (dribble.host)
                dribble.host.curSp -= spConsume.dribble //스테미나 소모
            if (Math.random() < dribble.prob) {
                if (dribble.host) {
                    result = `team${dribble.host.team} ${dribble.host.name} 드리블 성공`
                    dribble.host.hasBall = true
                    utils.foward(dribble.host, 30)
                } else {
                    result = `team${dribble.host.team} ${dribble.host.name} 드리블 실패`
                    players.filter(p => p.team != dribble.host.team)[0].hasBall = true
                } //스테미나가 부족해 실행 못한 경우'
            } else if (dribble.defender) {
                result = `team${dribble.defender.team} ${dribble.defender.name} 수비 성공`
                dribble.defender.curSp -= spConsume.defence
                dribble.defender.hasBall = true //공 이동
            } else {
                result = `team${dribble.host.team} ${dribble.host.name} 드리블 실책`
                players.filter(p => p.team != dribble.host.team)[0].hasBall = true
            }

            // console.log(result)
            return { result: result }
        }
    }

    let turn = 0;
    gameLog.push({ players: JSON.parse(JSON.stringify(players)), act: 'ready', result: '경기 시작' })
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
        const decide = { act: "shoot", prob: 0 }

        // 가장 확률이 높은 행동을 선택
        for (const [key, value] of Object.entries(choices)) {
            probs.push(`${key}:${value.prob.toFixed(3)}`)
            if (decide.prob < value.prob) {
                decide.act = key
                decide.prob = value.prob
            }
        }

        // console.log(probs) // 확률 확인
        const result = action[decide.act](choices[decide.act])
        // console.log(players.map(p=>`${p.team}${p.name} p:${p.position} sp:${p.curSp}`)) // 선수 상태 확인
        gameLog.push({ players: JSON.parse(JSON.stringify(players)), act: decide.act, result: result })
        turn++;
    }
    //턴 끝
    //후반전 반복
    //승패 판정
    const win = score.indexOf(Math.max(...score))
    const lose = +!win
    if (score[0] != score[1]) {
        // console.log(`team${win + 1} 승리 score-${score[0]}:${score[1]}`)
        gameLog.push({ win: win, lose: lose, mmr: 100 }) //MMR 점수 지급
    } else {
        // console.log(`team${win + 1} 무승부 score-${score[0]}:${score[1]}`)
        gameLog.push({ win: -1, lose: -1, mmr: 0 }) //MMR 점수 지급
    }

    return gameLog
}
