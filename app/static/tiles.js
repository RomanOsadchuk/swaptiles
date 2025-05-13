

const TILES = {
    rotation: false,

    create: function(x, y, picture_src, extra_class) {
        let tile = document.createElement('div'),
            picture = document.createElement('img');

        picture.src = picture_src;
        picture.dataset.rotation = '0';
        picture.dataset.position = x + '_' + y;

        tile.classList.add('tile');
        tile.appendChild(picture);

        tile.dataset.x0 = x;  // for rotate many
        tile.dataset.y0 = y;

        tile.dataset.x = x;
        tile.dataset.y = y;
        tile.style.left = x + 'px';
        tile.style.top = y + 'px';
        if (extra_class)
           tile.classList.add(extra_class);

        tile.oncontextmenu = (e) => { return false; };
        return tile;
    },

    getArray: function(class_name) {
        class_name = class_name || 'tile';
        return Array.from(document.getElementsByClassName(class_name));
    },

    removeClassFromTiles: function(class_name) {
        TILES.getArray(class_name).forEach(
            (t) => t.classList.remove(class_name));
    },

    fitImageAndShuffle: function() {
        GRID.image.onload = function() {
            GRID.reCrop();
            TILES.shuffle();
        };
        GRID.resizeImage();
    },

    toggleRotationAndShuffle: function(size) {
        this.rotation = !this.rotation;
        GRID.reCrop();
        TILES.shuffle();
    },

    resizeAndShuffle: function(size) {
        GRID.resizeTile(size);
        TILES.shuffle();
    },

    reshapeAndShuffle: function(shape) {
        GRID.reshapeTiles(shape);
        TILES.shuffle();
    },

    shuffle: function() {
        let tiles = TILES.getArray(),
            next_tile, random_index,
            current_tile = tiles.splice(0, 1)[0];

        while (tiles.length > 0) {
            random_index = Math.floor(Math.random() * tiles.length);
            next_tile = tiles.splice(random_index, 1)[0];
            current_tile.appendChild(next_tile.firstChild);
            next_tile.appendChild(current_tile.firstChild);
            if (this.rotation) current_tile.rotateRandom();
            _outPhaseTriangeRotation(current_tile);
            current_tile = next_tile;
        }
    }
};



HTMLElement.prototype.updateIfInPlace = function() {
    _outPhaseTriangeRotation(this);
    let tile_position = this.dataset.x0 + '_' + this.dataset.y0,
        picture_data = this.firstChild.dataset;

    if (picture_data.position == tile_position && picture_data.rotation == '0') {
        GRID.tiles[tile_position] = null;
        this.remove();
    }
};


HTMLElement.prototype.shift = function(dx, dy) {
    this.style.left = Number(this.dataset.x_) + dx + 'px';
    this.style.top = Number(this.dataset.y_) + dy + 'px';
};


HTMLElement.prototype.deShift = function(dx, dy) {
    this.style.left = this.dataset.x + 'px';
    this.style.top = this.dataset.y + 'px';
    this.firstChild.dataset.rotation = this.dataset.r_ || '0';
    this.firstChild.style.transform = 'rotate(' + this.dataset.r_ + 'deg)';
};


HTMLElement.prototype.resetShift = function() {
    this.dataset.x = this.dataset.x0;
    this.dataset.y = this.dataset.y0;
    this.style.left = this.dataset.x + 'px';
    this.style.top = this.dataset.y + 'px';  // + rotation
};


HTMLElement.prototype.rotateAgainst = function(ref_tile, coef) {
    this.rotateStep(coef > 0, true);
    if (this == ref_tile) return;

    let rm = GRID.tile_shape.rotation_matrix,
        x = Number(this.dataset.x),
        y = Number(this.dataset.y),
        x_ref = Number(ref_tile.dataset.x),
        y_ref = Number(ref_tile.dataset.y),
        dx = x - x_ref, dy = y - y_ref;

    this.dataset.x = Math.floor(x_ref + rm[0][0] * dx + coef * rm[0][1] * dy);
    this.dataset.y = Math.floor(y_ref + coef * rm[1][0] * dx + rm[1][1] * dy);
    // this.dataset.x_ = Math.floor(x_ref - coef * dy);
    // this.dataset.y_ = Math.floor(y_ref + coef * dx);
};


HTMLElement.prototype.rotateStep = function(positive, skip_check) {
    let degree = GRID.tile_shape.rotation_degree;
    this.rotateDegree(positive ? degree : -degree, skip_check);
};


HTMLElement.prototype.rotateRandom = function() {
    this.rotateDegree(GRID.tile_shape.getRandomRotation());
};


HTMLElement.prototype.rotateDegree = function(deltaDegree, skip_check) {
    let picture = this.firstChild,
        newDegree = (Number(picture.dataset.rotation) + deltaDegree) % 360;

    picture.dataset.rotation = newDegree;
    picture.style.transform = 'rotate(' + newDegree + 'deg)';
    if (skip_check == true) return;
    this.updateIfInPlace();
};


HTMLElement.prototype.createDuplicate = function() {
    let duplicate = TILES.create(this.dataset.x0, this.dataset.y0,
                                 this.firstChild.src, 'duplicate'),
        rot = this.firstChild.dataset.rotation;
    duplicate.firstChild.style.transform = 'rotate(' + rot + 'deg)';
    for (let clip_class of ['hexagon-path', 'triangle-V-path',
                            'square-path', 'triangle-A-path'])
        if (this.classList.contains(clip_class))
            duplicate.classList.add(clip_class);
    GRID.root.appendChild(duplicate);
};


function _outPhaseTriangeRotation(tile) {
    if (GRID.tile_shape.rotation_degree != 120)
        return;
    let x_div = Number(tile.dataset.x0),
        x_img = Number(tile.firstChild.dataset.position.split('_')[0]),
        rot = Number(tile.firstChild.dataset.rotation),
        dx_in_phase = (x_div - x_img) % GRID.tile_size == 0,
        rotation_in_phase = rot % 120 == 0;
    if (dx_in_phase != rotation_in_phase)
        tile.rotateDegree(180);
};
