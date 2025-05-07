

function createDuplicate(tile) {
    let duplicate = CREATE_TILE(tile.dataset.x, tile.dataset.y,
                                tile.firstChild.src, 'duplicate')
    for (let clip_class of ['hexagon-path', 'triangle-V-path', 'triangle-A-path'])
        if (tile.classList.contains(clip_class))
            duplicate.classList.add(clip_class);
    CROPPER.root.appendChild(duplicate);
}


const MOSAIC = {
    root: document.getElementById('mosaic'),
    image: document.getElementById('fullImage'),

    go: function() {
        MOSAIC.image.onload = MOSAIC.go;

        HELPER.tileArray().forEach((tile) => { tile.remove() });
        CROPPER.go();
        MOSAIC.dragging.initiate();
        SWAPPER.shuffle();
    },

    dragging: {  // `this` variables gets attached to MOSAIC.root

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

        // interaction priority
        // keep selected - (in group, short tap

        start: function(event) {
            event.preventDefault();
            if (event.touches) {
                document.getElementById('hintText').textContent = '>' + event.touches.length;
                if (event.touches.length > 1) return;
                event = event.touches[0];
            }

            // if (HELPER.tileArray('selected').length) // about to select the second one 
            //     document.getElementById('hintText').textContent = MOBILE ?
            //         'Triple Touch to deselect all' : 'Left Click to deselect all';

            let x = event.clientX, y = event.clientY,
                tile = document.elementFromPoint(x, y).parentElement;
            if (!tile.classList.contains('tile')) return;
            this.selected_on_start = tile.classList.contains('selected');  // for unselect on tap

            if (Date.now() - (this.start_t || 0) < 500)  // multi tap
                if (tile == SWAPPER.drag_tile && ROTATION) {
                    tile.rotateStep();
                    this.selected_on_start = false;  // prevents unselect on tap
                }

            tile.classList.add('selected');
            TOUCHER.tileTouched(tile, event);
            
            // HELPER.tileArray('selected').forEach((tile) => HELPER.createDuplicate(tile));
            
            this.start_t = Date.now();
        },

        move: function(event) {
            if (!this.allow_scroll) event.preventDefault();
            if (event.touches) event = event.touches[0];
            if (TOUCHER.is_dragging) TOUCHER.tileMoved(event);
        },

        stop: function(event) {
            // console.log('drag stop - 0', SWAPPER.drag_tile.classList.contains('selected'));
            // document.getElementById('hintText').textContent = '<' + event.touches ? event.touches.length : '-';
            let msg = 'interaction end';

            // if (event.touches) { msg = '<' + event.touches.length; event = event.touches[0]; }

            if (TOUCHER.is_dragging) TOUCHER.tileReleased();

            let short_tap = (Date.now() - this.start_t) < 500;
            if (!short_tap && HELPER.tileArray('selected').length == 1)  // slow mode
                HELPER.removeClassFromTiles('selected');
            if (short_tap && this.selected_on_start)  // deselect on tap
                SWAPPER.drag_tile.classList.remove('selected');
            document.getElementById('hintText').textContent = msg;
        }
    }
};



/*

document.addEventListener('click', (e) => {
  const topElement = document.elementFromPoint(e.clientX, e.clientY);

  // Temporarily hide the top element
  topElement.style.pointerEvents = 'none';

  // Get the element underneath
  const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
  console.log('Element below:', elementBelow);

  // Restore the top element's pointer events
  topElement.style.pointerEvents = '';

  // Optional: Do something with the below element
});


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
