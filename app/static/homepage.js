

let swap_tiles = new Grid('title');
swap_tiles.fitTitle();

let galleries = new Grid('galleries');
galleries.fitGalleries();

window.onresize = () => { galleries.fitGalleries(); };
