const ROOT_3 = Math.sqrt(3),
      CANVAS = document.getElementById('canvas');
      CTX = CANVAS.getContext('2d', { alpha: true });


class Drawer {
    // canvas = document.getElementById('canvas');  size;  x0;  y0;
    // ctx = document.getElementById('canvas').getContext('2d');

    constructor(size, vertical) {
        let width = size, height = size;
        if (vertical) height = Math.round(size * 2 / ROOT_3);
        else width = Math.round(size * 2 / ROOT_3);

        this.size = size;
        CANVAS.width = width;
        CANVAS.height = height;
        this.x0 = width / 2;
        this.y0 = height / 2;
    }

    half() { return 0.6 * this.size / 2; }
    quarter() { return this.half() / 2; }
    eights() { return this.quarter() / 2; }

    _drawHome() {
        CTX.moveTo(this.x0, this.y0 - this.half());
        CTX.lineTo(this.x0 + this.half(), this.y0 + this.quarter());
        CTX.lineTo(this.x0 + this.quarter(), this.y0 + this.quarter());
        CTX.lineTo(this.x0 + this.quarter(), this.y0 + this.half());
        CTX.lineTo(this.x0 - this.quarter(), this.y0 + this.half());
        CTX.lineTo(this.x0 - this.quarter(), this.y0 + this.quarter());
        CTX.lineTo(this.x0 - this.half(), this.y0 + this.quarter());
    }

    _drawNext() {
        CTX.moveTo(this.x0 + this.half(), this.y0);
        CTX.lineTo(this.x0 - this.quarter(), this.y0 + this.half());
        CTX.lineTo(this.x0 - this.quarter(), this.y0 + this.quarter());
        CTX.lineTo(this.x0 - this.half(), this.y0 + this.quarter());
        CTX.lineTo(this.x0 - this.half(), this.y0 - this.quarter());
        CTX.lineTo(this.x0 - this.quarter(), this.y0 - this.quarter());
        CTX.lineTo(this.x0 - this.quarter(), this.y0 - this.half());
    }

    _drawPlus() {
        CTX.moveTo(this.x0 + this.half(), this.y0 + this.eights());
        CTX.lineTo(this.x0 + this.eights(), this.y0 + this.eights());
        CTX.lineTo(this.x0 + this.eights(), this.y0 + this.half());
        CTX.lineTo(this.x0 - this.eights(), this.y0 + this.half());
        CTX.lineTo(this.x0 - this.eights(), this.y0 + this.eights());
        CTX.lineTo(this.x0 - this.half(), this.y0 + this.eights());
        CTX.lineTo(this.x0 - this.half(), this.y0 - this.eights());
        CTX.lineTo(this.x0 - this.eights(), this.y0 - this.eights());
        CTX.lineTo(this.x0 - this.eights(), this.y0 - this.half());
        CTX.lineTo(this.x0 + this.eights(), this.y0 - this.half());
        CTX.lineTo(this.x0 + this.eights(), this.y0 - this.eights());
        CTX.lineTo(this.x0 + this.half(), this.y0 - this.eights());
    }

    _drawMinus() {
        CTX.moveTo(this.x0 + this.half(), this.y0 + this.eights());
        CTX.lineTo(this.x0 - this.half(), this.y0 + this.eights());
        CTX.lineTo(this.x0 - this.half(), this.y0 - this.eights());
        CTX.lineTo(this.x0 + this.half(), this.y0 - this.eights());
    }

    _drawCircle() {
        CTX.arc(this.x0, this.y0, 3*this.eights(), 0, 2*Math.PI);
    }

    _drawInfo() {
        CTX.arc(this.x0, this.y0, this.eights(), 0, 2*Math.PI);
        CTX.fill();  CTX.beginPath();
        CTX.arc(this.x0, this.y0 - 3*this.eights(), this.eights(), 0, 2*Math.PI);
        CTX.fill();  CTX.beginPath();
        CTX.arc(this.x0, this.y0 + 3*this.eights(), this.eights(), 0, 2*Math.PI);
    }

    _drawUpload() {
        CTX.arc(this.x0, this.y0, this.eights(), 0, 2*Math.PI);
        CTX.fill();  CTX.beginPath();
        CTX.arc(this.x0 - 3*this.eights(), this.y0, this.eights(), 0, 2*Math.PI);
        CTX.fill();  CTX.beginPath();
        CTX.arc(this.x0 + 3*this.eights(), this.y0, this.eights(), 0, 2*Math.PI);
    }

    _backGround() {
        CTX.beginPath();
        CTX.rect(0, 0, CANVAS.width, CANVAS.height);
        CTX.fillStyle = 'Silver';
        CTX.fill();
    }

    draw(action) {
        this._backGround();
        CTX.fillStyle = 'Indigo';
        CTX.beginPath();

        if (action == 'HOME') this._drawHome();
        if (action == 'NEXT') this._drawNext();
        if (action == 'PLUS') this._drawPlus();
        if (action == 'MINUS') this._drawMinus();
        if (action == 'ROTATE') this._drawCircle();
        if (action == 'IMAGE') this._drawUpload();
        if (action == 'INFO') this._drawInfo();

        CTX.closePath();
        CTX.fill();
        return CANVAS.toDataURL('image/jpeg');
    }

    drawChar(char) {
        this._backGround();
        CTX.fillStyle = 'Indigo';
        CTX.font = 'bold 50px Verdana';

        let width = CTX.measureText(char).width;
        // console.log(dims.width, dims.height);
        CTX.fillText(char, this.x0 - width/2, this.y0 + 20);
        return CANVAS.toDataURL('image/jpeg');
    }
}
 