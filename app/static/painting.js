

let grid = new Grid(document.body),
    big_picture = document.getElementById('bigPicture');

grid.fitMenu();
window.onload = () => { grid.fitPicture(big_picture); };
document.body.style.overflow = 'hidden';


FILE_INPUT.onchange = () => {
    let file = FILE_INPUT.files[0],
        reader = new FileReader();

    big_picture.onload = () => { grid.fitPicture(big_picture); };
    reader.onload = (e) => { big_picture.src = e.target.result; };

    if (file) reader.readAsDataURL(file);
    // if (about) about.remove();
    // MENU_INTERACTION.about_btn.remove();
};


window.onresize = () => {
	grid.fitMenu();
	grid.fitPicture(big_picture); 
};
