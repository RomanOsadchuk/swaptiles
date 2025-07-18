const NEXT_PAGE = document.getElementById('nextPage'),
      FILE_INPUT = document.getElementById('fileInput');


class Swapper {
    grid; drag_touch; drag_delta = {x: 0, y: 0};

    constructor(grid) {
        this.grid = grid;
        grid.el.oncontextmenu = (e) => { return false; };
        grid.el.onwheel = (e) => { this.wheel(e); };
        grid.el.onmousedown = (e) => { this.dragStart(e, false); };
        grid.el.onmousemove = (e) => { this.dragMove(e); };
        grid.el.onmouseleave = (e) => { this.dragStop(e); };
        grid.el.onmouseup = (e) => { this.dragStop(e); };

        grid.el.addEventListener("touchstart", (e) => { this.touchStart(e); });
        grid.el.addEventListener("touchmove", (e) => { this.touchMove(e); });
        grid.el.addEventListener("touchend", (e) => { this.touchStop(e); });
        grid.el.addEventListener("touchcancel", (e) => { this.touchStop(e); });
    }

    dragStart(event, tmp_action) {
        if (this.drag_touch) return;
        if (event.preventDefault) event.preventDefault();
        this.grid.el.style.cursor = 'pointer';
        this.drag_touch = {x: event.clientX, y: event.clientY};
        this.grid.activateNeighbours();

        if (event.action || tmp_action) return;
        for (let tile of this.grid.tileArray('btn'))
            tile.el.style.display = 'none';
    }

    _switchTouch(event) {
        this.drag_touch = {x: event.clientX - this.drag_delta.x,
                           y: event.clientY - this.drag_delta.y}
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
        this.grid.el.style.cursor = 'default';

        for (let tile of this.grid.tileArray('target'))
            tile.el.classList.remove('target');
        for (let tile of this.grid.tileArray('btn'))
            tile.el.style.display = 'block';

        if (event && event.action) this.act(event.action);
        else this.swap();

        for (let tile of this.grid.tileArray('active'))
            tile.el.classList.remove('active');

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
                tile.x = target.prev_state.x; tile.y = target.prev_state.y;
                spots.push(tile.prev_state.x+'|'+tile.prev_state.y);
                active.push(tile);
                targets.push(target);
            }
            else tile.resetPosition();
        }

        for (target of targets)
            if (spots.includes(target.prev_state.x+'|'+target.prev_state.y))
                spots.splice(spots.indexOf(target.prev_state.x+'|'+target.prev_state.y), 1);

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
            this._switchTouch(event.touches[0]);
        }
        else this.dragStart(event.touches[0], event.action);
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
        if (event.touches.length == 1) this._switchTouch(event.touches[0]);
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
            { exes.push(tile.prev_state.x);  whys.push(tile.prev_state.y); }

        exes.sort((a,b) => a - b);  whys.sort((a,b) => a - b);
        return {x: Math.floor((exes[0] + exes[exes.length-1]) / 2),
                y: Math.floor((whys[0] + whys[whys.length-1]) / 2)};
    }
}
