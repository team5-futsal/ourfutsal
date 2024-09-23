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

