

const DRAGGER = {
    is_dragging: false,
    drag_x0: 0,
    drag_y0: 0,

    captureTile: function(tile, event) {
        this.is_dragging = true;
        this.drag_x0 = event.clientX;
        this.drag_y0 = event.clientY;
        tile.style.pointerEvents = 'none';
        // tile.style.cursor = 'grabbing';
        tile.classList.add('selected');
        SWAPPER.drag_tile = tile;
        SWAPPER.drag_target = tile;
        TILES.getArray('selected').forEach((t) => t.createDuplicate());
    },

    shiftTile: function(event) {
        let x = event.clientX, y = event.clientY,
            dx = x - this.drag_x0, dy = y - this.drag_y0,
            target = document.elementFromPoint(x, y).parentElement;
        TILES.getArray('selected').forEach((tile) => tile.shift(dx, dy));

        if (!target.classList.contains('tile')) {
            SWAPPER.drag_target = SWAPPER.drag_tile;
            target = SWAPPER.drag_target;
        }
        SWAPPER.resetParallelTargets(target);
    },

    releaseTile: function() {
        SWAPPER.drag_tile.style.pointerEvents = '';
        // SWAPPER.drag_tile.style.cursor = 'grab';
        TILES.removeClassFromTiles('target');
        TILES.getArray('selected').forEach((tile) => tile.shift(0, 0));
        TILES.getArray('duplicate').forEach((tile) => { tile.remove() });

        SWAPPER.linear();
        this.is_dragging = false;
        SWAPPER.drag_target = null;
    },

}


const SWAPPER = {
    drag_tile: null,
    drag_target: null,

    _deltaX: function() {
        if (this.drag_tile && this.drag_target)
            return Number(this.drag_target.dataset.x)
                  -Number(this.drag_tile.dataset.x)
    },

    _deltaY: function() {
        if (this.drag_tile && this.drag_target)
            return Number(this.drag_target.dataset.y)
                  -Number(this.drag_tile.dataset.y)
    },

    distance: function() {
        return Math.abs(this._deltaX()) + Math.abs(this._deltaY());
    },

    resetParallelTargets: function(target) {
        if (target == this.drag_target) return;
        this.drag_target = target

        let selected;
        TILES.removeClassFromTiles('target');
        for (selected of TILES.getArray('selected')) {
            if (this.locateParallelTarget(selected) && this.distance() > 0)
                this.locateParallelTarget(selected).classList.add('target');
        }
    },

    locateParallelTarget: function(tile) {
        if (!SWAPPER.drag_tile || !SWAPPER.drag_target) return;
        let target_x = Number(tile.dataset.x) + SWAPPER._deltaX(),
            target_y = Number(tile.dataset.y) + SWAPPER._deltaY();
        return GRID.findClose(target_x, target_y);
    },

    linear: function() {
        let tile;
        
        if (!this.distance()) return;
        this.swap(this.locateParallelTarget);
        for (tile of TILES.getArray('selected'))
            tile.updateIfInPlace();
    },

    swap: function(targetFunction) {
        // test 
        // document.getElementById('hintText').textContent = MOBILE ?
        //     'Tap / Untap to select many' : 'Click / Unclick to select many';

        let tile, target, vacant_tiles = [], target_tiles = [];

        for (tile of TILES.getArray('selected')) {
            target = targetFunction(tile);
            if (target){
                target.appendChild(tile.firstChild);
                target_tiles.push(target);
            }
            else 
                tile.classList.remove('selected');
        }

        for (tile of TILES.getArray('selected'))
            if (tile.children.length == 0)
                vacant_tiles.push(tile);

        TILES.removeClassFromTiles('selected');

        for (target of target_tiles) {
            if (target.children.length == 2) {
                tile = vacant_tiles.pop()
                tile.appendChild(target.firstChild)
                tile.updateIfInPlace();
            }
            target.classList.add('selected');
        }
    }
}




/*

    locateSquareRotation: function(tile) {
        let coef = this.positive ? 1 : -1,
            dx = Number(tile.dataset.x) - Number(this.referenceTile.dataset.x),
            dy = Number(tile.dataset.y) - Number(this.referenceTile.dataset.y),
            targetX = Number(this.referenceTile.dataset.x) - coef * dy,
            targetY = Number(this.referenceTile.dataset.y) + coef * dx;
        return [targetX, targetY];
    },

    locateHexagonRotation: function(tile) {
        let coef = this.positive ? ROOT_3 / 2 : -ROOT_3 / 2,
            dx = Number(tile.dataset.x) - Number(this.referenceTile.dataset.x),
            dy = Number(tile.dataset.y) - Number(this.referenceTile.dataset.y),
            targetX = Number(this.referenceTile.dataset.x) + dx / 2 - coef * dy,
            targetY = Number(this.referenceTile.dataset.y) + dy / 2 + coef * dx;

        [targetX, targetY] = this.tuneCoords(targetX, targetY);
        return [targetX, targetY];
    },
*/


