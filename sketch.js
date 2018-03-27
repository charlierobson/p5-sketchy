
var dfile;
var imgtarget;
var imgLcursor;
var dfilePanel;

var plotmode = 0;
var plotting = false;


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

  if (plotting) {
    text("plot " + plotmode, 8, 400);
  } else {
    if ((millis() & 512) == 0) image(imgLcursor, dfile.cx * 16, dfile.cy * 16, 16, 16);
    text("text", 8, 400);
  }
}

function mouseClicked() {
  dfilePanel.mouseClicked();
}

function mouseDragged() {
  dfilePanel.mouseDragged();
}

function mousePressed() {
  let px = mouseX / 8;
  let py = mouseY / 8;
  plotmode = dfile.pleek(px, py) ? 0 : 1;
}

function keyPressed() {
  if (keyCode === BACKSPACE) {
    dfile.cursorLeft();
    dfile.rst10_ascii(" ");
    dfile.cursorLeft();
  } else if (keyCode === UP_ARROW) {
    dfile.cursorUp();
  } else if (keyCode === DOWN_ARROW) {
    dfile.cursorDown();
  } else if (keyCode === LEFT_ARROW) {
    dfile.cursorLeft();
  } else if (keyCode === RIGHT_ARROW) {
    dfile.cursorRight();
  }
}

function keyTyped() {
  print(key, typeof key);
  let zxcc = dfile.a2z(key);
  dfile.rst10_zeddy(zxcc);
}

function dfilePanel_t() {
  this.xo = 0;
  this.yo = 0;

  this.mouseWithin = function () {
    return mouseX >= this.xo &&
      mouseX - this.xo < 512 &&
      mouseY >= this.yo &&
      mouseY - this.yo < 384;
  }

  this.mouseClicked = function () {
    if (!this.mouseWithin()) {
      return;
    }

    if (plotting) {
      plotting = false;
    } else {
      dfile.cx = (int)(mouseX / 16);
      dfile.cy = (int)(mouseY / 16);
    }
  }

  this.mouseDragged = function () {
    if (!this.mouseWithin()) {
      return;
    }

    plotting = true;

    dfile.plot((int)(mouseX / 8), (int)(mouseY / 8), plotmode);
  }
}
