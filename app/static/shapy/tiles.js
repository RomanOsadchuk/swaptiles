

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
        if (extra_class)
           tile.classList.add(extra_class);

        tile.dataset.x0 = x;
        tile.dataset.y0 = y;
        tile.style.left = x + 'px';
        tile.style.top = y + 'px';

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



HTMLElement.prototype.select = function() {
    this.dataset.x = this.dataset.x0;
    this.dataset.y = this.dataset.y0;
    this.dataset.apriori_selected = this.classList.contains('selected') ? 'yes' : '';
    this.classList.add('selected');

    let pic = this.firstChild;
    pic.dataset.apriori_rotation = pic.dataset.rotation;
};


HTMLElement.prototype.shift = function(dx, dy) {
    this.style.left = Number(this.dataset.x) + dx + 'px';
    this.style.top = Number(this.dataset.y) + dy + 'px';
};


HTMLElement.prototype.toggleSelection = function() {
    if (this.dataset.apriori_selected)
        this.classList.remove('selected');
    else this.classList.add('selected');
};


HTMLElement.prototype.resetPosition = function(reset_rotation) {
    this.style.left = this.dataset.x0 + 'px';
    this.style.top = this.dataset.y0 + 'px';
    if (reset_rotation) {
        let pic = this.firstChild;
        pic.dataset.rotation = pic.dataset.apriori_rotation;
        pic.style.transform = 'rotate(' + pic.dataset.rotation + 'deg)';
    }
};


HTMLElement.prototype.removeIfInPlace = function() {
    _outPhaseTriangeRotation(this);
    let tile_position = this.dataset.x0 + '_' + this.dataset.y0,
        picture_data = this.firstChild.dataset;

    if (picture_data.position == tile_position && picture_data.rotation == '0') {
        GRID.tiles[tile_position] = null;
        this.remove();
    }
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
    this.removeIfInPlace();
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
    if (GRID.tile_shape.name != 'TRIANGLE') return;
    let true_tile = GRID.tiles[tile.firstChild.dataset.position],
        path_off_phase = (true_tile.classList.contains('triangle-A-path')
                          != tile.classList.contains('triangle-A-path')),
        rotation_off_phase = Number(tile.firstChild.dataset.rotation) % 120 != 0;

    if (path_off_phase != rotation_off_phase)
        tile.rotateDegree(180, skip_check=true);
};
