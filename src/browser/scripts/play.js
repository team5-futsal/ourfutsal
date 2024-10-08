import { game } from './game.js';

export const playGame = (player1, player2) => {
    const gameLog = game(player1, player2);

    // 게임 / 로그 화면을 추가할 부모 찾기
    const container = document.getElementsByClassName('reqResContainer');

    // 게임 진행 영역 추가
    const canvas = document.createElement('canvas');
    const gameDiv = document.createElement('div');
    gameDiv.className = 'gameDiv';
    gameDiv.id = 'gameDiv';
    canvas.id = 'canvas';
    canvas.width = '840';
    canvas.height = '480';

    container[0].appendChild(gameDiv);
    gameDiv.appendChild(canvas);

    // 게임 로그 영역 추가
    const logDiv = document.createElement('div');
    logDiv.className = 'gameLog';
    logDiv.id = 'gameLog';
    container[0].appendChild(logDiv);

    let ctx = canvas.getContext('2d');
    const ballImage = document.getElementById('source');

    class drawPlayer {
        constructor(ctx, name) {
            this.width = 40;
            this.height = 40;
            this.ctx = ctx;
        }

        draw(x, y, radius, color, name) {
            ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.stroke();
            this.ctx.fillStyle = color;
            this.ctx.fill();

            this.ctx.font = '30px malgun gothic';
            this.ctx.fillStyle = 'white';
            this.ctx.fillText(name, x - radius, y, 500);
        }

        drawSp(x, y, radius, maxSp, curSp) {
            const spUnit = ((radius * 2) / maxSp) << 0;
            let spBar = radius * 2;
            curSp == maxSp ? (spBar = radius * 2) : (spBar = spUnit * curSp);

            // 바 테두리
            this.ctx.strokeStype = 'rgb(0 0 0)';
            this.ctx.lineWidth = 10;
            this.ctx.strokeRect(x, y + radius, radius * 2, 10);
            // 스테미나 바
            this.ctx.fillStyle = 'rgb(255 255 0)';
            this.ctx.fillRect(x, y + radius, spBar, 10);
        }
    }

    class drawBall {
        constructor(ctx, image) {
            this.width = 40;
            this.height = 40;
            this.ctx = ctx;
            this.image = image;
        }

        draw(x, y) {
            this.ctx.drawImage(this.image, x, y, 50, 50);
        }
    }

    const drawPlayers = new drawPlayer(ctx);
    const ball = new drawBall(ctx, ballImage);

    const heightUnit = (canvas.height / 3) << 0;
    const halfHeightUnit = (heightUnit / 2) << 0;
    const yPosition = [halfHeightUnit, halfHeightUnit + heightUnit * 2, halfHeightUnit + heightUnit];
    const radius = (heightUnit / 4) << 0;
    const color = ['blue', 'red'];
    const interval = 100;
    let timer = interval - 1;
    let turn = 0;
    let animationFame;
    const end = gameLog.length - 2;

    const gameStart = () => {
        animationFame = requestAnimationFrame(gameStart);
        timer++;
        if (turn > end) {
            const winner = gameLog[gameLog.length - 1].win;
            if (winner === 0) {
                logDiv.innerHTML += `<p>Player1 팀이 승리했습니다!</p>`;
            } else if (winner === 1) {
                logDiv.innerHTML += `<p>Player2 팀이 승리했습니다!</p>`;
            } else logDiv.innerHTML += `<p>무승부 입니다!</p>`;
            cancelAnimationFrame(animationFame);
        }
        if (timer % interval == 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cwu = canvas.width / 100; // canvas width Unit
            const log = gameLog[turn];

            for (const p of log.players) {
                const x = (p.position * cwu) << 0;
                const y = yPosition[p.pNum];

                const pX = x + radius * (p.team - 1 ? -1 : 1);
                drawPlayers.draw(pX, y, radius, color[p.team - 1], p.name);

                const spBarX = p.team - 1 ? x - radius * 2 : x;
                drawPlayers.drawSp(spBarX, y, radius, p.maxSp, p.curSp);

                if (p.hasBall) {
                    ball.draw(spBarX, y);
                }
            }
            logDiv.innerHTML += `<p>${JSON.stringify(gameLog[turn].result.result)}</p>`;

            turn++;
        }
    };

    gameStart();

    return gameLog[gameLog.length - 1];
};

//Reference
//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo
//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke
//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
//https://developer.mozilla.org/ko/docs/Web/API/Window/requestAnimationFrame
