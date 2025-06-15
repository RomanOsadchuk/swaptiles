const NEXT_PAGE = document.getElementById('nextPage'),
      FILE_INPUT = document.getElementById('fileInput');


class Swapper {
    grid; is_dragging; drax_x; drag_y; snap_x = 0; snap_y = 0;

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
        if (this.is_dragging) return;
        if (event.preventDefault) event.preventDefault();

        this.is_dragging = true;
        this.drag_x = event.clientX;
        this.drag_y = event.clientY;

        if (!event.action)
            for (let tile of this.grid.tileArray('btn'))
                tile.el.style.display = 'none';
    }

    dragMove(event) {
        if (!this.is_dragging) return;
        let dx = event.clientX - this.drag_x,
            dy = event.clientY - this.drag_y;
        for (let tile of this.grid.tileArray('active'))
            tile.shift(dx, dy);

        let [snap_x, snap_y] = this.grid.snap(dx, dy);
        if (snap_x != this.snap_x || snap_y != this.snap_y) {
            this.snap_x = snap_x;
            this.snap_y = snap_y;
            this.resetTargets();
        }
    }

    dragStop(event) {
        this.is_dragging = false;
        for (let tile of this.grid.tileArray('target'))
            tile.el.classList.remove('target');
        for (let tile of this.grid.tileArray('btn'))
            tile.el.style.display = 'block';

        if (event && event.action) this.act(event.action);
        else this.swap();

        let active = this.grid.tileArray('active');
        if (event && !event.quick_tap && active.length == 1)
            active[0].el.classList.remove('active');

        this.snap_x = 0;  this.snap_y = 0;  this.angle = 0;
        if (this._allTilesAreFixed())
            for (let tile of this.grid.tileArray('piece')) tile.shake();
    }

    _allTilesAreFixed() {
        for (let tile of this.grid.tileArray('piece'))
            if (!tile.isLocked()) return false
        return true
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

    detectTarget(tile) {
        let x = tile.x + this.snap_x, y = tile.y + this.snap_y,
            target = this._findClose(x, y);
        if (target && !target.isLocked()) return target;
    }

    _findClose(x, y) {
        let i, j, target;
        for (i of [0, 1, -1, 2, -2, 3, -3])
            for (j of [0, 1, -1, 2, -2, 3, -3]) {
                target = this.grid.tiles[(x+i) +'|'+ (y+j)];
                if (target) return target;
            }
    }

    resetTargets(tile) {
        for (let tile of this.grid.tileArray('target'))
            tile.el.classList.remove('target');
        for (let tile of this.grid.tileArray('active')) {
            let target = this.detectTarget(tile);
            if (target && !target.el.classList.contains('active'))
                target.el.classList.add('target');
        }
    }

    swap() {  // tile can be both: active and target at the same time
        let x, y, tile, target, spots = [], active = [], targets = [];

        for (tile of this.grid.tileArray('active')) {
            target = this.detectTarget(tile);
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

    rotor_x;  rotor_y;  rotor_snap = 0;  angle = 0;

    touchStart(event) {
        if (event.touches.length > 2) return;
        if (event.touches.length > 1) {
            this.rotor_snap = 0;
            this.rotor_x = event.touches[1].clientX - event.touches[0].clientX;
            this.rotor_y = event.touches[1].clientY - event.touches[0].clientY;
        }
        else this.dragStart(event.touches[0]);
    }

    touchMove(event) {
        if (event.touches.length > 1) {
            let x = event.touches[1].clientX - event.touches[0].clientX,
                y = event.touches[1].clientY - event.touches[0].clientY,
                alpha = this._angelBetweenVectors(this.rotor_x, this.rotor_y, x, y);

            if (Math.abs(alpha - this.rotor_snap) > 10) {
                this.wheel({deltaY: alpha - this.rotor_snap});
                this.rotor_snap = alpha;
            }
        }
        this.dragMove(event.touches[0]);
    }

    _angelBetweenVectors(x1, y1, x2, y2) {
        let angle = Math.atan2(y2, x2) - Math.atan2(y1, x1);
        angle = angle * (180 / Math.PI);
        if (angle > 180) angle -= 360;
        if (angle < -180) angle += 360;
        return angle;
    }

    touchStop(event) {
        if (event.touches.length == 0) this.dragStop(event);
    }

    wheel(event) {
        if (!this.is_dragging) return;
        if (event.preventDefault) event.preventDefault();
        this.angle += event.deltaY > 0 ? 60 : -60;
        this.angle = (this.angle + 360) % 360;
        let ref_tile = this._getReferenceTile(event);
        for (let tile of this.grid.tileArray('active')) {
            tile.rotateAgainst(ref_tile, this.angle);
            this.dragMove(event);
            this.resetTargets();
        }
    }

    _getReferenceTile(e) {
        let active = this.grid.tileArray('active');
        return active[Math.floor(active.length / 2)];
    }
}
