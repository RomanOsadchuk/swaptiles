

let puzzle = new Grid('puzzle'),
    menu = new Grid('actions', puzzle),
    big_picture = document.getElementById('bigPicture');
menu.fitMenu(['HOME', 'NEXT', 'PLUS', 'ROTATE', 'MINUS', 'IMAGE', 'INFO'], puzzle);
window.onload = () => { puzzle.fitPicture(big_picture); };


FILE_INPUT.onchange = () => {
    let file = FILE_INPUT.files[0],
        reader = new FileReader();

    big_picture.onload = () => { puzzle.fitPicture(big_picture); };
    reader.onload = (e) => { big_picture.src = e.target.result; };

    if (file) reader.readAsDataURL(file);
    // if (about) about.remove();
    // MENU_INTERACTION.about_btn.remove();
};


window.onresize = () => {
	menu.fitMenu(['HOME', 'NEXT', 'PLUS', 'ROTATE', 'MINUS', 'IMAGE', 'INFO'], puzzle);
	puzzle.fitPicture(big_picture); 
};