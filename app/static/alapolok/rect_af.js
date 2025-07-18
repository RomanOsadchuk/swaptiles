
const CANVAS = document.getElementsByTagName('canvas')[0],
      CTX = CANVAS.getContext('2d');

var WIDTH = window.innerWidth, HEIGHT = window.innerHeight, A, V, X;


class Rect {
    left;  right;  top;  bot;  dx;  dy;  color;  shade;

    constructor(left, top, width, height, dx, dy, color, shade) {
        this.left = left;
        this.top = top;
        this.right = left + width;
        this.bot = top + height;
        this.dx = dx;
        this.dy = dy;
        this.color = color;
        this.shade = shade || color;
    }

    width() { return this.right - this.left; }
    height() { return this.bot - this.top; }
    // isNone() { return this.width() <= 0 || this.height() <= 0; }
    isNone() { return this.width() <= Math.abs(this.dx/2) || this.height() <= Math.abs(this.dy/2); }

    draw(shadow) {
        CTX.fillStyle = shadow ? this.shade : this.color;
        CTX.beginPath();
        CTX.rect(this.left, this.top, this.width(), this.height());
        CTX.fill();
    }

    bounce(others) {
        if (this.isNone()) return;
        this.draw(true);

        if (this.dx > 0) this.bounceRight(others);
        if (this.dx < 0) this.bounceLeft(others);
        if (this.dy > 0) this.bounceBot(others);
        if (this.dy < 0) this.bounceTop(others);

        this.step();
    }

    step() {
        if (this.isNone()) return;
        this.left += this.dx;
        this.right += this.dx;
        this.top += this.dy;
        this.bot += this.dy;

        this.draw(false);
    }

    bounceRight(others) {
        if (this.right + this.dx > WIDTH) {
            // this.left += this.dx;
            this.left += X;
            this.dx *= -1;
        }
        for (let other of others) this.bounceOneRight(other);
    }

    bounceOneRight(other) {
        if (other.color == this.color) return;
        if (this.right <= other.left && this.right + this.dx >= other.left
            && this.intersectsY(other)) {
                this.left += X;
                this.dx *= -1;
                other.dx = Math.abs(other.dx);
        }
    }

    bounceLeft(others) {
        if (this.left + this.dx < 0) {
            this.right -= X;
            this.dx *= -1;
        }
        for (let other of others) this.bounceOneLeft(other);
    }

    bounceOneLeft(other) {
        if (other.color == this.color) return;
        if (this.left >= other.right && this.left + this.dx <= other.right
            && this.intersectsY(other)) { 
                this.right -= X;
                this.dx *= -1;
                other.dx = -Math.abs(other.dx);
        }
    }

    bounceBot(others) {
        if (this.bot + this.dy > HEIGHT) {
            this.top += X;
            this.dy *= -1;
        }
        for (let other of others) this.bounceOneBot(other);
    }

    bounceOneBot(other) {
        if (other.color == this.color) return;
        // if (TICK > 24 && this.color == 'Maroon') {
        //     console.log('}}}', this.bot, other.top, this.bot + this.dy)
        // }
        if (this.bot <= other.top && this.bot + this.dy >= other.top
            && this.intersectsX(other)) { 
                this.top += X;
                this.dy *= -1;
                other.dy = Math.abs(other.dy);
        }
    }

    bounceTop(others) {
        if (this.top + this.dy < 0) {
            this.bot -= X;
            this.dy *= -1;
        }
        for (let other of others) this.bounceOneTop(other);
    }

    bounceOneTop(other) {
        if (other.color == this.color) return;
        // if (TICK > 24 && this.color == 'DarkBlue') {
        //     console.log('-->', this.top, other.bot, this.top + this.dy)
        // }
        if (this.top >= other.bot && this.top + this.dy <= other.bot
            && this.intersectsX(other)) { 
                this.bot -= X;
                this.dy *= -1;
                other.dy = -Math.abs(other.dy);
        }
    }

    intersectsY(other) {
        if (this.top - Math.abs(this.dy) > other.bot) return false;
        if (other.top - Math.abs(this.dy) > this.bot) return false;
        return true
    }

    intersectsX(other) {
        if (this.right + Math.abs(this.dx) < other.left) return false;
        if (other.right + Math.abs(this.dx) < this.left) return false;
        return true
    }

}

const COLORS = ['DarkBlue', 'DarkSlateBlue', 'Teal', 'Turquoise', 'DarkGreen', 'ForestGreen',
                'Gold', 'GoldenRod', 'Brown', 'Tomato', 'Maroon', 'Crimson'];


function createRects() {
    let rects = []
    for (let i of [0, 1, 2, 3, 4])
        rects.push(new Rect(Math.floor(Math.random() * (WIDTH - 1.5*A)),
                            Math.floor(1.4*i*A), A, A,
                            Math.random() > 0.5 ? V : -V,
                            Math.random() > 0.5 ? V : -V,
                            COLORS[2*i], COLORS[2*i + 1]))
    return rects;
}


var interval_id = 99, RECTS = [], TICK = 0;


function mainLoop() {
    for (let rect of RECTS) rect.bounce(RECTS);
    TICK += 1;
}


function gogogo() {
    clearInterval(interval_id);
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    A = Math.floor(HEIGHT / 7),
    V = Math.floor(A / 7);
    X = Math.floor(V / 3);
    
    CANVAS.width = WIDTH;
    CANVAS.height = HEIGHT;
    CTX.clearRect(0, 0, WIDTH, HEIGHT);

    RECTS = createRects();
    interval_id = setInterval(mainLoop, 20);
}


gogogo();

window.onresize = gogogo;
window.onclick = gogogo;
