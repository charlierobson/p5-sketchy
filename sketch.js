var dfile;
var imgtarget;

function preload(){
  dfile = new dfilezx81();
  dfile.preload();
}

function setup() {
  createCanvas(800, 600);
  imgtarget = createImage(256,192);
  noSmooth();
}

function draw() {
  background(128);
  dfile.render(imgtarget);
  image(imgtarget, 0, 0, 512, 384);
}
