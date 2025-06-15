

class Tile {
    el; x; y; init_position; angle; action;

    constructor(x, y, image_src, action) {
        this.x = x;  this.y = y;  this.angle = 0;
        this.pre_x = x;  this.pre_y = y;  this.pre_angle = y;
        if (action == 'LOCK') this.init_position = x+':'+y;
        else this.action = action;

        this.el = document.createElement('img');
        this.el.src = image_src;
        this.el.style.left = x + 'px';
        this.el.style.top = y + 'px';

        if (this.action) this.el.classList.add('btn');
        else this.el.classList.add('piece');

        this.el.oncontextmenu = (e) => { return false; };
        this.el.onmousedown = (e) => { this.touch(e); };
        this.el.onmouseup = (e) => { this.release(e); };
        this.el.onwheel = (e) => { this.rotateWheel(e); };

        this.el.addEventListener("touchstart", (e) => { this.touch(e); });
        this.el.addEventListener("touchend", (e) => { this.release(e); });
    }

    isLocked() {
        let by_position = this.x+':'+this.y == this.init_position;
        return by_position && this.angle == 0;
    }

    isActive() { return this.el.classList.contains('active'); }

    pre_time = 0; pre_active; pre_angle; pre_x; pre_y;

    touch(event) {
        // if (event) event.preventDefault();
        if (event.touches && event.touches.length > 1) return;
        if (this.isLocked()) return this.shake();

        event.action = this.action;
        this.pre_time = Date.now(); this.pre_x = this.x;  this.pre_y = this.y;
        this.pre_active = this.isActive();  this.pre_angle = this.angle;
        this.el.classList.add('active');
    }

    release(event) {
        this.shift(0, 0);
        if (event.touches && event.touches.length > 0) return;
        if (this.action) this.el.classList.remove('active');
        if (Date.now() - this.pre_time > 300) return;

        if (this.pre_active) this.el.classList.remove('active');
        event.quick_tap = true;
        event.action = this.action;
    }

    resetPosition() {
        this.el.classList.remove('active');
        this.x = this.pre_x;  this.y = this.pre_y;
        this.shift(0, 0);
        this._setAngle(this.pre_angle);
    }

    updatePosition(x, y) {
        this.x = x;  this.pre_x = x;
        this.y = y;  this.pre_y = y;
        this.pre_angle = this.angle;
        this.shift(0, 0);
        if (this.isLocked()) {
            this.el.classList.remove('active');
            this.shake();
        }
    }

    shift(dx, dy) {
        this.el.style.left = this.x + dx + 'px';
        this.el.style.top = this.y + dy + 'px';
    }

    _setAngle(angle) {
        this.angle = (angle + 360) % 360;
        this.el.style.transform = 'rotate(' + angle + 'deg)';
    }

    rotateWheel(event) {
        event.preventDefault();
        if (this.isLocked()) return this.shake();
        this._setAngle(this.angle + (event.deltaY > 0 ? 60 : -60));
        if (this.isLocked()) this.shake();
    }

    rotateRandom() {
        let rand = Math.floor(Math.random() * 6);
        this._setAngle([0, 60, 120, 180, 240, 300][rand]);
    }

    rotateAgainst(ref_tile, degree) {
        this._setAngle(this.pre_angle + degree);
        if (this == ref_tile) return;

        let rad = (degree / 180 * Math.PI),
            dx = this.pre_x - ref_tile.pre_x,
            dy = this.pre_y - ref_tile.pre_y;

        this.x = Math.round(ref_tile.pre_x + Math.cos(rad) * dx - Math.sin(rad) * dy);
        this.y = Math.round(ref_tile.pre_y + Math.sin(rad) * dx + Math.cos(rad) * dy);
    }

    shake(options) {
        if (options == undefined)
            options = [[3, 0], [-3, 0], [1, 2], [1, -2], [-1, 2], [-1, -2]];

        if (options.length == 0) {
            this.shift(0, 0);
        } else {
            let rand = Math.floor(Math.random() * options.length),
                [dx, dy] = options.splice(rand, 1)[0];
            this.shift(dx, dy);
            setTimeout(() => { this.shake(options); }, 50)
        }
    }
}
