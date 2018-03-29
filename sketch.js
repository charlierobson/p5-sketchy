
var dfile;
var imgtarget;
var imgLcursor;
var imgGcursor;

var dfilePanel;
var modeButton;

var allButtons = [];

var plotting = false;

var selectedChr = 0;

function preload() {
  dfile = new dfilezx81();
  dfile.preload();
}

function filedropped (dropped) {
  if (dropped.type === 'text') {
    let strings = dropped.data
    if (!dfile.load(strings)) {
      dfile.printat(1, 1, "INVALID FILE")
    }
  }
}


function setup() {
  let c = createCanvas(800, 740);

  c.drop(filedropped)
  imgtarget = createImage(256, 192);
  imgLcursor = dfile.char(0xb1);
  imgGcursor = dfile.char(0xac);
  noSmooth();

  dfilePanel = new DFilePanel(8, 8, 512, 384);
  modeButton = new ModeButton(24, 400);
  allButtons = [
    dfilePanel,
    modeButton,
    new TextButton("CLS", 8*16+24, 400, ()=>{dfile.cls()}),
    new TextButton("SAVE", 12*16+24, 400, ()=>{dfile.save()}),
    new TextButton("LOAD", 17*16+24, 400, ()=>{dfile.cls(); dfile.printat(1, 1, "DROP SCREEN DATA FILE HERE")})
  ];
  for (let i = 0; i < 128; i ++) {
    allButtons.push(new CharButton(i, 540 + (i & 7) * 24, 12 + (int)(i / 8) * 24))
  }
}

function drawZeddyText(text, x, y, isInverse) {
  for (let i = 0; i < text.length; i++) {
    image(dfile.char(dfile.a2z(text.charAt(i))), x, y, 16, 16);
    x += 16;
  }
}

function draw() {
  background(128);

  fill(0);
  noStroke();

  tellButtons((x)=>{x.draw()});

  if (!plotting) {
    let img = modeButton.mode == 0 ? imgLcursor : imgGcursor;
    if ((millis() & 512) == 0) image(img, dfile.cx * 16 + dfilePanel.x, dfile.cy * 16 + dfilePanel.y, 16, 16);
  }
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
