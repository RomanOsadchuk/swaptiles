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
        for (let tile of this.grid.tileArray('selected'))
            tile.shift(dx, dy);
        for (let tile of this.grid.tileArray('btn'))
            if (tile.isSelected()) tile.shift(dx, dy);

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

        let selected = this.grid.tileArray('selected');
        if (event && !event.quick_tap && selected.length == 1)
            selected[0].el.classList.remove('selected');

        this.snap_x = 0;  this.snap_y = 0;  this.angle = 0;
        if (this._allTilesAreFixed())
            for (let tile of this.grid.tileArray('piece')) tile._shake();
    }

    _allTilesAreFixed() {
        for (let tile of this.grid.tileArray('piece'))
            if (!tile.isFixed()) return false
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
            target = this.grid.tiles[x+'|'+y];
        if (target && !target.isFixed()) return target;
    }

    resetTargets(tile) {
        for (let tile of this.grid.tileArray('target'))
            tile.el.classList.remove('target');
        for (let tile of this.grid.tileArray('selected')) {
            let target = this.detectTarget(tile);
            if (target && !target.el.classList.contains('selected'))
                target.el.classList.add('target');
        }
    }

    swap() {  // tile can be both: selected and target at the same time
        let x, y, tile, target, spots = [], selected = [], targets = [];

        for (tile of this.grid.tileArray('selected')) {
            target = this.detectTarget(tile);
            if (target) {
                tile.x = target.grid_x; tile.y = target.grid_y;
                spots.push(tile.grid_x+'|'+tile.grid_y);
                selected.push(tile);
                targets.push(target);
            }
            else tile.resetPosition();
        }

        for (target of targets)
            if (spots.includes(target.grid_x+'|'+target.grid_y))
                spots.splice(spots.indexOf(target.grid_x+'|'+target.grid_y), 1);

        for (target of targets) {
            if (target.isSelected()) continue;
            [x, y] = spots.pop().split('|');
            this.grid.putInto(target, Number(x), Number(y));
        }

        for (tile of selected)
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
        for (let tile of this.grid.tileArray('selected')) {
            tile.rotateAgainst(ref_tile, this.angle);
            this.dragMove(event);
            this.resetTargets();
        }

    }

    _getReferenceTile(e) {
        let selected = this.grid.tileArray('selected');
        return selected[Math.floor(selected.length / 2)];
    }
}
