

let swap_tiles = new Grid(document.getElementById('title'));
swap_tiles.fitTitle();

let galleries = new Grid(document.getElementById('galleries'));
galleries.fitGalleries();

window.onresize = () => { galleries.fitGalleries(); };
