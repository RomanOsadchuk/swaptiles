
const HELPER = {

    tileArray: function(class_name) {
        class_name = class_name || 'tile';
        return Array.from(document.getElementsByClassName(class_name));
    },

    removeClassFromTiles: function(class_name) {
        this.tileArray(class_name).forEach(
            (t) => t.classList.remove(class_name));
    },

    createDuplicate: function(tile) {  // tile.createDuplicate
        let duplicate = CREATE_TILE(tile.dataset.x, tile.dataset.y,
                                    tile.firstChild.src, 'duplicate')
        for (let clip_class of ['hexagon-path', 'triangle-V-path', 'triangle-A-path'])
            if (tile.classList.contains(clip_class))
                duplicate.classList.add(clip_class);
        CROPPER.root.appendChild(duplicate);
    }
};


const TOUCHER = {
    is_dragging: false,
    drag_x0: 0,
    drag_y0: 0,

    tileTouched: function(tile, event) {
        this.is_dragging = true;
        this.drag_x0 = event.clientX;
        this.drag_y0 = event.clientY;
        tile.style.pointerEvents = 'none';
        tile.classList.add('selected');
        SWAPPER.drag_tile = tile;
        SWAPPER.drag_target = tile;
        console.log('tileTouched', SWAPPER.drag_tile)
        HELPER.tileArray('selected').forEach((t) => HELPER.createDuplicate(t));
    },

    tileMoved: function(event) {
        let x = event.clientX, y = event.clientY,
            dx = x - this.drag_x0, dy = y - this.drag_y0,
            target = document.elementFromPoint(x, y).parentElement;
        HELPER.tileArray('selected').forEach((tile) => tile.shift(dx, dy));

        if (!target.classList.contains('tile')) {
            SWAPPER.drag_target = SWAPPER.drag_tile;
            target = SWAPPER.drag_target;
        }
        SWAPPER.resetParallelTargets(target);
    },

    tileReleased: function() {
        HELPER.tileArray('selected').forEach((tile) => tile.shift(0, 0));
        HELPER.tileArray('duplicate').forEach((tile) => { tile.remove() });
        SWAPPER.drag_tile.style.pointerEvents = '';

        SWAPPER.linear();
        this.is_dragging = false;
        // SWAPPER.drag_tile = null;
        SWAPPER.drag_target = null;
    },

}


const SWAPPER = {
    drag_tile: null,
    drag_target: null,

    shuffle: function() {
        let tiles = HELPER.tileArray(),
            next_tile, random_index,
            current_tile = tiles.splice(0, 1)[0];

        while (tiles.length > 0) {
            random_index = Math.floor(Math.random() * tiles.length);
            next_tile = tiles.splice(random_index, 1)[0];
            current_tile.appendChild(next_tile.firstChild);
            next_tile.appendChild(current_tile.firstChild);
            if (ROTATION) current_tile.rotateRandom()
            current_tile = next_tile;
        }
    },

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

    resetParallelTargets: function(target) {
        if (target == this.drag_target) return;
        this.drag_target = target

        let selected;
        HELPER.removeClassFromTiles('target');
        for (selected of HELPER.tileArray('selected'))
            if (this.locateParallelTarget(selected))
                this.locateParallelTarget(selected).classList.add('target');
    },

    locateParallelTarget: function(tile) {
        if (!SWAPPER.drag_tile || !SWAPPER.drag_target) return;
        let target_x = Number(tile.dataset.x) + SWAPPER._deltaX(),
            target_y = Number(tile.dataset.y) + SWAPPER._deltaY();
        return CROPPER.findClose(target_x, target_y);
    },

    linear: function() {
        let tile;
        
        // if (!this.drag_tile) return;
        this.swap(this.locateParallelTarget);
        for (tile of HELPER.tileArray('selected'))
            tile.updateIfInPlace();
        HELPER.removeClassFromTiles('target');
    },

    swap: function(targetFunction) {
        // test 
        // document.getElementById('hintText').textContent = MOBILE ?
        //     'Tap / Untap to select many' : 'Click / Unclick to select many';

        let tile, target, vacant_tiles = [], target_tiles = [];

        for (tile of HELPER.tileArray('selected')) {
            // target = MOSAIC.dragging.locateTarget(tile);
            target = targetFunction(tile);
            if (target){
                target.appendChild(tile.firstChild);
                target_tiles.push(target);
            }
            else 
                tile.classList.remove('selected');
        }

        for (tile of HELPER.tileArray('selected'))
            if (tile.children.length == 0)
                vacant_tiles.push(tile);

        HELPER.removeClassFromTiles('selected');

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
