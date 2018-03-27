var dfile;
var imgtarget;
var imgLcursor;
var dfilePanel;

function preload() {
  dfile = new dfilezx81();
  dfile.preload();
}

function setup() {
  createCanvas(800, 600);
  imgtarget = createImage(256, 192);
  imgLcursor = dfile.char(0xb1);
  noSmooth();

  dfilePanel = new dfilePanel_t();
}

function draw() {
  background(128);
  dfile.render(imgtarget);
  image(imgtarget, 0, 0, 512, 384);

  if ((millis() & 512) == 0) image(imgLcursor, dfile.cx * 16, dfile.cy * 16, 16, 16);
}

function mouseClicked() {
  dfilePanel.mouseClicked(0, 0);
}

function keyPressed() {
  console.log("key: " + key.charCodeAt(0));
  if (keyCode === BACKSPACE) {
    dfile.cursorLeft();
    dfile.rst10_ascii(" ");
    dfile.cursorLeft();
    return;
  } else if (keyCode === UP_ARROW) {
    dfile.cursorUp();
    return;
  } else if (keyCode === DOWN_ARROW) {
    dfile.cursorDown();
    return;
  } else if (keyCode === LEFT_ARROW) {
    dfile.cursorLeft();
    return;
  } else if (keyCode === RIGHT_ARROW) {
    dfile.cursorRight();
    return;
  }

  dfile.rst10_ascii(key);
}

function dfilePanel_t() {
  this.mouseClicked = function (xo, yo) {
    if (mouseX < xo || mouseX - xo >= 512 ||
      mouseY < yo || mouseY - yo >= 384) {
      return;
    }

    //this.deselect();
    dfile.cx = (int)(mouseX / 16);
    dfile.cy = (int)(mouseY / 16);
  }
}
