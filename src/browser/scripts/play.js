const canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

const ballImage = document.getElementById("source");

class drawPlayer {
    constructor(ctx, name) {
        this.width = 40;
        this.height = 40;
        this.ctx = ctx
        this.name = name
    }

    draw(x,y, radius, color) {
        ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.stroke();
        this.ctx.fillStyle = color;
        this.ctx.fill()

        this.ctx.font = "30px malgun gothic"
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(this.name, x-radius, y, 500)
    }

    drawSp(x,y,radius){
        this.ctx.strokeStype = 'rgb(0 0 0)';
        this.ctx.lineWidth = 10;
        this.ctx.strokeRect(x, y+radius, radius*2, 10);
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

const player = new drawPlayer(ctx, "손흥민")
const ball = new drawBall(ctx, ballImage)

const heightUnit = canvas.height/3<<0
const halfHeightUnit = heightUnit/2<<0
const yPosision = [halfHeightUnit, halfHeightUnit+heightUnit*2, halfHeightUnit+heightUnit]
const radius = heightUnit/4<<0
const color = ['blue', 'red']

player.draw(radius, yPosision[2], radius, color[0])
player.drawSp(0, yPosision[2], radius)
ball.draw(radius, yPosision[2])

//Reference
//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo
//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke
//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
//https://developer.mozilla.org/ko/docs/Web/API/Window/requestAnimationFrame
//https://developer.mozilla.org/ko/docs/Web/API/Window/requestAnimationFrame
//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
