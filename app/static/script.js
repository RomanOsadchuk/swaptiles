
const SQUARE = 'SQUARE',
      HEXAGON = 'HEXAGON',
      ROOT_3 = Math.sqrt(3);


function tileArray(className) {
    className = className || 'tile';
    return Array.from(document.getElementsByClassName(className));
}


function clearClass(className) {
    tileArray(className).forEach((t) => t.classList.remove(className));
}


const config = {
    shape: SQUARE,
    width: 100,
    rotation: true,

    reSet: function() {
        this.shape =  document.getElementById('shape').value;
        this.width = Number(document.getElementById('widthInput').value);
        this.rotation = document.getElementById('rotation').checked;
    },

    getRotationStep: function(positive) {
        if (!this.rotation)
            return 0;
        if (this.shape == SQUARE)
            return positive ? 90 : -90;
        if (this.shape == HEXAGON)
            return positive ? 60 : -60;
    },

    getRandomRotation: function() {
        if (!this.rotation)
            return 0;
        if (this.shape == SQUARE)
            return [0, 90, 180, 270][Math.floor(Math.random() * 4)];
        if (this.shape == HEXAGON)
            return [0, 60, 120, 180, 240, 300][Math.floor(Math.random() * 6)];
    },

    overlapHeight: function() {
        if (this.shape == SQUARE)
            return 0;
        return Math.floor(this.width / ROOT_3 / 2);
    },

    offsetHeight: function() {
        if (this.shape == SQUARE)
            return this.width;
        return this.overlapHeight() * 3;
        // return Math.floor(this.width * 3 / ROOT_3 / 2);
    },

    cropHeight: function() {
        if (this.shape == SQUARE)
            return this.width;
        return this.overlapHeight() * 4;
        // return Math.floor(this.width * 2 / ROOT_3);
    },

    extraLeftOffset: function(yOffset) {
        let evenRow = (yOffset / this.offsetHeight() % 2) == 1;
        if (evenRow && this.shape == HEXAGON)
            return Math.floor(this.width / 2);
        return 0;
    }
};


const cropping = {
    canvas: document.getElementById('canvas'),
    grid: document.getElementById('grid'),
    fullImage: new Image(),
    tiles: {},
    x0: 0,
    y0: 0,

    reCrop: function() {
        this.grid.style.width = this.fullImage.width + 'px';
        this.grid.style.height = this.fullImage.height + 'px';
        if (config.shape == SQUARE)
            this.grid.classList.remove('hexagon');
        else 
            this.grid.classList.add('hexagon');

        this.tiles = {}
        while (this.grid.firstChild)
            this.grid.removeChild(this.grid.firstChild);
        this.cropFullImage();
    },

    cropFullImage: function() {
        this.canvas.width = config.width;
        this.canvas.height = config.cropHeight();
        this.setFirstTileCoordinates();

        let ctx = this.canvas.getContext('2d'), 
            x = this.x0 - config.width, y = this.y0;
            
        while (true) {
            [x, y] = this.getNextTileCoordinates(x, y);
            if (x == null)
                break;

            ctx.drawImage(this.fullImage, x, y, this.canvas.width, this.canvas.height,
                                          0, 0, this.canvas.width, this.canvas.height);
            this.createTile(x, y);
        }
        this.createFrame();
    },

    setFirstTileCoordinates: function() {
        if (config.shape == SQUARE) {
            this.x0 = Math.floor(this.fullImage.width % config.width / 2);
            this.y0 = Math.floor(this.fullImage.height % config.offsetHeight() / 2);
        }
        
        else {
            let temp = this.fullImage.height - config.overlapHeight();
            this.y0 = Math.floor(temp % config.offsetHeight() / 2);

            temp = this.fullImage.width % config.width;
            if (temp < config.width / 2)
                this.x0 = Math.floor(temp / 2);
            else
                this.x0 = Math.floor((temp - (config.width / 2)) / 2);
        }
    },

    getNextTileCoordinates: function(x, y) {
        let nextX = x + config.width,
            nextY = y + config.offsetHeight();

        if (nextX + config.width <= this.fullImage.width)
            return[nextX, y];
        if (nextY + config.cropHeight() <= this.fullImage.height)
            return[config.extraLeftOffset(nextY - this.y0) + this.x0, nextY];

        return [null, null];
    },

    createTile: function(x, y) {
        let pic = document.createElement('img');
        pic.src = this.canvas.toDataURL('image/jpeg');
        pic.dataset.rotation = 0;
        pic.dataset.position = x + '_' + y;

        let tile = document.createElement('div');
        tile.classList.add('tile');
        tile.appendChild(pic);
        this.grid.appendChild(tile);
        this.tiles[x + '_' + y] = tile;

        tile.dataset.x = x;
        tile.dataset.y = y;
        tile.style.left = x + 'px';
        tile.style.top = y + 'px';
        tileUpdating.bind(tile);
    },

    // frame

    createFrame: function() {
        let ctx = this.canvas.getContext('2d'), tile;
        ctx.fillStyle = '#f00';
        this.canvas.width = this.fullImage.width;
        this.canvas.height = this.fullImage.height;
        ctx.drawImage(this.fullImage, 0, 0, this.canvas.width, this.canvas.height,
                                      0, 0, this.canvas.width, this.canvas.height);

        for (tile of document.getElementsByClassName('tile')) {
            if (config.shape == HEXAGON)
                this.cutOffHexagon(ctx, tile);
            if (config.shape == SQUARE)
                this.cutOffSquare(ctx, tile);
        }

        let pic = document.createElement('img');
        pic.src = this.canvas.toDataURL('image/jpeg');

        let frame = document.createElement('div');
        frame.classList.add('in-place');
        frame.appendChild(pic);
        this.grid.appendChild(frame);
    },

    cutOffHexagon: function(ctx, tile) {
        let x = Number(tile.dataset.x),
            y = Number(tile.dataset.y);
        ctx.beginPath();
        ctx.moveTo(x + Math.floor(config.width / 2), y);
        ctx.lineTo(x + config.width, y + config.overlapHeight());
        ctx.lineTo(x + config.width, y + config.offsetHeight());
        ctx.lineTo(x + Math.floor(config.width / 2), y + config.cropHeight());
        ctx.lineTo(x, y + config.offsetHeight());
        ctx.lineTo(x, y + config.overlapHeight());
        ctx.closePath();
        ctx.fill();
    },

    cutOffSquare: function(ctx, tile) {
        let x = Number(tile.dataset.x),
            y = Number(tile.dataset.y);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + config.width, y);
        ctx.lineTo(x + config.width, y + config.cropHeight());
        ctx.lineTo(x, y + config.cropHeight());
        ctx.closePath();
        ctx.fill();
    },

    finish: function() {
        this.tiles = {}
        while (this.grid.firstChild)
            this.grid.removeChild(this.grid.firstChild);
        let pic = document.createElement('img');
        pic.src = this.fullImage.src;
        this.grid.appendChild(pic);
    }
};


const tileUpdating = {

    checkIfInPlace: function(tile) {
        let position = tile.dataset.x + '_' + tile.dataset.y,
            imgData = tile.firstChild.dataset;

        if (imgData.position == position && imgData.rotation == '0') {
            tile.classList.add('in-place');
            tile.classList.remove('selected');
        }
        else
            tile.classList.remove('in-place');

        if (cropping.grid.children.length == tileArray('in-place').length)
            cropping.finish();
    },

    selectIfNotInPlace: function(tile) {
        if (!tile.classList.contains('in-place'))
            tile.classList.add('selected');
    },

    toggleSelection: function(tile) {
        if (tile.classList.contains('selected'))
            tile.classList.remove('selected');
        else
            this.selectIfNotInPlace(tile);
    },

    rotateOne: function(tile, positive) {
        if (tile.classList.contains('in-place'))
            return;

        let pic = tile.firstChild,
            step = config.getRotationStep(positive);
        pic.dataset.rotation = (Number(pic.dataset.rotation) + step) % 360;
        pic.style.transform = 'rotate(' + pic.dataset.rotation + 'deg)';
        this.checkIfInPlace(tile);
    },

    tileMoucedown: function(tile, event) {
        event.preventDefault();
        if (event.button == 0)
            tileUpdating.selectIfNotInPlace(tile);
        if (event.button == 1)
            tileUpdating.toggleSelection(tile);
        if (event.button == 2)
            clearClass('selected');
    },

    tileOnwheel: function(tile, event) {
        event.preventDefault();
        let positive = event.deltaX > 0 || event.deltaY > 0;

        if (event.shiftKey)
            swapping.rotateMany(tile, positive);
        else
            this.rotateOne(tile, positive);
    },

    bind: function(tile) {
        tile.oncontextmenu = (e) => { return false; };
        tile.addEventListener('mousedown', (event) => this.tileMoucedown(tile, event));
        tile.addEventListener('wheel', (event) => this.tileOnwheel(tile, event));
    },

    shift: function(tile, dx, dy) {
        tile.style.left = Number(tile.dataset.x) + dx + 'px';
        tile.style.top = Number(tile.dataset.y) + dy + 'px';
    }

};


const aiming = {
    deltaX: 0,
    deltaY: 0,
    positive: true,
    referenceTile: null,

    reSnap: function(dx, dy) {
        let a = config.offsetHeight(), b = config.width,
            newDeltaX = 0, newDeltaY = 0, dxAjusted;

        if (dy > 0)
            newDeltaY = (Math.floor((dy - a/2) / a) + 1) * a;
        else if (dy < 0)
            newDeltaY = Math.floor((dy + a/2) / a) * a;
        else
            newDeltaY = 0;

        dxAjusted = dx - config.extraLeftOffset(Math.abs(newDeltaY)); 
        if (dxAjusted > 0)
            newDeltaX = (Math.floor((dxAjusted - b/2) / b) + 1) * b;
        else if (dxAjusted < 0)
            newDeltaX = Math.floor((dxAjusted + b/2) / b) * b;
        else
            newDeltaX = 0;
        newDeltaX = newDeltaX + config.extraLeftOffset(Math.abs(newDeltaY));

        if (newDeltaY != this.deltaY || newDeltaX != this.deltaX) {
            this.deltaX = newDeltaX;
            this.deltaY = newDeltaY;
            this.resetTargets();
        }
    },

    resetTargets: function() {
        let tile, targetX, targetY, targetTile;
        clearClass('target');

        for (tile of tileArray('selected')) {
            targetX = Number(tile.dataset.x) + this.deltaX;
            targetY = Number(tile.dataset.y) + this.deltaY;

            targetTile = cropping.tiles[targetX + '_' + targetY];
            if (targetTile && !targetTile.classList.contains('in-place')
                           && !targetTile.classList.contains('selected'))
                targetTile.classList.add('target');
        }
    },

    locate: function(tile) {
        let targetX = Number(tile.dataset.x) + this.deltaX,
            targetY = Number(tile.dataset.y) + this.deltaY;
        if (this.referenceTile != null && config.shape == SQUARE)
            [targetX, targetY] = this.locateSquareRotation(tile);
        if (this.referenceTile != null && config.shape == HEXAGON)
            [targetX, targetY] = this.locateHexagonRotation(tile);

        let targetTile = cropping.tiles[targetX + '_' + targetY];
        if (targetTile && !targetTile.classList.contains('in-place'))
            return targetTile;
    },

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

    tuneCoords: function(targetX, targetY) {
        let intX = Math.floor(targetX),
            intY = Math.floor(targetY),
            tuneX, tuneY, i, j;
        for (i = -3; i < 4; i++) {
            tuneX = intX + i;
            for (j = -3; j < 4; j++) {
                tuneY = intY + j;
                if (cropping.tiles[tuneX + '_' + tuneY])
                    return [tuneX, tuneY];
            }
        }
        return [targetX, targetY];
    }
};


const swapping = {

    move: function() {
        aiming.referenceTile = null;
        this.swap();

        aiming.deltaX = 0;
        aiming.deltaY = 0;
        for (tile of tileArray('selected'))
            tileUpdating.checkIfInPlace(tile);

        clearClass('target');
        if (document.getElementsByClassName('selected').length == 1)
            clearClass('selected');
    },

    rotateMany: function(referenceTile, positive) {
        aiming.referenceTile = referenceTile;
        aiming.positive = positive;
        this.swap();

        for (tile of tileArray('selected'))
            tileUpdating.rotateOne(tile, positive);
    },

    swap: function() {
        let vacantTiles = [], extraTiles = [], i = 0;

        for (tile of tileArray('selected')) {
            targetTile = aiming.locate(tile);
            if (targetTile)
                targetTile.appendChild(tile.firstChild);
            else
                tile.classList.remove('selected');
        }

        for (tile of document.getElementsByClassName('tile')) {
            if (tile.childElementCount > 1) {
                tile.classList.add('selected');
                extraTiles.push(tile);
            }
            if (tile.childElementCount == 0) {
                tile.classList.remove('selected');
                vacantTiles.push(tile);
            }
        }

        for (i = 0; i < vacantTiles.length; i++){
            vacantTiles[i].appendChild(extraTiles[i].firstChild);
            tileUpdating.checkIfInPlace(vacantTiles[i]);
        }
    },

    shuffle: function() {
        let tiles = Array.from(document.getElementsByClassName('tile')),
            currentTile = tiles.splice(0, 1)[0], nextTile, randomIndex, r;

        while (tiles.length > 0) {
            randomIndex = Math.floor(Math.random() * tiles.length);
            nextTile = tiles.splice(randomIndex, 1)[0];
            currentTile.appendChild(nextTile.firstChild);
            nextTile.appendChild(currentTile.firstChild);

            currentTile.firstChild.dataset.rotation = r = config.getRandomRotation();
            currentTile.firstChild.style.transform = 'rotate(' + r + 'deg)';
            tileUpdating.checkIfInPlace(currentTile);
            
            currentTile = nextTile;
        }
        tileUpdating.checkIfInPlace(currentTile);
    }
};


const dragging = {
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,

    dragStart: function(event) {
        if (event.button != 0)
            return;

        this.isDragging = true;
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
    },

    dragGo: function(event) {
        if (!this.isDragging)
            return;

        let dx = event.clientX - this.dragStartX,
            dy = event.clientY - this.dragStartY;
        tileArray('selected').forEach((tile) => tileUpdating.shift(tile, dx, dy));
        aiming.reSnap(dx, dy);
    },

    dragStop: function(event) {
        if (!this.isDragging)
            return;

        this.isDragging = false;
        tileArray('selected').forEach((tile) => tileUpdating.shift(tile, 0, 0));
        swapping.move();
    },

    bind: function() {
        cropping.grid.addEventListener('mousedown', dragging.dragStart);
        cropping.grid.addEventListener('mousemove', dragging.dragGo);
        cropping.grid.addEventListener('mouseup', dragging.dragStop);
        cropping.grid.addEventListener('mouseleave', dragging.dragStop);
    }
};


const master = {
    fileInput: document.getElementById('fileInput'),
    reshuffle: document.getElementById('reshuffle'),

    imageChange: function() {
        config.reSet();
        cropping.reCrop();
        swapping.shuffle();
        console.log('image loaded', cropping.fullImage.width, cropping.fullImage.height, cropping.grid.children.length - 1);
    },

    newFileUploaded: function() {
        let file = master.fileInput.files[0],
            reader = new FileReader(),
            details = document.getElementById('details');

        reader.onload = (e) => { cropping.fullImage.src = e.target.result; };

        if (file)
            reader.readAsDataURL(file);

        if (details)
            details.remove();
    },

    initiate: function() {
        dragging.bind();
        cropping.fullImage.onload = master.imageChange;
        cropping.fullImage.src = document.getElementById('originalImage').src;

        this.fileInput.onchange = master.newFileUploaded;
        this.reshuffle.onclick = (e) => { cropping.fullImage.src = cropping.fullImage.src; };
        document.getElementById('widthInput').addEventListener('input', function() {
            document.getElementById('widthValue').textContent = this.value + 'px | ';
        });
    }
};


if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
    document.getElementsByTagName('main')[0].innerHTML = '<p>Developed for desktop</p><p>Check out "Art Heist Puzzle" application</p>';
else
    master.initiate();
