const NEXT_PAGE = document.getElementById('nextPage'),
      FILE_INPUT = document.getElementById('fileInput');


class Swapper {
    grid; puzzle; is_dragging; drax_x; drag_y; snap_x = 0; snap_y = 0;

    constructor(grid, puzzle) {
        this.grid = grid;
        this.puzzle = puzzle;
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
    }

    dragMove(event) {
        if (!this.is_dragging) return;
        let dx = event.clientX - this.drag_x,
            dy = event.clientY - this.drag_y;
        for (let tile of this.grid.tileArray('selected'))
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

        if (event && event.action) this.act(event.action);
        else this.swap();

        let selected = this.grid.tileArray('selected');
        if (event && !event.quick_tap && selected.length == 1)
            selected[0].el.classList.remove('selected');

        this.snap_x = 0;  this.snap_y = 0;  this.degree = 0;
        if (this.grid.tileArray('fixed').length == this.grid.tileArray().length)
            for (let tile of this.grid.tileArray()) tile.touch();
    }

    act(action) {
        if (action == 'PLUS') this.puzzle.incCount();
        if (action == 'MINUS') this.puzzle.decCount();
        if (action == 'ROTATE') this.puzzle.rotateRandom();
        if (action == 'HOME') window.location = '/';
        if (action == 'NEXT') window.location = NEXT_PAGE.textContent;
        if (action == 'IMAGE') FILE_INPUT.click();
        if (action == 'INFO') window.alert('Painting Author Year');
    }

    detectTarget(tile) {
        let x = tile.x + this.snap_x, y = tile.y + this.snap_y,
            target = this.grid.tiles[x+'|'+y];
        if (target && !target.el.classList.contains('fixed'))
            return target;
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

    swap() {
        let tile, target, vacant_tiles = [], target_tiles = [];

        for (tile of this.grid.tileArray('selected')) {
            target = this.detectTarget(tile);  // important to get target first
            if (target){
                target.el.appendChild(tile.el.firstChild);
                target_tiles.push(target);
                tile.resetPosition();  // after do resetting position
            }
            else tile.resetPosition();
        }

        for (tile of this.grid.tileArray('selected')) {
            tile.el.classList.remove('selected');
            if (tile.el.children.length == 0)
                vacant_tiles.push(tile);
        }

        for (target of target_tiles) {
            if (target.el.children.length == 2) {
                tile = vacant_tiles.pop();
                tile.el.appendChild(target.el.firstChild);
                if (this.grid.fix) tile.fixIfInPlace();
            }
            if (this.grid.fix) target.fixIfInPlace();
            target.touch();
        }
    }

    rotor_x;  rotor_y;  rotor_snap = 0;  degree = 0;

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
        this.degree += event.deltaY > 0 ? 60 : -60;
        this.degree = (this.degree + 360) % 360;
        let ref_tile = this._getReferenceTile(event);
        for (let tile of this.grid.tileArray('selected')) {
            tile.rotateAgainst(ref_tile, this.degree);
            this.dragMove(event);
            this.resetTargets();
        }

    }

    _getReferenceTile(e) {
        let selected = this.grid.tileArray('selected');
        return selected[Math.floor(selected.length / 2)];
    }
}
