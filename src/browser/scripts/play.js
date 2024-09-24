import { game } from './game.js'

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

const gameLog = game(player1Roster, player2Roster)

const canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
const ballImage = document.getElementById("source");

class drawPlayer {
    constructor(ctx, name) {
        this.width = 40;
        this.height = 40;
        this.ctx = ctx
    }

    draw(x,y, radius, color, name) {
        ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.stroke();
        this.ctx.fillStyle = color;
        this.ctx.fill()

        this.ctx.font = "30px malgun gothic"
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(name, x-radius, y, 500)
    }

    drawSp(x,y,radius, maxSp, curSp){
        const spUnit = radius*2/maxSp<<0;
        let spBar = radius*2;
        curSp == maxSp ? spBar = radius*2 : spBar = spUnit*curSp

        this.ctx.strokeStype = 'rgb(0 0 0)';
        this.ctx.lineWidth = 10;
        this.ctx.strokeRect(x, y+radius, spBar, 10);
        this.ctx.fillStyle = 'rgb(255 255 0)';
        this.ctx.fillRect(x, y+radius, radius*2, 10);
    }
}

class drawBall {
    constructor(ctx, image) {
        this.width = 40;
        this.height = 40;
        this.ctx = ctx
        this.image = image
    }

    draw(x,y) {
        this.ctx.drawImage(this.image, x,y,50,50)
    }
}

const drawPlayers = new drawPlayer(ctx)
const ball = new drawBall(ctx, ballImage)

const heightUnit = canvas.height/3<<0
const halfHeightUnit = heightUnit/2<<0
const yPosition = [halfHeightUnit, halfHeightUnit+heightUnit*2, halfHeightUnit+heightUnit]
const radius = heightUnit/4<<0
const color = ['blue', 'red']
let turn = 0;


const playGame = () => {
    requestAnimationFrame(playGame)
    const cwu = canvas.width/100 // canvas width Unit
    const log = gameLog[turn]

    for(const p of log.players){
        const x = p.position*cwu<<0
        const y = yPosition[p.pNum]

        const pX = x + radius * (p.team-1 ? -1 : 1)
        drawPlayers.draw(pX, y, radius, color[p.team-1], p.name)
        
        const spBarX = p.team-1 ? x - radius*2 : x
        drawPlayers.drawSp(spBarX, y, radius, p.maxSp, p.curSp)

        if(p.hasBall){
            ball.draw(spBarX, y)
        }
    }
    
    turn++;
    console.log(t)
    console.log(t.result)
}
playGame()

// for(const t of gameLog){
//     const cwu = canvas.width/100 // canvas width Unit
//     for(const p of t.players){
//         const x = p.position*cwu<<0
//         const y = yPosition[p.pNum]

//         const pX = x + radius * (p.team-1 ? -1 : 1)
//         drawPlayers.draw(pX, y, radius, color[p.team-1], p.name)
        
//         const spBarX = p.team-1 ? x - radius*2 : x
//         drawPlayers.drawSp(spBarX, y, radius, p.maxSp, p.curSp)

//         if(p.hasBall){
//             ball.draw(spBarX, y)
//         }
//     }
    
//     console.log(t)
//     console.log(t.result)
//     break;
// }


//Reference
//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo
//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke
//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
//https://developer.mozilla.org/ko/docs/Web/API/Window/requestAnimationFrame
//https://developer.mozilla.org/ko/docs/Web/API/Window/requestAnimationFrame
//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
