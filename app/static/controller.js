

const CONTROLLER = {
    file_reader: new FileReader(),
    file_input: document.getElementById('fileInput'),
    shape_input: document.getElementById('shapeDropdown'),
    rotation_btn: document.getElementById('rotationBtn'),
    plus_size_btn: document.getElementById('plusSize'),
    minus_size_btn: document.getElementById('minusSize'),

    changeShape: function() {
        RESET_SHAPE(CONTROLLER.shape_input.value);
        MOSAIC.go();  // reSet
    },

    toggleRotation: function() {
        document.getElementById('hintText').textContent = MOBILE ?
            'Multi Tap to rotate' : 'Multi Click to rotate';
        if (this.classList.contains('active'))
            this.classList.remove('active');
        else this.classList.add('active')
        ROTATION = !ROTATION;
        MOSAIC.go();
    },

    sizeInc: function() {
        let max_size = MOBILE ? 195 : 295;
        if (SIZE > max_size) return;
        SHAPE.rescale(SIZE + 10);
        document.getElementById('sizeLabel').textContent = SIZE;
        MOSAIC.go();
    },

    sizeDec: function() {
        let min_size = MOBILE ? 75 : 125;
        if (SIZE < min_size) return;
        SHAPE.rescale(SIZE - 10);
        document.getElementById('sizeLabel').textContent = SIZE;
        MOSAIC.go();
    },

    newFileUploaded: function() {
        let file = CONTROLLER.file_input.files[0],
            details = document.getElementById('details');
        if (file) CONTROLLER.file_reader.readAsDataURL(file);
        if (details) details.remove();
    },

    initiate: function() {
        CONTROLLER.file_reader.onload = () => { MOSAIC.image.src = event.target.result; };
        CONTROLLER.file_input.onchange = CONTROLLER.newFileUploaded;
        CONTROLLER.shape_input.onchange = CONTROLLER.changeShape;
        CONTROLLER.rotation_btn.onclick = CONTROLLER.toggleRotation;
        CONTROLLER.plus_size_btn.onclick = CONTROLLER.sizeInc;
        CONTROLLER.minus_size_btn.onclick = CONTROLLER.sizeDec;

        MOSAIC.go();
    }
};


document.getElementById('sizeLabel').textContent = SIZE;
document.getElementById('hintText').textContent = MOBILE ?
    'Drag tile with finger to swap' : 'Drag tile with a cursor to swap';
RESET_SHAPE('HEXAGON');
window.onload = CONTROLLER.initiate;
