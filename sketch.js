
var dfile;
var imgtarget;
var imgLcursor;
var imgGcursor;

var dfilePanel;
var modeButton;

var allButtons;

var plotting = false;

function preload() {
  dfile = new dfilezx81();
  dfile.preload();
}

function setup() {
  createCanvas(800, 600);
  imgtarget = createImage(256, 192);
  imgLcursor = dfile.char(0xb1);
  imgGcursor = dfile.char(0xac);
  noSmooth();

  dfilePanel = new DFilePanel(8, 8, 512, 384);
  modeButton = new ModeButton(24, 400, 16, 16);
  allButtons = [ dfilePanel, modeButton ];
}

function draw() {
  background(128);

  dfilePanel.draw();

  fill(0);
  noStroke();

  if (!plotting) {
    let img = modeButton.mode == 0 ? imgLcursor : imgGcursor;
    if ((millis() & 512) == 0) image(img, dfile.cx * 16 + dfilePanel.x, dfile.cy * 16 + dfilePanel.y, 16, 16);
  }

  modeButton.draw();
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
  dfile.rst10_zeddy(zxcc + modeButton.mode);
}


function tellButtons(thingToDo) {
  for (let x of allButtons) {
    thingToDo(x);
  }
}

function mouseMoved() {
  tellButtons((x)=>{x.mouseMoved()});
}

function mouseClicked() {
  tellButtons((x)=>{x.mouseClicked()});
}

function doubleClicked() {
  tellButtons((x)=>{x.doubleClicked()});
}

function mouseDragged() {
  tellButtons((x)=>{x.mouseDragged()});
}

function mousePressed() {
  tellButtons((x)=>{x.mousePressed()});
}
