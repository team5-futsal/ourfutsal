const canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

export class player {
    constructor() {
        this.x = 10;
        this.y = 200;
        this.width = 50;
        this.height = 50;
    }

    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

const dino = new player()
dino.draw()

//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineTo
//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke
//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
//https://developer.mozilla.org/ko/docs/Web/API/Window/requestAnimationFrame

