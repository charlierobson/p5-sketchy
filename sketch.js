var dfile;

function preload(){
  dfile = new dfilezx81();
  dfile.preload();
}

function setup() {
  createCanvas(800, 600);
  noSmooth();
}

function draw() {
  background(128);
  image(dfile.render(), 0, 0, 512, 384);
}
