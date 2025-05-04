

const CONTROLLER = {
    file_reader: new FileReader(),
    mobile: /Mobi|Android|iPhone/i.test(navigator.userAgent),
    file_input: document.getElementById('fileInput'),
    shape_input: document.getElementById('shapeDropdown'),
    rotation_btn: document.getElementById('rotationBtn'),
    plus_size_btn: document.getElementById('plusSize'),
    minus_size_btn: document.getElementById('minusSize'),

    changeShape: function() {
        SHAPE = CONTROLLER.shape_input.value;
        MOSAIC.initiating.go();
    },

    toggleRotation: function() {
        if (CONTROLLER.rotation_btn.classList.contains('active'))
            CONTROLLER.rotation_btn.classList.remove('active');
        else
            CONTROLLER.rotation_btn.classList.add('active')
        ROTATION = !ROTATION;
        MOSAIC.initiating.go();
    },

    sizeInc: function() {
        let max_size = CONTROLLER.mobile ? 195 : 295;
        if (SIZE > max_size)
            return;
        SIZE += 10;
        document.getElementById('sizeLabel').textContent = SIZE;
        MOSAIC.initiating.go();
    },

    sizeDec: function() {
        let min_size = CONTROLLER.mobile ? 75 : 125;
        if (SIZE < min_size)
            return;
        SIZE -= 10;
        document.getElementById('sizeLabel').textContent = SIZE;
        MOSAIC.initiating.go();
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

        SIZE = CONTROLLER.mobile ? 130 : 250;
        document.getElementById('sizeLabel').textContent = SIZE;
        MOSAIC.initiating.go();
    }
};


window.onload = CONTROLLER.initiate;
