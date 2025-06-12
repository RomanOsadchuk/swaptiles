

class Tile {
    el; true_x; true_y; grid_x; grid_y; x; y; angle; action;

    constructor(x, y, image_src, action) {
        this.true_x = x;  this.grid_x = x;  this.x = x;
        this.true_y = y; this.grid_y = y;  this.y = y;
        this.action = action || null;
        this.angle = 0;

        this.el = document.createElement('img');
        this.el.src = image_src;
        this.el.style.left = x + 'px';
        this.el.style.top = y + 'px';
        if (action) this.el.classList.add('btn');
        else this.el.classList.add('piece');

        this.el.oncontextmenu = (e) => { return false; };
        this.el.onmousedown = (e) => { this.touch(e); };
        this.el.onmouseup = (e) => { this.release(e); };
        this.el.onwheel = (e) => { this.rotateWheel(e); };

        this.el.addEventListener("touchstart", (e) => { this.touch(e); });
        this.el.addEventListener("touchend", (e) => { this.release(e); });
    }

    putInto(x, y) {
        this.grid_x = x;  this.x = x;
        this.grid_y = y;  this.y = y;
        this.el.style.left = x + 'px';
        this.el.style.top = y + 'px';
        this.pre_touch_angle = this.angle;
    }

    isSelected() { return this.el.classList.contains('selected'); }
    isFixed() { return this.grid_x == this.true_x && this.grid_y == this.true_y && this.angle == 0; }
    _isPiece() { return this.el.classList.contains('piece'); }

    touch_time; pre_touch_selected; pre_touch_angle;

    touch(event) {
        if (event && event.touches && event.touches.length > 1) return;
        if (event) event.preventDefault();
        if (this.isFixed() && this._isPiece()) {
            return this._shake();
        }

        this.touch_time = Date.now();
        this.x = this.grid_x;  this.y = this.grid_y;
        this.pre_touch_selected = this.isSelected();
        this.pre_touch_angle = this.angle;
        this.el.classList.add('selected');
        event.action = this.action;
    }

    release(event) {
        if (event && event.touches && event.touches.length > 0) return;
        this.shift(0, 0);
        if (this.action) this.el.classList.remove('selected');
        if (Date.now() - this.touch_time > 300) return;

        if (this.pre_touch_selected) this.el.classList.remove('selected');
        event.quick_tap = true;
        event.action = this.action;
    }

    shift(dx, dy) {
        this.el.style.left = this.x + dx + 'px';
        this.el.style.top = this.y + dy + 'px';
    }

    resetPosition() {
        this.el.classList.remove('selected');
        this.el.style.left = this.grid_x + 'px';
        this.el.style.top = this.grid_y + 'px';
        this._setAngle(this.pre_touch_angle);
    }

    _setAngle(angle) {
        this.angle = (angle + 360) % 360;
        this.el.style.transform = 'rotate(' + angle + 'deg)';
    }

    rotateWheel(event) {
        event.preventDefault();
        if (this.isFixed() && this._isPiece()) return this._shake();
        this._setAngle(this.angle + (event.deltaY > 0 ? 60 : -60));
        if (this.isFixed() && this._isPiece()) return this._shake();
    }

    rotateRandom() {
        let rand = Math.floor(Math.random() * 6);
        this._setAngle([0, 60, 120, 180, 240, 300][rand]);
    }

    rotateAgainst(ref_tile, degree) {
        this._setAngle(this.pre_touch_angle + degree);
        if (this == ref_tile) return;

        let rad = (degree / 180 * Math.PI),
            dx = this.grid_x - ref_tile.grid_x,
            dy = this.grid_y - ref_tile.grid_y;

        this.x = Math.round(ref_tile.grid_x + Math.cos(rad) * dx - Math.sin(rad) * dy);
        this.y = Math.round(ref_tile.grid_y + Math.sin(rad) * dx + Math.cos(rad) * dy);
    }

    _shake(options) {
        this.el.classList.remove('selected');
        if (options == undefined)
            options = [[3, 0], [-3, 0], [1, 2], [1, -2], [-1, 2], [-1, -2]];

        if (options.length == 0) {
            this.el.style.left = this.grid_x + 'px';
            this.el.style.top = this.grid_y + 'px';
        } else {
            let rand = Math.floor(Math.random() * options.length),
                [dx, dy] = options.splice(rand, 1)[0];
            this.el.style.left = this.grid_x + dx + 'px';
            this.el.style.top = this.grid_y + dy + 'px';
            setTimeout(() => { this._shake(options); }, 50)
        }
    }
}
