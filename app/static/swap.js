

const SWAP = {
    total: 0,
    shift_x0: 0,
    shift_y0: 0,
    shift_t0: 0,
    main_tile: null,
    main_target: null,

    // _isShifting: function() { return this.shift_t0 > 0; },
    _shortTap: function() { return (Date.now() - this.shift_t0) < 200; },

    startShift: function(event) {
        if (this.main_target) return;
        
        tile = this._tileFromEvent(event);
        if (!tile) return;

        tile.style.pointerEvents = 'none';
        this.main_tile = tile;
        this.main_target = tile;
        this.main_tile.dataset.x = this.main_tile.dataset.x0
        this.main_tile.dataset.y = this.main_tile.dataset.y0
        this.shift_x0 = event.clientX;
        this.shift_y0 = event.clientY;
        this.shift_t0 = Date.now();
        this.main_tile.createDuplicate();
        TILES.getArray('selected').forEach((t) => t.createDuplicate());
    },

    moveShift: function(event) {
        if (!this.main_target) return;
        let dx = event.clientX - this.shift_x0,
            dy = event.clientY - this.shift_y0;
        this.main_tile.style.left = Number(this.main_tile.dataset.x0) + dx + 'px';
        this.main_tile.style.top = Number(this.main_tile.dataset.y0) + dy + 'px';
        this._shiftSelected(dx, dy);
        
        if (!this._shortTap()) {
            target = this._tileFromEvent(event);
            if (!target) target = this.main_tile;
            this._resetTargets(target);
        }
    },

    stopShift: function() {
        if (!this.main_target) return;
        this.main_tile.style.left = this.main_tile.dataset.x + 'px';
        this.main_tile.style.top = this.main_tile.dataset.y + 'px';

        if (this._shortTap()) this._toggleMainTileSelection();
        if (this.main_tile != this.main_target) this._swapSelected();  // swap changes selection
        else TILES.getArray('selected').forEach((t) => t.resetShift());

        if (!this._shortTap() && TILES.getArray('selected').length == 1)
            TILES.removeClassFromTiles('selected');
        TILES.removeClassFromTiles('target');
        TILES.getArray('duplicate').forEach((t) => { t.remove() });

        this.main_target = null;
        this.main_tile.style.pointerEvents = '';
        this.shift_t0 = 0;
    },

    _toggleMainTileSelection: function(tile) {
        if (!this.main_tile.classList.contains('selected'))
            this.main_tile.classList.add('selected');
        else this.main_tile.classList.remove('selected');
    },

    _shiftSelected: function(dx, dy) { 
        if (!this._shortTap())
            this.main_tile.classList.add('selected');
        for (tile of TILES.getArray('selected')) {
            tile.style.left = Number(tile.dataset.x) + dx + 'px';
            tile.style.top = Number(tile.dataset.y) + dy + 'px';
        }
    },

    _resetTargets: function(new_target) {
        if (new_target == this.main_target) return;
        this.main_target = new_target;

        let tile, target;
        TILES.removeClassFromTiles('target');
        for (tile of TILES.getArray('selected')) {
            target = this._getTarget(tile);
            if (target && !target.classList.contains('selected'))
                target.classList.add('target');
        }
    },

    _getTarget: function(tile) {
        let dx = Number(this.main_target.dataset.x0) - Number(this.main_tile.dataset.x0),
            dy = Number(this.main_target.dataset.y0) - Number(this.main_tile.dataset.y0);
        return GRID.findClose(Number(tile.dataset.x) + dx, Number(tile.dataset.y) + dy);
    },

    _swapSelected: function() {
        this.total += 1;
        let tile, target, vacant_tiles = [], target_tiles = [];

        for (tile of TILES.getArray('selected')) {
            target = this._getTarget(tile);
            tile.resetShift();  ///////////////////////////// and rotation
            if (target){
                target.appendChild(tile.firstChild);
                target_tiles.push(target);
            }
            else {
                tile.classList.remove('selected');
            }
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
            target.updateIfInPlace();
        }
    },

    rotateStep: function(positive) {
        if (this._shortTap() || !this.main_target) return;
        let coef = positive ? 1 : -1;
        TILES.getArray('selected').forEach(
            (t) => t.rotateAgainst(this.main_tile, coef));
    },

    // for double fingers
    angle: 0,
    rotate_x0: 0,  // vector
    rotate_y0: 0,

    startRotate: function(event) {
        this.angle = 0;
        this.rotate_x0 = event.touches[1].clientX - event.touches[0].clientX;
        this.rotate_y0 = event.touches[1].clientY - event.touches[0].clientY;
    },

    moveRotate: function(event) {
        if (!this.main_target) return;
        let x = event.touches[1].clientX - event.touches[0].clientX,
            y = event.touches[1].clientY - event.touches[0].clientY,
            alpha = this._angelBetweenVectors(this.rotate_x0, this.rotate_y0, x, y);
        if (Math.abs(alpha - this.angle) > 10) {
            this.rotateStep(alpha > this.angle);
            this.angle = alpha;
        }
    },

    _angelBetweenVectors: function(x1, y1, x2, y2) {
        let angle = Math.atan2(y2, x2) - Math.atan2(y1, x1);
        angle = angle * (180 / Math.PI);
        if (angle > 180) angle -= 360;
        if (angle < -180) angle += 360;
        return angle;
    },

    _tileFromEvent: function(event) {
        let x = event.clientX, y = event.clientY,
            elem = document.elementFromPoint(x, y);
        if (elem.parentElement.classList.contains('tile'))
            return elem.parentElement;
    }
};
