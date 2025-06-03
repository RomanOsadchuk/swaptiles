

function snapOneDimention(est, period) {
    return Math.floor((est + period/2) / period) * period;
}


function snap1DShifted(est, period) {
    return Math.floor(est / period) * period + period/2;
}


class Grid {
    el; vertical; size; fix = true; count = 3; rotation = false; tiles = {};

    _size2() { return Math.floor(this.size * 2 / ROOT_3); }
    _offset() { return Math.ceil(this.size * ROOT_3 / 2); }
    _quarter() { return this.size2() - this.offset(); }

    constructor(elenemt_id, puzzle) {
        this.el = document.getElementById(elenemt_id);
        this.el.classList.add('grid');
        this.swapper = new Swapper(this, puzzle);
    }

    _orient() {
        this.vertical = window.innerHeight >= window.innerWidth;
        if (this.vertical) {
            this.el.style.width = Math.floor(window.innerWidth) + 'px';
            this.el.classList.remove('horizontal');
            this.el.classList.add('vertical');
        } else {
            this.el.style.height = Math.floor(window.innerHeight) + 'px';
            this.el.classList.remove('vertical');
            this.el.classList.add('horizontal');
        }
    }

    fitMenu(actions) {
        this.fix = false;
        this._orient();
        let d = this.vertical ? window.innerWidth : window.innerHeight, x = 0, y = 0;
        this.size = Math.floor(d / actions.length);

        if (this.size > 100) {
            this.size = 100;
            if (this.vertical) x = Math.floor((d - 100*actions.length) / 2);
            else y = Math.floor((d - 100*actions.length) / 2);
        }

        if (this.vertical)
            this.el.style.height = this._size2() + 'px';
        else this.el.style.width = this._size2() + 'px';

        let drawer = new Drawer(this.size - 1, this.vertical);
        for (let action of actions) {
            this.createTile(x, y, drawer.draw(action), action);
            if (this.vertical) x += this.size;
            else y += this.size;
        }
    }

    fitPicture(big_picture) {
        this._orient();

        let fitted_picture = document.getElementById('fittedPicture'),
            w = Math.floor(this.el.clientWidth),
            h = Math.floor(this.el.clientHeight),
            W = big_picture.width,
            H = big_picture.height,
            ratio = Math.min(w/W, h/H);

        w = Math.floor(W * ratio);  h = Math.floor(H * ratio);
        CANVAS.width = w;           CANVAS.height = h;
        CTX.drawImage(big_picture, 0, 0, w, h);

        fitted_picture.onload = () => { this._crop(fitted_picture); };
        fitted_picture.src = CANVAS.toDataURL('image/jpeg');
    }

    _crop(picture) {
        this._removeAllTiles();
        let x = 0, y = 0, w, h, x0, y0, odd = true;
        if (this.vertical) {
            this.size = w = Math.floor(picture.width / this.count / 2) * 2;
            h = this._size2();
            // not always fit
        } else {
            this.size = h = Math.floor(picture.height / this.count / 2) * 2;
            w = this._size2();
        }

        x0 = Math.round((this.el.clientWidth - picture.width) / 2);
        y0 = Math.round((this.el.clientHeight - picture.height) / 2);
        CANVAS.width = w - 1;  CANVAS.height = h - 1;

        while (true) {
            CTX.drawImage(picture, x, y, w - 1, h - 1, 0, 0, w - 1, h - 1);
            this.createTile(x + x0, y + y0, CANVAS.toDataURL('image/jpeg'));

            if (this.vertical) {
                x += w;
                if (x+w >= picture.width) {
                    x = odd ? this.size/2 : 0;
                    y += this._offset();  odd = !odd;
                    if (y+h >= picture.height) break;
                }
            } else { 
                y += h;
                if (y+h >= picture.height) {
                    y = odd ? this.size/2 : 0;
                    x += this._offset();  odd = !odd;
                    if (x+w >= picture.width) break;
                }
            }
        }
        this._shuffle();
    }

    _removeAllTiles() {
        for (let tile of this.tileArray())
            tile.el.remove();
        this.tiles = {}
    }

    _shuffle() {
        let tiles = this.tileArray(),
            next_tile, random_index,
            current_tile = tiles.splice(0, 1)[0];

        while (tiles.length > 0) {
            random_index = Math.floor(Math.random() * tiles.length);
            next_tile = tiles.splice(random_index, 1)[0];
            current_tile.el.appendChild(next_tile.el.firstChild);
            next_tile.el.appendChild(current_tile.el.firstChild);
            // if (this.rotation) current_tile.rotateRandom();
            current_tile = next_tile;
        }
    }

    fitTitle(title) {}
    fitGalleries(galleries) {}

    decCount() {
        if (this.count == 2) return;
        this.count -= 1;
        this._crop(document.getElementById('fittedPicture'));
    }

    incCount() {
        if (this.count == 7) return;
        this.count += 1;
        this._crop(document.getElementById('fittedPicture'));
    }

    toggleRotation() {}

    createTile(x, y, image_src, action) {
        let tile = new Tile(x, y, image_src, action);
        this.el.appendChild(tile.el);
        this.tiles[x+'|'+y] = tile;
    }

    tileArray(class_name) {
        let result = [];
        for (let tile of Object.values(this.tiles)){
            if (!tile) continue;
            if (!class_name || tile.el.classList.contains(class_name))
                result.push(tile);
        }
        return result;
    }

    snap(dx, dy) {
        let a = this.vertical ? dx : dy,
            b = this.vertical ? dy : dx;

        let snap_a, snap_b = snapOneDimention(b, this._offset());
        if (snap_b / this._offset() % 2 == 0)
            snap_a = snapOneDimention(a, this.size);
        else snap_a = snap1DShifted(a, this.size);

        return this.vertical ? [snap_a, snap_b] : [snap_b, snap_a];
    }
}


let puzzle = new Grid('puzzle'),
    menu = new Grid('actions', puzzle),
    big_picture = document.getElementById('bigPicture');
menu.fitMenu(['HOME', 'NEXT', 'MINUS', 'ROTATE', 'PLUS', 'IMAGE', 'INFO'], puzzle);
window.onload = () => { puzzle.fitPicture(big_picture); };
