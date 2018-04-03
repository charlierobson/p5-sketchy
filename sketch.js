var dfile;
var dfilePanel;

var mode;

var modalButtons = [];
var globalButtons = [];

var selectedChr = 0;

function rect_t(x, y, w, h) {
  this.x = x
  this.y = y,
  this.w = w,
  this.h = h
}

function preload() {
  dfile = new dfilezx81();
  dfile.preload();
}

function filedropped(dropped) {
  if (dropped.type === 'text') {
    let strings = dropped.data
    if (!dfile.load(strings)) {
      dfile.printat(1, 1, "INVALID FILE")
    }
  }
}

function setup() {
  let c = createCanvas(740, 600);

  c.drop(filedropped)

  noSmooth();

  dfilePanel = new DFilePanel(8, 8, 512, 384);

  globalButtons = [
    dfilePanel,
    new TextButton("CLS", 24, 400, () => { dfile.cls() }),
    new TextButton("SAVE", 4 * 16 + 24, 400, () => { dfile.save() }),
    new TextButton("LOAD", 9 * 16 + 24, 400, () => { dfile.cls(); dfile.printat(1, 1, "DROP SCREEN DATA FILE HERE") }),
  ]

  for (let i = 0; i < 128; i++) {
    globalButtons.push(new CharButton(i, 540 + (i & 7) * 24, 12 + (int)(i / 8) * 24))
  }

  mode = new LMode();
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

  tellButtons((x) => { x.draw() });
  mode.draw();
}

function tellButtons(thingToDo) {
  for (let x of globalButtons) {
    thingToDo(x)
  }
  for (let x of modalButtons) {
    thingToDo(x)
  }
}

function keyPressed() {
  mode.keyPressed()
}

function keyTyped() {
  mode.keyTyped()
}

function mouseClicked() {
  tellButtons((x) => { x.mouseClicked() })
}

function doubleClicked() {
  tellButtons((x) => { x.doubleClicked() })
  mode.doubleClicked()
}

function mouseMoved() {
  tellButtons((x) => { x.mouseMoved() })
  mode.mouseMoved()
}

function mouseDragged() {
  tellButtons((x) => { x.mouseDragged() })
  mode.mouseDragged()
}

function mousePressed() {
  tellButtons((x) => { x.mousePressed() })
  mode.mousePressed()
}

function mouseReleased() {
  mode.mouseReleased()
}
