const MOBILE = /Mobi|Android|iPhone/i.test(navigator.userAgent);


const HINTS = {
    start_t: Date.now(),
    elem: document.getElementById('message'),
    hintDebug: function(msg) { this.elem.textContent = msg; },

    hintSelect: function() {
        this.elem.textContent = this._wrap(`Tap on tile to select for parallel swap`);
    },

    hintClear: function() {
        let action = MOBILE ? '3-finger Tap' : 'Right Click';
        this.elem.textContent = this._wrap(`${action} to deselect all`);
    },

    hintHighlight: function() {
        let action = MOBILE ? '3-finger Hold' : 'Right Button Hold';
        this.elem.textContent = this._wrap(`${action} to highlight remaining`);
    },

    hintRotate: function() {
        this.reset();
        let tool = MOBILE ? 'Second Finger' : 'Wheel';
        this.elem.textContent = this._wrap(`Use ${tool} to rotate`);
    },

    reset: function() {
        this.elem.style.color = 'black';
        this.start_t = Date.now();
        SWAP.total = 0;
        this.elem.textContent = this._wrap('Drag Tiles to Swap');
    },

    _wrap: function(msg) {
        if (TILES.getArray().length == 0) {
            this.elem.style.color = 'red';
            msg = 'FINISH';
        }
        let seconds = Math.floor((Date.now() - this.start_t) / 1000);
        return SWAP.total + ' | ' + msg + ' | ' + seconds;
    }
};


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
        MENU_INTERACTION.about_div.style.display = 'none';
        MENU_INTERACTION.sub_menu.style.display == 'none'

        if (this.highlight_mode) return;
        this.highlight_mode = (event.button == 2);

        if (event.touches) {
            if (event.touches.length > 2) this.highlight_mode = true;
            if (event.touches.length == 2) {
                SWAP.startRotate(event);
                return;
            }
            event = event.touches[0];
        }

        if (this.highlight_mode) {
            SWAP.stopShift();
            TILES.getArray().forEach((t) => t.classList.add('selected'));
            return;
        }

        SWAP.startShift(event);
    },

    move: function(event) {
        event.preventDefault();
        if (event.touches) {
            if (event.touches.length == 2)
                SWAP.moveRotate(event);
            event = event.touches[0];
        }
        SWAP.moveShift(event);
    },

    stop: function(event) {
        if (this.highlight_mode) {
            this.highlight_mode = false;
            TILES.removeClassFromTiles('selected');
        }
        if (event.touches && event.touches.length > 0) return;
        SWAP.stopShift();

        if (TILES.getArray().length <= 3) HINTS.hintHighlight();
        else if (TILES.getArray('selected').length > 3) HINTS.hintClear();
        else HINTS.hintSelect();
    },

    wheel: function(event) {
        event.preventDefault();
        let positive = event.deltaX > 0 || event.deltaY > 0;
        if (SWAP.main_target && TILES.rotation) {  // is shifting
            SWAP.rotateStep(positive);
            SWAP.moveShift(event);
            return;
        }

        let x = event.clientX, y = event.clientY,
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
        if (GRID.tile_size > max_size) return;
        TILES.resizeAndShuffle(GRID.tile_size + 10);
        HINTS.reset();
    },

    decreeseSize: function() {
        let min_size = MOBILE ? 75 : 125;
        if (GRID.tile_size < min_size) return;
        TILES.resizeAndShuffle(GRID.tile_size - 10);
        HINTS.reset();
    },

    selectTriangle: function() {
        MENU_INTERACTION.shape_btn.classList.remove('hex-button');
        MENU_INTERACTION.shape_btn.classList.add('tre-button');
        TILES.reshapeAndShuffle('TRIANGLE');
        HINTS.reset();
    },

    selectHexagon: function() {
        MENU_INTERACTION.shape_btn.classList.remove('tre-button');
        MENU_INTERACTION.shape_btn.classList.add('hex-button');
        TILES.reshapeAndShuffle('HEXAGON');
        HINTS.reset();
    },

    selectSquare: function() {
        MENU_INTERACTION.shape_btn.classList.remove('tre-button');
        MENU_INTERACTION.shape_btn.classList.remove('hex-button');
        TILES.reshapeAndShuffle('SQUARE');
        HINTS.reset();
    },

    toggleRotation: function() {
        let color_button, _MI = MENU_INTERACTION;
        TILES.toggleRotationAndShuffle();
        for (color_button of [_MI.square_btn, _MI.triangle_btn, _MI.hexagon_btn,
                              _MI.rotation_btn, _MI.shape_btn])
            if (TILES.rotation) color_button.classList.add('rotation-color');
            else color_button.classList.remove('rotation-color');

        if (TILES.rotation) HINTS.hintRotate();
        else HINTS.reset();
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
          TILES.fitImageAndShuffle();
        });

        MOSAIC_INTERACTION.initiate();
        TILES.fitImageAndShuffle(MOBILE ? 120 : 250);
    }
};



// GRID.reshapeTiles('HEXAGON');
window.onload = MENU_INTERACTION.initiate;
