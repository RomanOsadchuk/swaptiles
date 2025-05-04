const ROOT_3 = Math.sqrt(3);


var Square = () => {
    return {
        tile_width: SIZE,
        tile_height: SIZE,
        offset_x: SIZE,
        offset_y: SIZE,
        x0AgainstRoot: function(root_width) {
            return Math.floor(root_width % this.tile_width / 2);
        },
        y0AgainstRoot: function(root_height) {
            return Math.floor(root_height % this.tile_height / 2);
        }
    }
},
    Hexagon = () => {
    return {
        tile_width: SIZE,
        tile_height: Math.floor(SIZE * 2 / ROOT_3),
        offset_x: SIZE,
        offset_y: Math.floor(SIZE * 3 / ROOT_3),
        clip_path: 'hexagon-path',
        shifted_row: {  // even row
            offset_x: SIZE / 2,  // todo - check SIZE is even
            offset_y: Math.floor(SIZE * ROOT_3 / 2),
            clip_path: 'hexagon-path'
        },
        x0AgainstRoot: function(root_width) {
            // first check how many space left on shifted row
            let temp = (root_width - this.shifted_row.offset_x) % this.offset_x;
            if (temp + this.shifted_row.offset_x > this.tile_width) 
                // one more tile on regular row fits
                temp = temp + this.shifted_row.offset_x - this.tile_width;
            return Math.floor(temp / 2);
        },
        y0AgainstRoot: function(root_height) {  // same as for width
            let temp = (root_height - this.shifted_row.offset_y) % this.offset_y;
            if (temp + this.shifted_row.offset_y > this.tile_height)
                temp = temp + this.shifted_row.offset_y - this.tile_height;
            return Math.floor(temp / 2);
        }
    }
},
    Triangle = () => {
        let hex = Hexagon()  // inherited due to same shifted_row logic
        hex.offset_y = Math.floor(SIZE * ROOT_3 / 2);
        hex.shifted_row.offset_y = Math.floor(SIZE / ROOT_3 / 2);
        hex.clip_path = 'triangle-V-path';
        hex.shifted_row.clip_path = 'triangle-A-path';
        return hex
};


const MOSAIC = {
    shape: null,  // dynamic strategic polimorphism
    tiles: {},  // handy mapping by coordinates
    root: document.getElementById('mosaic'),
    image: document.getElementById('fullImage'),

    initiating: {
        go: function() {
            MOSAIC.image.onload = MOSAIC.initiating.go;
            if (MOSAIC.cropping.resizeToFitScreen())
                return;  // image reloaded if true

            MOSAIC.initiating.detectShape();
            MOSAIC.initiating.clean();
            MOSAIC.dragging.initiate();
            MOSAIC.cropping.go();
            MOSAIC.swapping.shuffle();
            MOSAIC.framing.go();
        },
        detectShape: function() {
            if (SHAPE == 'SQUARE')
                MOSAIC.shape = Square();
            if (SHAPE == 'HEXAGON')
                MOSAIC.shape = Hexagon();
            if (SHAPE == 'TRIANGLE')
                MOSAIC.shape = Triangle();
        },
        clean: function() {
            MOSAIC.tiles = {};
            while (MOSAIC.root.firstChild)
                MOSAIC.root.removeChild(MOSAIC.root.firstChild);
        }
    },

    checkIfCompleted: function() {
        if (MOSAIC.root.children.length != MOSAIC.UTILS.tileArray('in-place').length)
            return;
        MOSAIC.initiating.clean();
        let pic = document.createElement('img');
        pic.src = MOSAIC.image.src;
        MOSAIC.root.appendChild(pic);
    },

    cropping: {
        canvas: document.getElementById('canvas'),

        go: function() {
            let x0 = MOSAIC.shape.x0AgainstRoot(MOSAIC.image.width),
                y0 = MOSAIC.shape.y0AgainstRoot(MOSAIC.image.height);
            this.setElementSizes();
            this.periodic(x0, y0, MOSAIC.shape.clip_path);
            if (MOSAIC.shape.shifted_row)
                this.periodic(x0 + MOSAIC.shape.shifted_row.offset_x,
                              y0 + MOSAIC.shape.shifted_row.offset_y,
                              MOSAIC.shape.shifted_row.clip_path);
        },

        setElementSizes: function() {
            MOSAIC.root.classList.remove('hexagon');
            MOSAIC.root.style.width = MOSAIC.image.width + 'px';
            MOSAIC.root.style.height = MOSAIC.image.height + 'px';
            this.canvas.width = MOSAIC.shape.tile_width;
            this.canvas.height = MOSAIC.shape.tile_height;
        },

        periodic: function(x0, y0, clip_path) {
            let ctx = this.canvas.getContext('2d'), x = x0, y = y0;

            while (true) {
                ctx.drawImage(MOSAIC.image, x, y, this.canvas.width, this.canvas.height,
                                            0, 0, this.canvas.width, this.canvas.height);
                MOSAIC.root.appendChild(CREATE_TILE(x, y,
                    this.canvas.toDataURL('image/jpeg'),
                    clip_path));
                MOSAIC.tiles[`${x}_${y}`] = MOSAIC.root.lastChild;

                x += MOSAIC.shape.offset_x;
                if (x + MOSAIC.shape.tile_width <= MOSAIC.image.width)
                    continue;

                x = x0;  y += MOSAIC.shape.offset_y;
                if (y + MOSAIC.shape.tile_height <= MOSAIC.image.height)
                    continue;

                break;
            }
        },

        resizeToFitScreen() {
            if (MOSAIC.image.width <= window.innerWidth)
                return false;

            let ratio = window.innerWidth / MOSAIC.image.width,
                ctx = this.canvas.getContext('2d');
            
            this.canvas.width = window.innerWidth;
            this.canvas.height = MOSAIC.image.height * ratio;
            ctx.drawImage(MOSAIC.image, 0, 0, this.canvas.width, this.canvas.height);

            MOSAIC.image.src = this.canvas.toDataURL('image/jpeg');
            return true;
        }
    },

    dragging: {
        start_x: null,
        start_y: null,
        is_moving: false,

        initiate: function(event) {
            if (MOSAIC.root.onmousedown)
                return;
            MOSAIC.root.onmousedown = this.start;
            MOSAIC.root.onmousemove = this.move;
            MOSAIC.root.onmouseup = this.stop;
            MOSAIC.root.onmouseleave = this.stop;

            MOSAIC.root.addEventListener("touchstart", this.start);
            MOSAIC.root.addEventListener("touchmove", this.move);
            MOSAIC.root.addEventListener("touchend", this.stop);
            MOSAIC.root.addEventListener("touchcancel", this.stop);
        },

        start: function(event) {
            if (event.button == 1)
                return;
            if (event.touches) event = event.touches[0];
            this.start_x = event.clientX;
            this.start_y = event.clientY;
            this.is_moving = true;
        },

        move: function(event) {
            if (event.touches) event = event.touches[0];
            let dx = event.clientX - this.start_x,
                dy = event.clientY - this.start_y;
            if (this.is_moving) {
                MOSAIC.swapping.snap(dx, dy);
                MOSAIC.UTILS.tileArray('selected').forEach(
                    (tile) => tile.shift(dx, dy));
            }
        },

        stop: function(event) {
            if (this.is_moving) {
                this.is_moving = false;
                MOSAIC.UTILS.tileArray('selected').forEach(
                    (tile) => tile.shift(0, 0));
                MOSAIC.swapping.go();
            }
        }
    },

    swapping: {
        delta_n: 0,  // x
        delta_m: 0,  // y,

        snap: function(dx_total, dy_total) {
            let w = MOSAIC.shape.offset_x,
                h = MOSAIC.shape.offset_y,
                new_delta_n, new_delta_m;

            // if (MOSAIC.shape.shifted_row)  w = w / 2;  // SHAPE != 'SQUARE' [link K]
            if (MOSAIC.shape.shifted_row)  h = h / 2;

            new_delta_n = MOSAIC.UTILS.snap1D(dx_total, MOSAIC.shape.tile_width);
            new_delta_m = MOSAIC.UTILS.snap1D(dy_total, h);
        
            if (new_delta_n != this.delta_n || new_delta_m != this.delta_m) {
                this.delta_n = new_delta_n;
                this.delta_m = new_delta_m;
                this.resetTargets();
            }
        },

        locateTarget: function(tile) {
            let x0 = MOSAIC.shape.x0AgainstRoot(MOSAIC.image.width), target,
                x, y, target_x, target_y, tile_shifted = false;
            x = Number(tile.dataset.x);
            y = Number(tile.dataset.y);
            tile_shifted = ((x - x0) % MOSAIC.shape.tile_width) > 0;

            if (SHAPE == 'SQUARE') {
                target_x = x + MOSAIC.shape.offset_x * this.delta_n;
                target_y = y + MOSAIC.shape.offset_y * this.delta_m;
            }
            else {  // MOSAIC.shape.shifted_row - true [link K]
                if (this.delta_m % 2 == 0)  {// resonating with cropping periodic
                    target_x = x + MOSAIC.shape.offset_x * this.delta_n;
                    target_y = y + MOSAIC.shape.offset_y * this.delta_m / 2;
                }
                else {// off phase  (1. periodic shift)
                    target_x = x + MOSAIC.shape.offset_x * this.delta_n;
                    target_y = y + MOSAIC.shape.offset_y * (this.delta_m - 1) / 2;
                    if (tile_shifted) {  // 2. tune shifted offset 
                        target_x = target_x + MOSAIC.shape.offset_x - MOSAIC.shape.shifted_row.offset_x;
                        target_y = target_y + MOSAIC.shape.offset_y - MOSAIC.shape.shifted_row.offset_y;
                    }
                    else {
                        target_x = target_x + MOSAIC.shape.shifted_row.offset_x;
                        target_y = target_y + MOSAIC.shape.shifted_row.offset_y;
                    }
                }
            }
            target = MOSAIC.tiles[`${target_x}_${target_y}`];
            if (target && !target.classList.contains('in-place'))
                return target;

        },

        resetTargets: function() {
            let tile, target;
            MOSAIC.UTILS.removeClassFromTiles('target');

            for (tile of MOSAIC.UTILS.tileArray('selected')) {
                target = this.locateTarget(tile);
                if (target)
                    target.classList.add('target');
            }
        },

        go: function() {
            let tile;
            MOSAIC.UTILS.removeClassFromTiles('target');
            this.swap();
            for (tile of MOSAIC.UTILS.tileArray('selected'))
                tile.updateIfInPlace();
            if (MOSAIC.UTILS.tileArray('selected').length == 1)
                MOSAIC.UTILS.removeClassFromTiles('selected');
        },

        swap: function() {
            let tile, target, vacant_tiles = [], target_tiles = [];

            for (tile of MOSAIC.UTILS.tileArray('selected')) {
                target = this.locateTarget(tile);
                if (target){
                    target.appendChild(tile.firstChild);
                    target_tiles.push(target);
                }
                else
                    tile.classList.remove('selected');
            }

            for (tile of MOSAIC.UTILS.tileArray('selected'))
                if (tile.children.length == 0)
                    vacant_tiles.push(tile);

            MOSAIC.UTILS.removeClassFromTiles('selected');

            for (target of target_tiles) {
                if (target.children.length == 2) {
                    tile = vacant_tiles.pop()
                    tile.appendChild(target.firstChild)
                    tile.updateIfInPlace();
                }
                target.classList.add('selected');
            }
            this.delta_n = 0;
            this.delta_m = 0;
        },

        shuffle: function() {
            let tiles = Array.from(document.getElementsByClassName('tile')),
                currentTile = tiles.splice(0, 1)[0], nextTile, randomIndex, r;

            while (tiles.length > 0) {
                randomIndex = Math.floor(Math.random() * tiles.length);
                nextTile = tiles.splice(randomIndex, 1)[0];
                currentTile.appendChild(nextTile.firstChild);
                nextTile.appendChild(currentTile.firstChild);

                if (ROTATION) currentTile.rotateRandom()
                else currentTile.updateIfInPlace();
                
                currentTile = nextTile;
            }
            currentTile.updateIfInPlace();
        }
    },

    framing: {
        canvas: document.getElementById('canvas'),

        go: function() {
            let ctx = this.canvas.getContext('2d'), tile;
            ctx.fillStyle = '#f00';
            this.canvas.width = MOSAIC.image.width;
            this.canvas.height = MOSAIC.image.height;
            ctx.drawImage(MOSAIC.image, 0, 0, this.canvas.width, this.canvas.height,
                                        0, 0, this.canvas.width, this.canvas.height);

            for (tile of document.getElementsByClassName('tile'))
                if (SHAPE == 'SQUARE')
                    this.cutOffSquare(ctx, tile);
                else if (SHAPE == 'HEXAGON')
                    this.cutOffHexagon(ctx, tile);
                else
                    this.cutOffTriangle(ctx, tile);

            let pic = document.createElement('img');
            pic.src = this.canvas.toDataURL('image/jpeg');

            let frame = document.createElement('div');
            frame.classList.add('in-place');
            frame.appendChild(pic);
            MOSAIC.root.appendChild(frame);
        },

        cutOffSquare: function(ctx, tile) {
            let x = Number(tile.dataset.x),
                y = Number(tile.dataset.y);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + SIZE, y);
            ctx.lineTo(x + SIZE, y + SIZE);
            ctx.lineTo(x, y + SIZE);
            ctx.closePath();
            ctx.fill();
        },

        cutOffHexagon: function(ctx, tile) {
            let x = Number(tile.dataset.x),
                y = Number(tile.dataset.y),
                q = Math.floor(MOSAIC.shape.tile_height / 4);
            ctx.beginPath();
            ctx.moveTo(x + Math.floor(SIZE / 2), y);
            ctx.lineTo(x + SIZE, y + q);
            ctx.lineTo(x + SIZE, y + q * 3);
            ctx.lineTo(x + Math.floor(SIZE / 2), y + MOSAIC.shape.tile_height);
            ctx.lineTo(x, y + q * 3);
            ctx.lineTo(x, y + q);
            ctx.closePath();
            ctx.fill();
        },

        cutOffTriangle: function(ctx, tile) {
            let x = Number(tile.dataset.x),
                y = Number(tile.dataset.y),
                q = Math.floor(MOSAIC.shape.tile_height / 4);

            if (tile.classList.contains('triangle-V-path')) {  // polygon(0% 25%, 100% 25%, 50% 100%)
                ctx.moveTo(x, y + q);
                ctx.lineTo(x + SIZE, y + q);
                ctx.lineTo(x + Math.floor(SIZE / 2), y + MOSAIC.shape.tile_height);
            }
            else {  // polygon(0% 75%, 100% 75%, 50% 0%)
                ctx.moveTo(x, y + q * 3);
                ctx.lineTo(x + SIZE, y + q * 3);
                ctx.lineTo(x + Math.floor(SIZE / 2), y);
            }
            ctx.closePath();
            ctx.fill();
        }
    },

    rotating: { reference_tile: null, positive: true },

    UTILS: {
        tileArray: function(class_name) {
            class_name = class_name || 'tile';
            return Array.from(document.getElementsByClassName(class_name));
        },
        removeClassFromTiles(class_name) {
            this.tileArray(class_name).forEach(
                (t) => t.classList.remove(class_name));
        },
        snap1D: function(distance, period) {
            let adjusted = distance + period / 2;
            return Math.floor(adjusted / period);
        }
    }
};



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
