

class Tile {
    el; x0; y0; x; y; action;

    constructor(x, y, image_src, action) {
        this.x0 = x;  this.x = x;
        this.y0 = y;  this.y = y;
        this.action = action || null;
        this.el = document.createElement('div');
        this.el.style.left = x + 'px';
        this.el.style.top = y + 'px';
        this.el.appendChild(this.createImage(x, y, image_src, action));

        this.el.oncontextmenu = (e) => { return false; };
        this.el.onmousedown = (e) => { this.touch(e); };
        this.el.onmouseup = (e) => { this.release(e); };
    }

    createImage(x, y, image_src, action) {
        let pic = document.createElement('img');
        pic.src = image_src;
        pic.dataset.position = x+'|'+y;
        pic.dataset.rotation = '0';
        if (action) pic.dataset.action = action;
        return pic;
    }

    _getAction() { return this.el.firstChild.dataset.action || null; }

    t0; apriori_selected; apriori_rotation;

    touch(event) {
        if (event) event.preventDefault();
        if (this.el.classList.contains('fixed')) {
            this.el.classList.remove('shaking');
            void this.el.offsetWidth;
            this.el.classList.add('shaking');
            return;
        }

        this.t0 = Date.now();
        this.x = this.x0;  this.y = this.y0;
        this.apriori_selected = this.el.classList.contains('selected');
        this.apriori_rotation = this.el.firstChild.dataset.rotation;
        this.el.classList.add('selected');
    }

    release(event) {
        this.shift(0, 0);
        if (Date.now() - this.t0 > 300) return;

        if (this.apriori_selected)
            this.el.classList.remove('selected');
        else this.el.classList.add('selected');
        event.quick_tap = true;
        event.action = this.el.firstChild.dataset.action;
        if (event.action) this.el.classList.remove('selected');
    }

    shift(dx, dy) {
        this.el.style.left = this.x + dx + 'px';
        this.el.style.top = this.y + dy + 'px';
    }

    fixIfInPlace() {
        if (this._inPlace()) this.el.classList.add('fixed');
    }

    _inPlace() {
        let ds = this.el.firstChild.dataset;
        return (ds.position == this.x0+'|'+this.y0) && (ds.rotation == '0');
    }

    resetPosition (reset_rotation) {
        this.el.style.left = this.x0 + 'px';
        this.el.style.top = this.y0 + 'px';
        if (reset_rotation) {
            let pic = this.el.firstChild;
            pic.dataset.rotation = this.apriori_rotation;
            pic.style.transform = 'rotate(' + this.apriori_rotation + 'deg)';
        }
    }

}
