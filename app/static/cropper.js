
var TILES = {};  // mapping by coordinates


const CROPPER = {
    root: document.getElementById('mosaic'),
    image: document.getElementById('fullImage'),
    canvas: document.getElementById('canvas'),

    go: function() {
    	// can be triggered on new image upload or parametr change
        if (this._resizeToFitScreen())
            return;  // image reloaded if true
        TILES = {};
        this._setElementSizes();

        let x0 = SHAPE.x0AgainstRoot(this.image.width),
            y0 = SHAPE.y0AgainstRoot(this.image.height);
        this._periodicCrop(x0, y0, SHAPE.clip_path);
        if (SHAPE.shifted_row)
            this._periodicCrop(x0 + SHAPE.shifted_row.offset_x,
                               y0 + SHAPE.shifted_row.offset_y,
                               SHAPE.shifted_row.clip_path);
    },

    _setElementSizes: function() {
        this.root.style.width = this.image.width + 'px';  // todo put this.image inside this.root as frame 
        this.root.style.height = this.image.height + 'px';
        this.canvas.width = SHAPE.tile_width;
        this.canvas.height = SHAPE.tile_height;
    },

    _periodicCrop: function(x0, y0, clip_path) {
        let ctx = this.canvas.getContext('2d'), x = x0, y = y0,
            w = SHAPE.tile_width, h = SHAPE.tile_height, imgSrc;

        while (true) {
            ctx.drawImage(this.image, x, y, w, h, 0, 0, w, h);
            imgSrc = this.canvas.toDataURL('image/jpeg');
            TILES[`${x}_${y}`] = CREATE_TILE(x, y, imgSrc, clip_path);
            this.root.appendChild(TILES[`${x}_${y}`])

            x += SHAPE.offset_x;
            if (x + SHAPE.tile_width <= this.image.width) continue;

            x = x0;  y += SHAPE.offset_y;
            if (y + SHAPE.tile_height <= this.image.height) continue;

            break;
        }
    },

    _resizeToFitScreen() {
    	// todo - rotate image if needed
        if (this.image.width <= window.innerWidth)
            return false;

        let ratio = window.innerWidth / this.image.width,
            ctx = this.canvas.getContext('2d');
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = this.image.height * ratio;
        ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);

        this.image.src = this.canvas.toDataURL('image/jpeg');
        return true;
    },

    findClose: function(target_x, target_y) {
        let int_x = Math.floor(target_x),
            int_y = Math.floor(target_y),
            tune_x, tune_y, i, j, target;

        for (i of [0, 1, -1, 2, -2, 3, -3]) {
            tune_x = int_x + i;
            for (j of [0, 1, -1, 2, -2, 3, -3]) {
                tune_y = int_y + j;
                target = TILES[tune_x + '_' + tune_y];
                if (target) return target;
            }
        }
    }
}