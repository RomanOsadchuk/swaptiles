

var SHAPE = 'HEXAGON',  // CAPS to hint global
    SIZE = 250,
    ROTATION = false,
    _tap_detection = 0;


function CREATE_TILE(x, y, pictureSrc, clip_path) {
    let tile = document.createElement('div'),
        picture = document.createElement('img');

    picture.src = pictureSrc;
    picture.dataset.rotation = '0';
    picture.dataset.position = x + '_' + y;

    tile.classList.add('tile');
    tile.appendChild(picture);

    tile.dataset.x = x;
    tile.dataset.y = y;
    tile.style.left = x + 'px';
    tile.style.top = y + 'px';
    if (clip_path)
       tile.classList.add(clip_path);

    tile.oncontextmenu = (e) => { return false; };
    tile.onmousedown = tileMousedown;
    tile.onwheel = tileWheel;
    tile.addEventListener("touchstart", tileTouchstart);
    tile.addEventListener("touchend", tileTouchend);

    return tile;
}


HTMLElement.prototype.updateIfInPlace = function() {
    _outPhaseTriangeRotation(this);
    let tilePosition = this.dataset.x + '_' + this.dataset.y,
        pictureData = this.firstChild.dataset;

    if (pictureData.position == tilePosition && pictureData.rotation == '0') {
        this.classList.add('in-place');
        this.classList.remove('selected');
        MOSAIC.checkIfCompleted();
    }
    else
        this.classList.remove('in-place');
}


HTMLElement.prototype.selectIfNotInPlace = function() {
    if (!this.classList.contains('in-place'))
        this.classList.add('selected');
}


HTMLElement.prototype.toggleSelection = function() {
    if (this.classList.contains('selected'))
        this.classList.remove('selected');
    else
        this.selectIfNotInPlace();
}


HTMLElement.prototype.shift = function(dx, dy) {
    this.style.left = Number(this.dataset.x) + dx + 'px';
    this.style.top = Number(this.dataset.y) + dy + 'px';
}


HTMLElement.prototype.rotateStep = function(positive) {
    let degree_map = {'TRIANGLE': 120, 'SQUARE': 90, 'HEXAGON': 60},
        absoluteDegree = degree_map[SHAPE];
    this.rotateDegree(positive ? absoluteDegree : -absoluteDegree);
}


HTMLElement.prototype.rotateRandom = function() {
    let degree_map = {'TRIANGLE': [0, 120, 240],
                      'SQUARE': [0, 90, 180, 270],
                      'HEXAGON': [0, 60, 120, 180, 240, 300]},
        options = degree_map[SHAPE];
    this.rotateDegree(options[Math.floor(Math.random() * options.length)]);
}


HTMLElement.prototype.rotateDegree = function(deltaDegree) {
    let picture = this.firstChild,
        newDegree = (Number(picture.dataset.rotation) + deltaDegree) % 360;

    picture.dataset.rotation = newDegree;
    picture.style.transform = 'rotate(' + newDegree + 'deg)';
    this.updateIfInPlace();

}


function tileMousedown(event) {
    event.preventDefault();
    if (event.button == 0)
        this.selectIfNotInPlace();
    if (event.button == 1)
        this.toggleSelection();
}


function tileWheel(event) {
    if (!ROTATION || this.classList.contains('in-place'))
        return;
    event.preventDefault();
    this.rotateStep(event.deltaX > 0 || event.deltaY > 0);
}


function tileTouchstart(event) {
    if (this.classList.contains('in-place'))
        return;
    event.preventDefault();
    this.selectIfNotInPlace();
    _tap_detection = Date.now();
}


function tileTouchend(event) {
    if (this.classList.contains('in-place'))
        return;
    if (ROTATION && (Date.now() - _tap_detection) < 100)
        this.rotateStep(true);
}


function _outPhaseTriangeRotation(tile) {
    if (SHAPE != 'TRIANGLE')
        return;
    let x_div = Number(tile.dataset.x),
        x_img = Number(tile.firstChild.dataset.position.split('_')[0]),
        rot = Number(tile.firstChild.dataset.rotation),
        dx_in_phase = (x_div - x_img) % SIZE == 0,
        rotation_in_phase = rot % 120 == 0;
    if (dx_in_phase != rotation_in_phase)
        tile.rotateDegree(180);
}
