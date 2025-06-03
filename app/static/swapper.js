

class Swapper {
    grid; puzzle; is_dragging; drax_x; drag_y; snap_x; snap_y;

    constructor(grid, puzzle) {
        this.grid = grid;
        this.puzzle = puzzle;
        grid.el.oncontextmenu = (e) => { return false; };
        grid.el.onwheel = (e) => { e.preventDefault(); };
        grid.el.onmousedown = (e) => { this.start(e); };
        grid.el.onmousemove = (e) => { this.move(e); };
        grid.el.onmouseleave = (e) => { this.stop(e); };
        grid.el.onmouseup = (e) => { this.stop(e); };
    }

    start(event) {
        // retation first
        event.preventDefault();
        if (this.is_dragging) return;
        this.is_dragging = true;
        this.drag_x = event.clientX;
        this.drag_y = event.clientY;
    }

    move(event) {
        // rotation
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

    stop(event) {
        this.is_dragging = false;
        for (let tile of this.grid.tileArray('target'))
            tile.el.classList.remove('target');

        if (event.action) this.act(event.action);
        else this.swap();

        let selected = this.grid.tileArray('selected');
        if (!event.quick_tap && selected.length == 1)
            selected[0].el.classList.remove('selected');

        this.snap_x = 0;  this.snap_y = 0;
        if (this.grid.tileArray('fixed').length == this.grid.tileArray().length)
            for (let tile of this.grid.tileArray()) tile.touch();
    }

    act(action) {
        if (action == 'PLUS') this.puzzle.incCount();
        if (action == 'MINUS') this.puzzle.decCount();
        if (action == 'HOME') window.location = '/';
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
}
