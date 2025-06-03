

const PI = Math.PI;
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


const N_TARGETS = 5,
      TARGET_PERIOD = canvas.height / N_TARGETS,
      TARGET_SIZE = TARGET_PERIOD / 2,
      TARGET_Y0 = TARGET_SIZE / 2,
      BASE_WIDTH = canvas.width / 4,
      CANVAS_BOX = {x0: 0, y0: 0, x1: canvas.width, y1: canvas.height};





function drawRay(ray, color) {
    let line = {x0: ray.x0, x1: ray.x0 + ray.dx,
                y0: ray.y0, y1: ray.y0 + ray.dy}
    return drawLine(line, color);
}


function drawLine(line, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(line.x0, line.y0);
    ctx.lineTo(line.x1, line.y1);
    ctx.stroke();
}


function reflectRay(ray, line) {
    ray.x1 = ray.x0 + ray.dx;
    ray.y1 = ray.y0 + ray.dy;
    let p = getLineIntersection(ray, line);
    console.log(ray);
    console.log(line);
    console.log(p);
    if (!p) return false;

    let slope = Math.atan2(line.y1 - line.y0, line.x1 - line.x0);
    if (slope < -Math.PI/2) slope += Math.PI;
    if (slope > Math.PI/2) slope -= Math.PI;
    let ray_angle = Math.atan2(ray.dy, ray.dx),
        new_angle = 2 * slope - ray_angle;

    ray.dx = Math.abs(new_angle) < (Math.PI / 2) ? 1 : -1;
    ray.dy = Math.abs(Math.tan(new_angle));
    if (new_angle > Math.PI && new_angle < 2*Math.PI) ray.dy = -ray.dy;
    if (new_angle < 0 && new_angle > -Math.PI) ray.dy = -ray.dy;

    resizeVector(ray);
    return true;
}



function getLineIntersection(line1, line2) {
    let { x0: x1, y0: y1, x1: x2, y1: y2 } = line1;
    let { x0: x3, y0: y3, x1: x4, y1: y4 } = line2;

    let denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return null; // Lines are parallel

    let px = ((x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4)) / denom;
    let py = ((x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4)) / denom;
    let eps = 0.001;

    // Check if the intersection point is within both line segments
    let withinSegment = (x, y, x0_, y0_, x1_, y1_) =>
        (Math.min(x0_, x1_) - eps) <= x && x <= (Math.max(x0_, x1_) + eps) &&
        (Math.min(y0_, y1_) - eps) <= y && y <= (Math.max(y0_, y1_) + eps);

    if (withinSegment(px, py, x1, y1, x2, y2) &&
        withinSegment(px, py, x3, y3, x4, y4))
            return { x: px, y: py };
    return null; // Intersection not within the segments
}


function targetIntersected(ray, t) {
    ray.x1 = ray.x0 + ray.dx;
    ray.y1 = ray.y0 + ray.dy;
    return pointInside(ray.x1, ray.y1, t)
        || getLineIntersection(ray, {x0: t.x0, y0: t.y0, x1: t.x0, y1: t.y1})
        || getLineIntersection(ray, {x0: t.x0, y0: t.y0, x1: t.x1, y1: t.y0})
        || getLineIntersection(ray, {x0: t.x1, y0: t.y1, x1: t.x1, y1: t.y0})
        || getLineIntersection(ray, {x0: t.x1, y0: t.y1, x1: t.x0, y1: t.y1});
}


function eventInside(event, base) {
    return pointInside(event.clientX, event.clientY, base);
}


function pointInside(x, y, sqr) {
    return x > sqr.x0 && x < sqr.x1 && y > sqr.y0 && y < sqr.y1;
}


function resizeVector(v, coef = 1) {
    let len = Math.sqrt(v.dx*v.dx + v.dy*v.dy),
        ratio = coef * TARGET_SIZE / len;
    v.dx *= ratio;  v.dy *= ratio;
}


class Side {
    colors;
    ray_count = 0;
    base = {x0: 0, y0: 0, x1: 0, y1: 0};
    attack = {x0: 0, y0: 0, x1: 0, y1: 0};
    draft = {x0: 0, y0: 0, x1: 0, y1: 0};
    targets = [];
    block = null;
    ray = null;
    state = 'ATTACK';

    constructor(colors, base_x0, target_x0) {
        this.colors = colors;
        this.setBase(base_x0);
        this.setTargets(target_x0);
        this.nextState();
    }

    setBase(base_x0) {
        this.base.x0 = base_x0;
        this.base.x1 = base_x0 + BASE_WIDTH;
        this.base.y0 = TARGET_Y0;
        this.base.y1 = canvas.height - TARGET_Y0;
        ctx.strokeStyle = this.getColor();
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.rect(base_x0, TARGET_Y0, BASE_WIDTH, canvas.height - TARGET_Y0 * 2);
        ctx.stroke();
    }

    setTargets(x0) {
        let y0 = TARGET_Y0;
        ctx.fillStyle = this.getColor();
        while (y0 < canvas.height) {
            ctx.beginPath();
            ctx.rect(x0, y0, TARGET_SIZE, TARGET_SIZE);
            this.targets.push({x0: x0, x1: x0 + TARGET_SIZE,
                               y0: y0, y1: y0 + TARGET_SIZE})
            ctx.fill();
            y0 += TARGET_PERIOD;
        }
    }

    getColor() { return this.colors[this.ray_count % this.colors.length]; }

    start(event) {
        if (this.state == 'ATTACK') {
            this.ray_count += 1;
            this.state = 'ATTACKING';
            this.attack.x0 = event.clientX;
            this.attack.y0 = event.clientY;
        }
        if (this.state == 'BLOCK') {
            this.state = 'BLOCKING';
            this.draft.x0 = event.clientX;
            this.draft.y0 = event.clientY;
        }
    }

    move(event) {
        if (this.state == 'ATTACKING') {
            ctx.lineWidth = 2;
            this.attack.x1 = event.clientX;
            this.attack.y1 = event.clientY;
            drawLine(this.attack, this.getColor());
        }
        if (this.state == 'BLOCKING') {
            ctx.lineWidth = 2;
            this.draft.x1 = event.clientX;
            this.draft.y1 = event.clientY;
            drawLine(this.draft, 'green');
        }
    }

    stop() {
        if (this.state == 'ATTACKING') {
            this.ray = {x0: this.attack.x1, dx: this.attack.x1 - this.attack.x0,
                        y0: this.attack.y1, dy: this.attack.y1 - this.attack.y0};
            this.ray.osc = [-5, 0][this.ray_count % 2];
            resizeVector(this.ray);
        }
        if (this.state == 'BLOCKING') {
            let block = {x0: this.draft.x0, dx: this.draft.x1 - this.draft.x0,
                         y0: this.draft.y0, dy: this.draft.y1 - this.draft.y0};
            resizeVector(block);
            this.block = {x0: block.x0, x1: block.x0 + block.dx,
                          y0: block.y0, y1: block.y0 + block.dy}
            ctx.lineWidth = 5;
            drawLine(this.block, 'black');
        }
        this.nextState();
    }

    nextState() {
        let color = 'green';
        if (!this.ray) {
            this.state = 'ATTACK';
            color = this.getColor();
        }
        else if (!this.block) {
            this.state = 'BLOCK';
            color = 'black';
        }
        else this.state = 'WAIT';

        let alpha = this.base.x0 < canvas.width/2 ? Math.PI/2 : Math.PI*3/2;
        let beta = this.base.x0 < canvas.width/2 ? Math.PI*3/2 : Math.PI*5/2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, TARGET_SIZE, alpha, beta, false);
        ctx.fill();
    }

    hit(i) {
        let t = this.targets.splice(i, 1)[0];
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.rect(t.x0, t.y0, t.x1-t.x0, t.y1-t.y0);
        ctx.fill();
        if (this.targets.length == 0) this.state = 'LOST';
    }

    grow(i) {
        let t = this.targets[i];
        if (t.x1 - t.x0 > TARGET_SIZE + 1) return;

        t.x0 -= TARGET_SIZE / 2;
        t.y0 -= TARGET_SIZE / 2;
        t.x1 += TARGET_SIZE / 2;
        t.y1 += TARGET_SIZE / 2;

        ctx.fillStyle = this.colors[0];
        ctx.beginPath();
        ctx.rect(t.x0, t.y0, t.x1-t.x0, t.y1-t.y0);
        ctx.fill();
    }

    reflect(ray) {
        if (!this.block) return;
        let reflected = reflectRay(ray, this.block);
        if (!reflected) return;

        ctx.lineWidth = 5;
        drawLine(this.block, 'green');
        this.block = null;
        this.nextState();
    }

    strike(opponent) {
        if (!this.ray) return;
        ctx.lineWidth = 3;

        for (let wall of WALLS) reflectRay(this.ray, wall);

        this.reflect(this.ray);
        opponent.reflect(this.ray);
        drawRay(this.ray, this.getColor());

        for (let i = 0; i < opponent.targets.length; i += 1)
            if (targetIntersected(this.ray, opponent.targets[i]))
                opponent.hit(i);

        for (let i = 0; i < this.targets.length; i += 1)
            if (targetIntersected(this.ray, this.targets[i]))
                this.grow(i);

        this.ray.x0 += this.ray.dx;
        this.ray.y0 += this.ray.dy + this.ray.osc;
        this.ray.osc = -this.ray.osc;
        if (pointInside(this.ray.x0, this.ray.y0, CANVAS_BOX)) return;
        this.ray = null;
        if (this.state != 'BLOCKING') this.nextState();
    }
}




// =================



var blue = new Side(['MidnightBlue', 'MediumBlue', 'Indigo'], TARGET_Y0 * 4, TARGET_Y0);
var red = new Side(['Maroon', 'FireBrick', 'Crimson'],
                   canvas.width - TARGET_Y0 * 4 - BASE_WIDTH,
                   canvas.width - TARGET_Y0 * 3);

const WALLS = [{x0: blue.base.x1 + TARGET_Y0, y0: TARGET_Y0, x1: red.base.x0 - TARGET_Y0, y1: TARGET_Y0},
    {x0: blue.base.x1 + TARGET_Y0, y0: canvas.height - TARGET_Y0, x1: red.base.x0 - TARGET_Y0, y1: canvas.height - TARGET_Y0}];

drawLine(WALLS[0], 'black');
drawLine(WALLS[1], 'black');


function eventStart(event) {
    let left_event = event, right_event = event;

    for (let touch of event.touches || []) {
        if (touch.clientX < canvas.width/2) left_event = touch;
        if (touch.clientX > canvas.width/2) right_event = touch;
    }

    if (eventInside(left_event, blue.base)) blue.start(left_event);
    else if (eventInside(right_event, red.base)) red.start(right_event);
    else console.log('out');
}


function eventMove(event) {
    let left_event = event, right_event = event;

    for (let touch of event.touches || []) {
        if (touch.clientX < canvas.width/2) left_event = touch;
        if (touch.clientX > canvas.width/2) right_event = touch;
    }

    if (eventInside(left_event, blue.base)) blue.move(left_event);
    else if (left_event.clientX < canvas.width / 2) blue.stop();
    
    if (eventInside(right_event, red.base)) red.move(right_event);
    else if (right_event.clientX > canvas.width / 2) red.stop();
}


function eventEnd(event) {
    if (eventInside(event, blue.base)) blue.stop();
    else if (eventInside(event, red.base)) red.stop();
    else console.log('out');
}


canvas.addEventListener('mousedown', eventStart);
canvas.addEventListener('mousemove', eventMove);
canvas.addEventListener('mouseup', eventEnd);



canvas.addEventListener("touchstart", eventStart);
canvas.addEventListener("touchmove", eventMove);
canvas.addEventListener("touchend", eventEnd);
canvas.addEventListener("touchcancel", eventEnd);


function animate() {
    if (blue.ray) blue.strike(red);
    if (red.ray) red.strike(blue);
}
var t_id = setInterval(animate, 50);


