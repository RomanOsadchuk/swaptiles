

class Grid {
    el; size; count = 4; tiles = {};

    _size2() { return Math.floor(this.size * 2 / ROOT_3); }
    _offset() { return Math.ceil(this.size * ROOT_3 / 2); }
    _quarter() { return this._size2() - this._offset(); }

    constructor(elenemt_) {
        this.el = elenemt_;
        new Swapper(this);
    }

    _removeTiles(class_name) {
        let tile, pos;
        for (let tile of this.tileArray(class_name)) {
            tile.el.remove();
            pos = tile.grid_x + '|' + tile.grid_y;
            delete this.tiles[pos];
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
            this.createTile(x + pic_x, y + pic_y, CANVAS.toDataURL('image/jpeg'));

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
        this.el.classList.add('vertical');
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

        for (tile of this.tileArray())
            { tile.true_x = -1; tile.true_y = -1; }
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
            if (!tile.isFixed()) tile.rotateRandom();
    }

    createTile(x, y, image_src, action) {
        let tile = new Tile(x, y, image_src, action);
        this.el.appendChild(tile.el);
        this.tiles[x+'|'+y] = tile;
    }

    putInto(tile, x, y) {
        tile.putInto(x, y);
        this.tiles[x+'|'+y] = tile;
        if (tile.isFixed()) tile._shake();
    }

    tileArray(class_name) {
        let result = [];
        
        for (let tile of Object.values(this.tiles))
            if (!class_name || tile.el.classList.contains(class_name))
                result.push(tile);
        return result;
    }

    snap(dx, dy) {
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
}
