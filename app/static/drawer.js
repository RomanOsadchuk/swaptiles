const ROOT_3 = Math.sqrt(3),
      CANVAS = document.getElementById('canvas');
      CTX = CANVAS.getContext('2d');


class Drawer {
    canvas = document.getElementById('canvas');  size;  x0;  y0;
    ctx = document.getElementById('canvas').getContext('2d');

    constructor(size, vertical) {
        let width = size, height = size;
        if (vertical) height = Math.round(size * 2 / ROOT_3);
        else width = Math.round(size * 2 / ROOT_3);

        this.size = size;
        this.canvas.width = width;
        this.canvas.height = height;
        this.x0 = width / 2;
        this.y0 = height / 2;
    }

    half() { return 0.6 * this.size / 2; }
    quarter() { return this.half() / 2; }
    eights() { return this.quarter() / 2; }

    drawHome() {
        this.ctx.moveTo(this.x0, this.y0 - this.half());
        this.ctx.lineTo(this.x0 + this.half(), this.y0 + this.quarter());
        this.ctx.lineTo(this.x0 + this.quarter(), this.y0 + this.quarter());
        this.ctx.lineTo(this.x0 + this.quarter(), this.y0 + this.half());
        this.ctx.lineTo(this.x0 - this.quarter(), this.y0 + this.half());
        this.ctx.lineTo(this.x0 - this.quarter(), this.y0 + this.quarter());
        this.ctx.lineTo(this.x0 - this.half(), this.y0 + this.quarter());
    }

    drawNext() {
        this.ctx.moveTo(this.x0 + this.half(), this.y0);
        this.ctx.lineTo(this.x0 - this.quarter(), this.y0 + this.half());
        this.ctx.lineTo(this.x0 - this.quarter(), this.y0 + this.quarter());
        this.ctx.lineTo(this.x0 - this.half(), this.y0 + this.quarter());
        this.ctx.lineTo(this.x0 - this.half(), this.y0 - this.quarter());
        this.ctx.lineTo(this.x0 - this.quarter(), this.y0 - this.quarter());
        this.ctx.lineTo(this.x0 - this.quarter(), this.y0 - this.half());
    }

    drawPlus() {
        this.ctx.moveTo(this.x0 + this.half(), this.y0 + this.eights());
        this.ctx.lineTo(this.x0 + this.eights(), this.y0 + this.eights());
        this.ctx.lineTo(this.x0 + this.eights(), this.y0 + this.half());
        this.ctx.lineTo(this.x0 - this.eights(), this.y0 + this.half());
        this.ctx.lineTo(this.x0 - this.eights(), this.y0 + this.eights());
        this.ctx.lineTo(this.x0 - this.half(), this.y0 + this.eights());
        this.ctx.lineTo(this.x0 - this.half(), this.y0 - this.eights());
        this.ctx.lineTo(this.x0 - this.eights(), this.y0 - this.eights());
        this.ctx.lineTo(this.x0 - this.eights(), this.y0 - this.half());
        this.ctx.lineTo(this.x0 + this.eights(), this.y0 - this.half());
        this.ctx.lineTo(this.x0 + this.eights(), this.y0 - this.eights());
        this.ctx.lineTo(this.x0 + this.half(), this.y0 - this.eights());
    }

    drawMinus() {
        this.ctx.moveTo(this.x0 + this.half(), this.y0 + this.eights());
        this.ctx.lineTo(this.x0 - this.half(), this.y0 + this.eights());
        this.ctx.lineTo(this.x0 - this.half(), this.y0 - this.eights());
        this.ctx.lineTo(this.x0 + this.half(), this.y0 - this.eights());
    }

    drawCircle() {
        this.ctx.arc(this.x0, this.y0, 3*this.eights(), 0, 2*Math.PI);
    }

    drawInfo() {
        this.ctx.arc(this.x0, this.y0, this.eights(), 0, 2*Math.PI);
        this.ctx.fill();  this.ctx.beginPath();
        this.ctx.arc(this.x0, this.y0 - 3*this.eights(), this.eights(), 0, 2*Math.PI);
        this.ctx.fill();  this.ctx.beginPath();
        this.ctx.arc(this.x0, this.y0 + 3*this.eights(), this.eights(), 0, 2*Math.PI);
    }

    drawUpload() {
        this.ctx.arc(this.x0, this.y0, this.eights(), 0, 2*Math.PI);
        this.ctx.fill();  this.ctx.beginPath();
        this.ctx.arc(this.x0 - 3*this.eights(), this.y0, this.eights(), 0, 2*Math.PI);
        this.ctx.fill();  this.ctx.beginPath();
        this.ctx.arc(this.x0 + 3*this.eights(), this.y0, this.eights(), 0, 2*Math.PI);
    }

    draw(action) {
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'Silver';
        this.ctx.fill();
        //['HOME', 'MINUS', 'NEXT', 'ROTATE', 'IMAGE', 'PLUS', 'INFO']
        this.ctx.fillStyle = 'Indigo';
        this.ctx.beginPath();

        if (action == 'HOME') this.drawHome();
        if (action == 'NEXT') this.drawNext();
        if (action == 'PLUS') this.drawPlus();
        if (action == 'MINUS') this.drawMinus();
        if (action == 'ROTATE') this.drawCircle();
        if (action == 'IMAGE') this.drawUpload();
        if (action == 'INFO') this.drawInfo();

        this.ctx.closePath();
        this.ctx.fill();
        return this.canvas.toDataURL('image/jpeg');
    }
}
 