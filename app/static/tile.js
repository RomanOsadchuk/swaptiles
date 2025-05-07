

function CREATE_TILE(x, y, pictureSrc, extra_class) {
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
    if (extra_class)
       tile.classList.add(extra_class);

    tile.oncontextmenu = (e) => { return false; };
    return tile;
}


HTMLElement.prototype.updateIfInPlace = function() {
    _outPhaseTriangeRotation(this);
    let tilePosition = this.dataset.x + '_' + this.dataset.y,
        pictureData = this.firstChild.dataset;

    if (pictureData.position == tilePosition && pictureData.rotation == '0')
        this.remove();
}


HTMLElement.prototype.shift = function(dx, dy) {
    this.style.left = Number(this.dataset.x) + dx + 'px';
    this.style.top = Number(this.dataset.y) + dy + 'px';
}


HTMLElement.prototype.rotateStep = function(positive) {
    this.rotateDegree(positive ? SHAPE.rotation_degree : -SHAPE.rotation_degree);
}


HTMLElement.prototype.rotateRandom = function() {
    this.rotateDegree(SHAPE.getRandomRotation());
}


HTMLElement.prototype.rotateDegree = function(deltaDegree) {
    let picture = this.firstChild,
        newDegree = (Number(picture.dataset.rotation) + deltaDegree) % 360;

    picture.dataset.rotation = newDegree;
    picture.style.transform = 'rotate(' + newDegree + 'deg)';
    this.updateIfInPlace();

}


HTMLElement.prototype.switchSelection = function() {
    if (this.classList.contains('selected'))
         this.classList.remove('selected');
    else this.classList.add('selected');
}


function _outPhaseTriangeRotation(tile) {
    if (SHAPE.rotation_degree != 120)
        return;
    let x_div = Number(tile.dataset.x),
        x_img = Number(tile.firstChild.dataset.position.split('_')[0]),
        rot = Number(tile.firstChild.dataset.rotation),
        dx_in_phase = (x_div - x_img) % SIZE == 0,
        rotation_in_phase = rot % 120 == 0;
    if (dx_in_phase != rotation_in_phase)
        tile.rotateDegree(180);
}
