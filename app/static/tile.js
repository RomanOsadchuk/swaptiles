
function _activeCount() { return document.getElementsByClassName('active').length; }


class Tile {
    el; x; y; angle; action; init_state = {}; touched_at = 0; prev_state;

    constructor(x, y, image_src, action) {
        this.x = x;  this.y = y;  this.angle = 0;
        if (action == 'LOCK') this.init_state = {x: x, y: y};
        else this.action = action;

        this.el = document.createElement('img');
        this.el.src = image_src;
        this.el.style.left = x + 'px';
        this.el.style.top = y + 'px';

        if (this.action) this.el.classList.add('btn');
        else this.el.classList.add('piece');

        this._savePrevState();
        this.el.oncontextmenu = (e) => { return false; };
        this.el.onmousedown = (e) => { this.touch(e); };
        this.el.onmouseup = (e) => { this.release(e); };
        this.el.onwheel = (e) => { this.rotateWheel(e); };

        this.el.addEventListener("touchstart", (e) => { this.touch(e); });
        this.el.addEventListener("touchend", (e) => { this.release(e); });
    }

    isLocked() {
        return this.prev_state.x == this.init_state.x && 
               this.prev_state.y == this.init_state.y &&
               this.angle == 0;
    }

    isActive() { return this.el.classList.contains('active'); }

    _savePrevState() {
        this.prev_state = {x: this.x, y: this.y, angle: this.angle};
    }

    // touched_at = 0; prev_state.active; prev_state.angle; prev_state.x; prev_state.y;

    touch(event) {
        event.preventDefault();
        if (event.touches && event.touches.length > 1) return;
        if (this.isLocked()) return this.shake();

        event.action = this._getAction();
        this.touched_at = Date.now();
        this._savePrevState();
        if (_activeCount() == 0) this.el.classList.add('active');
    }

    release(event) {
        // this.shift(0, 0);
        if (event.touches && event.touches.length > 0) return;
        if (this.action) this.resetPosition();
        if (Date.now() - this.touched_at > 300) return;

        if (!this.action) event.elToActivate = this.el;
        event.action = this._getAction();
    }

    resetPosition() {
        this.el.classList.remove('active');
        this.x = this.prev_state.x;
        this.y = this.prev_state.y;
        this.shift(0, 0);
        if (!this.action) this._setAngle(this.prev_state.angle);
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
        this.shift(0, 0);
        this._savePrevState();
        if (this.isLocked()) {
            this.el.classList.remove('active');
            this.shake();
        }
    }

    shift(dx, dy) {
        if (this.action) return;
        this.el.style.left = this.x + dx + 'px';
        this.el.style.top = this.y + dy + 'px';
    }

    _setAngle(angle) {
        this.angle = (angle + 360) % 360;
        this.el.style.transform = 'rotate(' + angle + 'deg)';
    }

    rotateWheel(event) {
        event.preventDefault();
        if (this.isLocked() && !this.isActive()) return this.shake();
        this._setAngle(this.angle + (event.deltaY > 0 ? 60 : -60));
        if (this.isLocked() && !this.isActive()) this.shake();
    }

    rotateRandom() {
        let rand = Math.floor(Math.random() * 6);
        this._setAngle([0, 60, 120, 180, 240, 300][rand]);
    }

    rotateAgainst(point, degree) {
        this._setAngle(this.prev_state.angle + degree);
        let rad = (degree / 180 * Math.PI),
            dx = this.prev_state.x - point.x,
            dy = this.prev_state.y - point.y;

        this.x = Math.round(point.x + Math.cos(rad) * dx - Math.sin(rad) * dy);
        this.y = Math.round(point.y + Math.sin(rad) * dx + Math.cos(rad) * dy);
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

    _getAction() {
        if (this.action == 'NEXT' && this.angle == 300) return 'HOME';
        if (this.action == 'MINUS' && this.angle == 300) return 'ROTATE';
        return this.action;
    }
}
