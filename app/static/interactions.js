
const MOSAIC_INTERACTION = {

    initiate: function() {
        let root = document.getElementById('mosaic');
        if (root.onmousedown)
            return;

        root.oncontextmenu = (e) => { return false; };
        root.onmousedown = this.start;
        root.onmousemove = this.move;
        root.onmouseup = this.stop;
        root.onmouseleave = this.stop;
        root.onwheel = this.wheel;

        root.addEventListener("touchstart", this.start);
        root.addEventListener("touchmove", this.move);
        root.addEventListener("touchend", this.stop);
        root.addEventListener("touchcancel", this.stop);
    },

    start: function(event) {
        event.preventDefault();
        if (this.highlight_mode) return;
        this.highlight_mode = (event.button == 2);

        if (event.touches) {
            if (event.touches.length > 1) this.highlight_mode = true;
            event = event.touches[0];
        }

        if (this.highlight_mode) {
            if (SWAPPER.drag_tile) DRAGGER.releaseTile();
            TILES.getArray().forEach((t) => t.classList.add('selected'));
            return;
        }

        let x = event.clientX, y = event.clientY,
            tile = document.elementFromPoint(x, y).parentElement;
        if (!tile.classList.contains('tile')) return;

        this.tile_was_selected = tile.classList.contains('selected');
        this.multi_tap = (Date.now() - (this.start_t || 0)) < 600
                         && tile == SWAPPER.drag_tile;
        this.start_t = Date.now();
        if (this.multi_tap && TILES.rotation) tile.rotateStep(true);

        DRAGGER.captureTile(tile, event);
    },

    move: function(event) {
        event.preventDefault();
        if (event.touches) event = event.touches[0];
        if (DRAGGER.is_dragging) DRAGGER.shiftTile(event);
    },

    stop: function(event) {
        if (this.highlight_mode) {
            this.highlight_mode = false;
            TILES.removeClassFromTiles('selected');
        }

        if (!DRAGGER.is_dragging) return;

        let swap_done = SWAPPER.distance() > 0,
            short_tap = (Date.now() - this.start_t) < 400;
        // first calculate distance than release
        DRAGGER.releaseTile();


        if (!swap_done && short_tap && this.tile_was_selected && !this.multi_tap)
            SWAPPER.drag_tile.classList.remove('selected')

        if (!short_tap && TILES.getArray('selected').length == 1)
            SWAPPER.drag_tile.classList.remove('selected')

        // if (!short_tap && TILES.getArray('selected').length == 1)  // slow mode
        //     TILES.removeClassFromTiles('selected');
        // if (short_tap && this.selected_on_start)  // deselect on tap
        //     SWAPPER.drag_tile.classList.remove('selected');
    },

    wheel: function(event) {
        event.preventDefault();
        if (DRAGGER.is_dragging) return;

        let positive = event.deltaX > 0 || event.deltaY > 0,
            x = event.clientX, y = event.clientY,
            tile = document.elementFromPoint(x, y).parentElement;;

        if (tile.classList.contains('tile') && TILES.rotation)
            tile.rotateStep(positive);
    }
};


const MENU_INTERACTION = {
    sub_menu: document.getElementById('subMenu'),
    about_div: document.getElementById('about'),
    shape_btn: document.getElementById('shapeBtn'),
    plus_size_btn: document.getElementById('plusSize'),
    minus_size_btn: document.getElementById('minusSize'),
    rotation_btn: document.getElementById('rotationBtn'),
    hexagon_btn: document.getElementById('hexagonBtn'),
    triangle_btn: document.getElementById('triangleBtn'),
    square_btn: document.getElementById('squareBtn'),
    about_btn: document.getElementById('aboutBtn'),

    toggleSubMenu: function() {
        MENU_INTERACTION.about_div.style.display = 'none';
        if (MENU_INTERACTION.sub_menu.style.display == 'none')
            MENU_INTERACTION.sub_menu.style.display = 'flex';
        else MENU_INTERACTION.sub_menu.style.display = 'none';
    },

    toggleAbout: function() {
        MENU_INTERACTION.sub_menu.style.display = 'none';
        if (MENU_INTERACTION.about_div.style.display == 'none')
            MENU_INTERACTION.about_div.style.display = 'block';
        else MENU_INTERACTION.about_div.style.display = 'none';
    },

    increaseSize: function() {
        let max_size = MOBILE ? 195 : 295; // do relative to MOSAIC.size
        // if (SIZE > max_size) return;
        TILES.resizeAndShuffle(GRID.tile_size + 10);
    },

    decreeseSize: function() {
        let min_size = MOBILE ? 75 : 125;
        // if (SIZE < min_size) return;
        TILES.resizeAndShuffle(GRID.tile_size - 10);
    },

    selectTriangle: function() {
        MENU_INTERACTION.shape_btn.classList.remove('hex-button');
        MENU_INTERACTION.shape_btn.classList.add('tre-button');
        TILES.reshapeAndShuffle('TRIANGLE');
    },

    selectHexagon: function() {
        MENU_INTERACTION.shape_btn.classList.remove('tre-button');
        MENU_INTERACTION.shape_btn.classList.add('hex-button');
        TILES.reshapeAndShuffle('HEXAGON');
    },

    selectSquare: function() {
        MENU_INTERACTION.shape_btn.classList.remove('tre-button');
        MENU_INTERACTION.shape_btn.classList.remove('hex-button');
        TILES.reshapeAndShuffle('SQUARE');
    },

    toggleRotation: function() {
        let color_button, _MI = MENU_INTERACTION;
        TILES.toggleRotationAndShuffle();
        for (color_button of [_MI.square_btn, _MI.triangle_btn, _MI.hexagon_btn,
                              _MI.rotation_btn, _MI.shape_btn])
            if (TILES.rotation) color_button.classList.add('rotation-color');
            else color_button.classList.remove('rotation-color'); 
    },

    initiate: function() {
        MENU_INTERACTION.shape_btn.onclick = MENU_INTERACTION.toggleSubMenu;
        MENU_INTERACTION.plus_size_btn.onclick = MENU_INTERACTION.increaseSize;
        MENU_INTERACTION.minus_size_btn.onclick = MENU_INTERACTION.decreeseSize;
        MENU_INTERACTION.hexagon_btn.onclick = MENU_INTERACTION.selectHexagon;
        MENU_INTERACTION.triangle_btn.onclick = MENU_INTERACTION.selectTriangle;
        MENU_INTERACTION.square_btn.onclick = MENU_INTERACTION.selectSquare;
        MENU_INTERACTION.rotation_btn.onclick = MENU_INTERACTION.toggleRotation;
        MENU_INTERACTION.about_btn.onclick = MENU_INTERACTION.toggleAbout;

        screen.orientation.addEventListener("change", (event) => {
          GRID.perform_rescale = true;
          TILES.fitImageAndShuffle();
        });

        MOSAIC_INTERACTION.initiate();
        TILES.fitImageAndShuffle();
    }
};



// GRID.reshapeTiles('HEXAGON');
window.onload = MENU_INTERACTION.initiate;
