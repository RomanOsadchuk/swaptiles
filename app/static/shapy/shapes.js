const ROOT_3 = Math.sqrt(3);


var SquarePattern = (size) => {
    return {
        name: 'SQUARE',
        rotation_degree: 90,
        period_x: size, period_y: size,
        tile_width: size, tile_height: size,
        shifted_rows: [],
        rotation_matrix: [[0, -1], [1, 0]],

        x0AgainstRoot: function(root_width) {
            return Math.floor(root_width % this.tile_width / 2);
        },

        y0AgainstRoot: function(root_height) {
            return Math.floor(root_height % this.tile_height / 2);
        },

        getRandomRotation: function() {
            return [0, 90, 180, 270][Math.floor(Math.random() * 4)];
        }
    }
},
//             ╏tile_width == period_x ╏                
//      --╏----╏-----------------------╏-
//        ╏    ╏         / ╏ \         ╏
//        ╏    ╏      /    ╏    \      ╏
//        ╏    ╏   /       ╏       \   ╏
//        ╏    ╏/          ╏          \╏
//        ╏    |           ╏shifted_row|
//      p ╏    |           ╏  .offset_y|
//      e ╏    |           ╏           |
//      r ╏    |shifted_row╏           |
//      i ╏    |  .offset_x╏           |
//      o ╏   -╏-----------╏-          ╏--------------╏--
//      d ╏     \                     / \             ╏
//     |  ╏        \               /       \          ╏
//      y ╏           \         /             \       ╏ t
//        ╏              \   /                   \    ╏ i
//        ╏                ╏                       ╏  ╏ l
//        ╏                |                       |  ╏ e
//        ╏                |                       |  ╏  |
//        ╏                |                       |  ╏ h
//        ╏                |                       |  ╏ e
//      --╏----------------  \                   /    ╏ i
//                              \             /       ╏ h
//                                 \       /          ╏ t
//                                    \ /             ╏
//                                      --------------╏--
    HexagonPattern = (size) => {
    return {
        name: 'HEXAGON',
        rotation_degree: 60,
        tile_width: size, period_x: size,
        tile_height: Math.floor(size * 2 / ROOT_3),
        period_y: Math.floor(size * 3 / ROOT_3),
        clip_path: 'hexagon-path',
        rotation_matrix: [[0.5, -ROOT_3/2], [ROOT_3/2, 0.5]],

        shifted_rows: [{
            offset_x: Math.floor(size / 2),
            offset_y: Math.floor(size * ROOT_3 / 2),
            clip_path: 'hexagon-path'
        }],

        x0AgainstRoot: function(root_width) {
            let remaining = (root_width - this.tile_width / 2) % this.tile_width;
            if (remaining > this.tile_width / 2) remaining -= this.tile_width / 2;
            return Math.floor(remaining / 2);
        },

        y0AgainstRoot: function(root_height) {
            let remaining = root_height, sr = this.shifted_rows[0];
            while (remaining > this.tile_height)
                remaining -= sr.offset_y;
            remaining = remaining + sr.offset_y - this.tile_height;
            return Math.floor(remaining / 2);
        },

        getRandomRotation: function() {
            return [0, 60, 120, 180, 240, 300][Math.floor(Math.random() * 6)];
        }
    }
},
//                       --------╏--
//                               ╏
//    _ _ _ _ _ _  _____________ ╏
//       ╏        /\           / ╏ tile_height
//       ╏       /  \    .    /  ╏
//       ╏      /    \       /   ╏ (bigger than actual triangle, cause we need:)
//     p ╏     /      \     /    ╏ (tile center == triangle center [for rotation])
//     e ╏    /        \   /     ╏
//     r ╏   /tile_width\ /      ╏
//     i ╏  ╏————————————╏-------╏--
//     o ╏   \ period_x / \
//     d ╏    \        /   \
//    |  ╏     \      /     \ 
//     y ╏      \    /   .   \
//       ╏       \  /         \
//    _ _╏_ _ _ _ \/___________\

    TrianglePattern = (size) => {
    return {
        name: 'TRIANGLE',
        rotation_degree: 120,
        tile_width: size, period_x: size,
        tile_height: Math.floor(size * 2 / ROOT_3),
        period_y: Math.floor(size * ROOT_3),
        clip_path: 'triangle-A-path',
        rotation_matrix: [[-0.5, -ROOT_3/2], [ROOT_3/2, -0.5]],

        shifted_rows: [{
            offset_x: Math.floor(size / 2),
            offset_y: -Math.floor(size / ROOT_3 / 2),
            clip_path: 'triangle-V-path'
        }, {
            offset_x: 0,
            offset_y: Math.floor(size / ROOT_3),
            clip_path: 'triangle-V-path'
        }, {
            offset_x: Math.floor(size / 2),
            offset_y: Math.floor(size * 3 / ROOT_3 / 2),
            clip_path: 'triangle-A-path'
        }],

        x0AgainstRoot: function(root_width) {
            let remaining = (root_width - this.tile_width / 2) % this.tile_width;
            if (remaining > this.tile_width / 2) remaining -= this.tile_width / 2;
            return Math.floor(remaining / 2);
        },

        y0AgainstRoot: function(root_height) {
            // the period is double row
            let row_height = this.tile_height - this.shifted_rows[0].offset_y,
                row_offset = Math.floor(this.period_y / 2);
                remaining = root_height;

            while (remaining > row_height)
                remaining -= row_offset;

            remaining = remaining - this.tile_height / 2;
            return Math.floor(remaining / 2) - this.shifted_rows[0].offset_y;
        },

        getRandomRotation: function() {
            return [0, 120, 240][Math.floor(Math.random() * 3)];
        }
    }
};



const GRID = {
    tiles: {},
    root: document.getElementById('mosaic'),
    canvas: document.getElementById('canvas'),
    image: document.getElementById('fullImage'),
    initial_image: document.getElementById('initialImage'),
    misorientation: false,
    image_x0: 0,
    image_y0: 0,

    tile_size: 100,
    tile_shape: SquarePattern(100),

    resizeTile: function(size) {
        this.tile_size = size;
        this.reshapeTiles(this.tile_shape.name)
    },

    reshapeTiles: function(shape) {
        if (shape == 'SQUARE') this.tile_shape = SquarePattern(this.tile_size);
        if (shape == 'HEXAGON') this.tile_shape = HexagonPattern(this.tile_size);
        if (shape == 'TRIANGLE') this.tile_shape = TrianglePattern(this.tile_size);
        this.reCrop();
    },

    resizeImage: function() {
        let w = Math.floor(this.root.clientWidth),
            h = Math.floor(this.root.clientHeight),
            W = this.initial_image.width,
            H = this.initial_image.height,
            ratio = Math.min(w/W, h/H),
            ctx = this.canvas.getContext('2d');
        this.misorientation = (w > h) != (W > H);

        w = Math.floor(W * ratio);  h = Math.floor(H * ratio);
        this.tile_size = Math.floor(Math.min(w/2.5, h/2.5));
        this.tile_shape = HexagonPattern(this.tile_size);

        this.canvas.width = w;      this.canvas.height = h;
        ctx.drawImage(this.initial_image, 0, 0, w, h);        
        this.image_x0 = Math.floor((this.root.clientWidth - w) / 2);
        this.image_y0 = Math.floor((this.root.clientHeight - h) / 2);

        this.image.style.position = 'absolute';
        this.image.style.left = this.image_x0 + 'px';
        this.image.style.top = this.image_y0 + 'px';
        this.image.src = this.canvas.toDataURL('image/jpeg');
        // wait for image loading, reCrop on load
    },

    reCrop: function() {
        TILES.getArray().forEach((tile) => { tile.remove(); });
        this.tiles = {};
        this.canvas.width = this.tile_shape.tile_width;
        this.canvas.height = this.tile_shape.tile_height;

        let x0 = this.tile_shape.x0AgainstRoot(this.image.width),
            y0 = this.tile_shape.y0AgainstRoot(this.image.height), sr;
        this._periodicCrop(x0, y0, this.tile_shape.clip_path);
        for (sr of this.tile_shape.shifted_rows)
            this._periodicCrop(x0 + sr.offset_x,
                               y0 + sr.offset_y,
                               sr.clip_path);
    },

    _periodicCrop: function(x0, y0, clip_path) {
        let ctx = this.canvas.getContext('2d'), x = x0, y = y0,
            w = this.tile_shape.tile_width, h = this.tile_shape.tile_height, imgSrc, x_, y_;

        while (true) {
            ctx.drawImage(this.image, x, y, w, h, 0, 0, w, h);
            imgSrc = this.canvas.toDataURL('image/jpeg');

            x_ = x + this.image_x0; y_ = y + this.image_y0;
            this.tiles[`${x_}_${y_}`] = TILES.create(x_, y_, imgSrc, clip_path);
            this.root.appendChild(this.tiles[`${x_}_${y_}`])

            x += this.tile_shape.period_x;
            if (x + this.tile_shape.tile_width <= this.image.width) continue;

            x = x0;  y += this.tile_shape.period_y;
            if (y + this.tile_shape.tile_height <= this.image.height) continue;

            break;
        }
    },

    findClose: function(target_x, target_y) {
        // for proper rotation handling
        let int_x = Math.floor(target_x),
            int_y = Math.floor(target_y),
            tune_x, tune_y, i, j, target;

        for (i of [0, 1, -1, 2, -2, 3, -3]) {
            tune_x = int_x + i;
            for (j of [0, 1, -1, 2, -2, 3, -3]) {
                tune_y = int_y + j;
                target = this.tiles[tune_x + '_' + tune_y];
                if (target) return target;
            }
        }
    }
}
