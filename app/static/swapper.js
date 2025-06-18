const NEXT_PAGE = document.getElementById('nextPage'),
      FILE_INPUT = document.getElementById('fileInput');


class Swapper {
    grid; drag_touch; drag_delta = {x: 0, y: 0};

    constructor(grid) {
        this.grid = grid;
        grid.el.oncontextmenu = (e) => { return false; };
        grid.el.onwheel = (e) => { this.wheel(e); };
        grid.el.onmousedown = (e) => { this.dragStart(e); };
        grid.el.onmousemove = (e) => { this.dragMove(e); };
        grid.el.onmouseleave = (e) => { this.dragStop(e); };
        grid.el.onmouseup = (e) => { this.dragStop(e); };

        grid.el.addEventListener("touchstart", (e) => { this.touchStart(e); });
        grid.el.addEventListener("touchmove", (e) => { this.touchMove(e); });
        grid.el.addEventListener("touchend", (e) => { this.touchStop(e); });
        grid.el.addEventListener("touchcancel", (e) => { this.touchStop(e); });
    }

    dragStart(event) {
        if (this.drag_touch) return;
        if (event.preventDefault) event.preventDefault();
        this.drag_touch = {x: event.clientX, y: event.clientY};

        if (!event.action)
            for (let tile of this.grid.tileArray('btn'))
                tile.el.style.display = 'none';
    }

    dragMove(event) {
        if (!this.drag_touch) return;
        this.drag_delta = {x: event.clientX - this.drag_touch.x,
                           y: event.clientY - this.drag_touch.y}

        for (let tile of this.grid.tileArray('active'))
            tile.shift(this.drag_delta.x, this.drag_delta.y);
        this.resetTargets();
    }

    dragStop(event) {
        if (!this.drag_touch) return;
        this.drag_touch = undefined;

        for (let tile of this.grid.tileArray('target'))
            tile.el.classList.remove('target');
        for (let tile of this.grid.tileArray('btn'))
            tile.el.style.display = 'block';

        if (event && event.action) this.act(event.action);
        else this.swap();

        let active = this.grid.tileArray('active');
        if (event && !event.quick_tap && active.length == 1)
            active[0].el.classList.remove('active');

        this.drag_delta = {x: 0, y: 0};  this.angle = 0;
        if (this._allTilesAreLocked())
            for (let tile of this.grid.tileArray('piece')) tile.shake();
    }

    _allTilesAreLocked() {
        for (let tile of this.grid.tileArray('piece'))
            if (!tile.isLocked()) return false;
        return true;
    }

    act(action) {
        if (action == 'PLUS') this.grid.incCount();
        if (action == 'MINUS') this.grid.decCount();
        if (action == 'ROTATE') this.grid.rotateRandom();
        if (action == 'HOME') window.location = '/';
        if (action == 'NEXT') window.location = NEXT_PAGE.textContent;
        if (action == 'IMAGE') FILE_INPUT.click();
        if (action == 'INFO') window.alert('Painting Author Year');
    }

    resetTargets(tile) {
        for (let tile of this.grid.tileArray('target'))
            tile.el.classList.remove('target');

        for (let tile of this.grid.tileArray('active')) {
            let target = this.grid.snapTile(tile, this.drag_delta);
            if (target && !target.isActive())
                target.el.classList.add('target');
        }
    }

    swap() {  // tile can be both: active and target at the same time
        let x, y, tile, target, spots = [], active = [], targets = [];

        for (tile of this.grid.tileArray('active')) {
            target = this.grid.snapTile(tile, this.drag_delta);
            if (target) {
                tile.x = target.pre_x; tile.y = target.pre_y;
                spots.push(tile.pre_x+'|'+tile.pre_y);
                active.push(tile);
                targets.push(target);
            }
            else tile.resetPosition();
        }

        for (target of targets)
            if (spots.includes(target.pre_x+'|'+target.pre_y))
                spots.splice(spots.indexOf(target.pre_x+'|'+target.pre_y), 1);

        for (target of targets) {
            if (target.isActive()) continue;
            [x, y] = spots.pop().split('|');
            this.grid.putInto(target, Number(x), Number(y));
        }

        for (tile of active)
            this.grid.putInto(tile, tile.x, tile.y);
    }

    rotor_0;  rotor_snap = 0;  angle = 0;

    _getRotor(event) { // vector from touch.0 to touch.1
        return {x: event.touches[1].clientX - event.touches[0].clientX,
                y: event.touches[1].clientY - event.touches[0].clientY};
    }

    touchStart(event) {
        if (event.touches.length > 2) return;
        if (event.touches.length > 1) {
            this.rotor_snap = 0;
            this.rotor_0 = this._getRotor(event);
        }
        else this.dragStart(event.touches[0]);
    }

    touchMove(event) {
        if (event.touches.length > 1) {
            let rotor = this._getRotor(event),
                alpha = this._angelBetweenVectors(this.rotor_0, rotor);

            if (Math.abs(alpha - this.rotor_snap) > 10) {
                this.wheel({deltaY: alpha - this.rotor_snap});
                this.rotor_snap = alpha;
            }
        }
        this.dragMove(event.touches[0]);
    }

    _angelBetweenVectors(vec1, vec2) {
        let angle = Math.atan2(vec2.y, vec2.x) - Math.atan2(vec1.y, vec1.x);
        angle = angle * (180 / Math.PI);
        if (angle > 180) angle -= 360;
        if (angle < -180) angle += 360;
        return angle;
    }

    touchStop(event) {
        if (this.grid.el.id != 'galleries') event.preventDefault();
        if (event.touches.length == 0) this.dragStop(event);
    }

    wheel(event) {
        if (!this.drag_touch) return;
        if (event.preventDefault) event.preventDefault();
        this.angle += event.deltaY > 0 ? 60 : -60;
        this.angle = (this.angle + 360) % 360;

        let rotation_point = this._getRotationPoint();
        for (let tile of this.grid.tileArray('active')) {
            tile.rotateAgainst(rotation_point, this.angle);
            this.dragMove(event);
            this.resetTargets();
        }
    }

    _getRotationPoint() {
        let exes = [], whys = [];
        for (let tile of this.grid.tileArray('active'))
            { exes.push(tile.pre_x);  whys.push(tile.pre_y); }

        exes.sort((a,b) => a - b);  whys.sort((a,b) => a - b);
        return {x: Math.floor((exes[0] + exes[exes.length-1]) / 2),
                y: Math.floor((whys[0] + whys[whys.length-1]) / 2)};
    }
}
