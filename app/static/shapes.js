const ROOT_3 = Math.sqrt(3),
      MOBILE = /Mobi|Android|iPhone/i.test(navigator.userAgent);


var SIZE = MOBILE ? 130 : 250,  // SIZE is generally a tile_width
    ROTATION = false,
    SHAPE = null,

    SquareTile = (size) => {
    return {
        rotation_degree: 90,
        offset_x: size, offset_y: size,
        tile_width: size, tile_height: size,

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
//  ╏ tile_width == offset_x    ╏                   
// -╏---------------------------╏-                 --╏--
//              / ╏ \                                ╏
//           /    ╏    \                             ╏
//        /       ╏       \                          ╏
//     /          ╏          \                       ╏
//                ╏                                  ╏
//  |             ╏shifted_row  |                    ╏
//  |             ╏.offset_y    |                    ╏
//  |             ╏             |                    ╏
//  | shifted_row ╏             |                    ╏o
//  | .offset_x   ╏             |              ╏     ╏f
//  |-------------╏-           -|---------------     ╏f
//                                             ╏     ╏s
//     \                     /    \            ╏     ╏e
//        \               /          \         ╏t    ╏t
//           \         /                \      ╏i    ╏
//              \   /                      \   ╏l    ╏y
//                                             ╏e    ╏
//                |                           |╏     ╏
//                |                           |╏h    ╏
//                |                           |╏e    ╏
//                |                           |╏i    ╏
//                |                           |╏g    ╏
//                                             ╏h    ╏
//                   \                     /   ╏t    ╏
//                      \               /      ╏     ╏
//                         \         /         ╏     ╏
//                            \   /            ╏     ╏
//                               --------------------╏-
    HexagonTile = (size) => {
    return {
        rotation_degree: 60,
        tile_width: size, offset_x: size,
        tile_height: Math.floor(size * 2 / ROOT_3),
        offset_y: Math.floor(size * 3 / ROOT_3),
        clip_path: 'hexagon-path',

        shifted_row: {  // even row
            offset_x: Math.floor(size / 2),
            offset_y: Math.floor(size * ROOT_3 / 2),
            clip_path: 'hexagon-path'
        },

        x0AgainstRoot: function(root_width) {
            // first check how many space in remaining on shifted row
            let remaining = (root_width - this.shifted_row.offset_x) % this.tile_width;
            // than check if one more tile on regular row fits
            if (remaining + this.shifted_row.offset_x > this.tile_width) 
                remaining = remaining + this.shifted_row.offset_x - this.tile_width;
            return Math.floor(remaining / 2);
        },

        y0AgainstRoot: function(root_height) {  // same as for width
            let remaining = (root_height - this.shifted_row.offset_y) % this.tile_height;
            if (remaining + this.shifted_row.offset_y > this.tile_height)
                remaining = remaining + this.shifted_row.offset_y - this.tile_height;
            return Math.floor(remaining / 2);
        },

        getRandomRotation: function() {
            return [0, 60, 120, 180, 240, 300][Math.floor(Math.random() * 6)];
        }
    }
},
//  ╏ tile_widt == offset_x ╏                   
// -╏-----------------------╏-                   
//  ╏                       ╏shifted_row    (so triangle center at the tile square center)
//  ╏shifted_row╏           ╏.offset_y      (for proper rotation)
//  ╏.offset_x  ╏           ╏ 
// -╏───────────╏───────────╏-----------╏-----╏-
//    \         ╏          /╏\          ╏     ╏t
//     \        ╏         / ╏ \         ╏     ╏i
//      \       ╏        /  ╏  \        ╏     ╏l
//       \      ╏       /   ╏   \       ╏     ╏
//        \     ╏      /    ╏    \      ╏o    ╏h
//         \    ╏     /     ╏     \     ╏f    ╏e
//          \   ╏    /      ╏      \    ╏f    ╏i
//           \  ╏   /       ╏       \   ╏s    ╏g
//            \ ╏  /        ╏        \  ╏e    ╏h
//             \╏ /         ╏         \ ╏t    ╏t
//              ╏───────────╏───────────╏-----╏-
//              ╏           ╏           ╏y    
//              ╏           ╏           ╏
//              ╏           ╏           ╏
//             -╏-----------╏-----------╏-
//              ╏ tile_widt == offset_x ╏

    TriangleTile = (size) => {
        let hex = HexagonTile(size);  // inherited due to same shifted_row logic
        hex.rotation_degree = 120;
        hex.getRandomRotation = () => { return [0, 120, 240][Math.floor(Math.random() * 3)]; };
        hex.offset_y = Math.floor(size * ROOT_3 / 2);
        hex.shifted_row.offset_y = Math.floor(size / ROOT_3 / 2);
        hex.clip_path = 'triangle-V-path';
        hex.shifted_row.clip_path = 'triangle-A-path';
        return hex
},
    RESET_SHAPE = (shape) => {
        if (shape == 'SQUARE') SHAPE = SquareTile(SIZE);
        if (shape == 'HEXAGON') SHAPE = HexagonTile(SIZE);
        if (shape == 'TRIANGLE') SHAPE = TriangleTile(SIZE);
        SHAPE.rescale = function(new_size) {
            SIZE = new_size;
            RESET_SHAPE(shape);
        }
};
