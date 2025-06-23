

class Grid {
    x0 = 0; y0 = 0; el; size; count = 4; tiles = {};

    _size2() { return Math.ceil(this.size * 2 / ROOT_3); }
    _offset() { return Math.floor(this.size * ROOT_3 / 2); }
    _quarter() { return this._size2() - this._offset(); }

    constructor(elenemt_) {
        this.el = elenemt_;
        new Swapper(this);
    }

    _removeTiles(class_name) {
        for (let tile of this.tileArray(class_name)) {
            tile.el.remove();
            delete this.tiles[tile.x + '|' + tile.y];
        }
    }

    fitMenu(actions) {
        this._removeTiles();

        let btn_size = Math.floor(window.innerWidth / 7);
        if (btn_size > 90) btn_size = 90;
        let drawer = new Drawer(btn_size, true), x = 10, y = 10;

        for (let action of ['HOME', 'NEXT']) {
            this.createTile(x, y, drawer.draw(action), action);
            x += btn_size;
        }

        x = window.innerWidth - 10 - 2 * btn_size;
        for (let action of ['IMAGE', 'INFO']) {
            this.createTile(x, y, drawer.draw(action), action);
            x += btn_size;
        }

        y = window.innerHeight - 10 - Math.round(btn_size * 2 / ROOT_3);
        x = Math.floor(window.innerWidth / 2 - 1.5 * btn_size);
        for (let action of ['MINUS', 'ROTATE', 'PLUS']) {
            this.createTile(x, y, drawer.draw(action), action);
            x += btn_size;
        }
    }

    fitPicture(big_picture) {
        let fitted_picture = document.getElementById('fittedPicture'),
            w = Math.floor(window.innerWidth),
            h = Math.floor(window.innerHeight),
            W = big_picture.width,
            H = big_picture.height,
            ratio = Math.min(w/W, h/H);

        if (H > W) this.count = 2;

        w = Math.floor(W * ratio);  h = Math.floor(H * ratio);
        CANVAS.width = w;           CANVAS.height = h;
        CTX.drawImage(big_picture, 0, 0, w, h);

        fitted_picture.onload = () => { this._crop(fitted_picture); };
        fitted_picture.src = CANVAS.toDataURL('image/jpeg');
    }

    _crop(picture) {
        this._removeTiles('piece');

        this.size = Math.floor(picture.width / this.count / 2) * 2;
        let w = this.size,  h = this._size2(),  odd = true,
            x = -this.size / 2,  y = -this._marg2(picture.height),
            pic_x = Math.round((window.innerWidth - picture.width) / 2),
            pic_y = Math.round((window.innerHeight - picture.height) / 2);
        CANVAS.width = w;  CANVAS.height = h;

        CTX.fillStyle = 'White';
        while (true) {
            CTX.fillRect(0, 0, w, h);
            CTX.drawImage(picture, x, y, w, h, 0, 0, w, h);
            this.createTile(x + pic_x, y + pic_y, CANVAS.toDataURL('image/jpeg'), 'LOCK');

            x += w;
            if (x+w > picture.width + this.size / 2) {
                x = odd ? 0 : -this.size/2;
                y += this._offset();  odd = !odd;
                if (y >= picture.height) break;
            }
        }
        this._shuffle();
    }

    _shuffle() {
        let tiles = this.tileArray('piece'), next_tile, random_index,
            current_tile = tiles.splice(0, 1)[0],
            first_x = current_tile.x, first_y = current_tile.y;

        while (tiles.length > 0) {
            random_index = Math.floor(Math.random() * tiles.length);
            next_tile = tiles.splice(random_index, 1)[0];
            this.putInto(current_tile, next_tile.x, next_tile.y);
            current_tile = next_tile;
        }
        this.putInto(next_tile, first_x, first_y);
    }

    fitTitle() {
        this.size = 70;
        this.el.style.height = '150px';
        let drawer = new Drawer(this.size, true);

        let x = 35, y = 0, letter, tile;
        for (letter of ['S', 'W', 'A', 'P']) {
            this.createTile(x, y, drawer.drawChar(letter));
            x += this.size;
        }

        x = 0, y = this._offset();
        for (letter of ['T', 'I', 'L', 'E', 'S']) {
            this.createTile(x, y, drawer.drawChar(letter));
            x += this.size;
        }
    }

    fitGalleries() {
        if (window.innerWidth < 500) this._fitGalleriesLeft(3);
        else if (window.innerWidth < 650) this._fitGalleriesMid(2);
        else if (window.innerWidth < 800) this._fitGalleriesLeft(5);
        else this._fitGalleriesMid(3);
    }

    _fitGalleriesLeft(count) {  // count 3 or 5
        this.size = Math.floor(window.innerWidth / count) * 2;
        let y = 0, x = 0, odd = true;

        for (let link_el of this.el.children) {
            this._fitLinkElement(link_el, x, y);
            x += this.size;
            if (x + this.size > window.innerWidth) {
                y += this._offset();
                x = odd ? this.size/2 : 0;
                odd = !odd;
            }
        }
    }

    _fitGalleriesMid(count) {
        this.size = Math.floor(window.innerWidth / count / 2) * 2;
        if (this.size > 300) this.size = 300;
        let mid = Math.min(window.innerWidth / 2), y = 0,
            x0 = mid - this.size * count/2, x = x0, odd = true;

        for (let link_el of this.el.children) {
            this._fitLinkElement(link_el, x, y);
            x += this.size;
            if (x + this.size > x0 + count*this.size) {
                y += this._offset();
                x = odd ? x0 + this.size/2 : x0;
                odd = !odd;
            }
        }
    }

    _fitLinkElement(link_el, x, y) {
        let pic = link_el.children[0];
        pic.style.width = this.size + 'px';
        pic.style.left = x + 'px';
        pic.style.top = y + 'px';
    }

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

    rotateRandom() {
        for (let tile of this.tileArray('piece'))
            if (!tile.isLocked()) tile.rotateRandom();
    }

    createTile(x, y, image_src, action) {
        let tile = new Tile(x, y, image_src, action);
        this.el.appendChild(tile.el);
        this.tiles[x+'|'+y] = tile;
    }

    putInto(tile, x, y) {
        this.tiles[x+'|'+y] = tile;
        tile.updatePosition(x, y);
    }

    tileArray(class_name) {
        let result = [];
        
        for (let tile of Object.values(this.tiles))
            if (!class_name || tile.el.classList.contains(class_name))
                result.push(tile);
        return result;
    }

    snapTile(tile, delta) {
        let x = tile.x + delta.x, y = tile.y + delta.y;
        let [sn_x, sn_y] = this._snap(x-tile.prev_state.x, y-tile.prev_state.y);
        x = tile.prev_state.x + sn_x;  y = tile.prev_state.y + sn_y;

        let target = this.tiles[x+'|'+y];
        if (target && !target.isLocked()) return target;
        if (target && target.el == tile.el) return target;
    }

    _snap(dx, dy) {
        let snap_x, snap_y = this._snapOneDimention(dy, this._offset());
        if (snap_y / this._offset() % 2 == 0)
            snap_x = this._snapOneDimention(dx, this.size);
        else snap_x = this._snap1DShifted(dx, this.size);
        return [snap_x, snap_y];
    }

    _snapOneDimention(est, period) {
        return Math.floor((est + period/2) / period) * period;
    }

    _snap1DShifted(est, period) {
        return Math.floor(est / period) * period + period/2;
    }

    _marg2(d) {
        let t = d % this._offset(),
            k = this._size2()/2 - t;
        if (k >= 0) return this._quarter() + Math.floor(k/2);
        else {
            let q = this._offset() - t + this._size2()/2;
            return this._quarter() + Math.floor(q/2);
        }
    }

    _getFromPoint(x, y) { return this.tiles[x+'|'+y]; }

    activateNeighbours() {
        let cent = this.tileArray('active')[0];
        if (cent) this._checkNeib(cent);
    }

    _neibDelta() {
        return {0: {x: this.size,    y: 0},
               60: {x: this.size/2,  y: this._offset()},
              120: {x: -this.size/2, y: this._offset()},
              180: {x: -this.size,   y: 0},
              240: {x: -this.size/2, y: -this._offset()},
              300: {x: this.size/2,  y: -this._offset()}}
    }

    _checkNeib(tile) {
        let deltas = this._neibDelta(), delta, neib, dir;
        tile.el.classList.add('active');

        for (dir of [0, 60, 120, 180, 240, 300]) {
            delta = deltas[(tile.angle + dir) % 360];
            neib = this._getFromPoint(tile.x + delta.x, tile.y + delta.y);
            if (!neib) continue;
            if (neib.isActive() || neib.isLocked()) continue;

            if (neib.angle != tile.angle) continue;
            if (tile.init_state.x + deltas[dir].x != neib.init_state.x) continue;
            if (tile.init_state.y + deltas[dir].y != neib.init_state.y) continue;
            this._checkNeib(neib);
        }
    }
}
