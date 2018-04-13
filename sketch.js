var dfile;
var dfilePanel;
var mode;
var modalButtons = [];
var globalButtons = [];

var undoBuffer = [];
var undoLevel = 0;

var selectedChr = 0;

var config = new Object();


function rect_t(x, y, w, h) {
  this.x = x
  this.y = y,
  this.w = w,
  this.h = h
};

function preload() {
  dfile = new dfilezx81();
  dfile.preload();
};

function filedropped(dropped) {
  if (dropped.type === 'text') {
    let strings = dropped.data;
    if (!dfile.load(strings)) {
      dfile.printat(1, 1, "INVALID FILE");
    } else {
      resetUndo(); 
    }
  } else if (dropped.type === 'image') {
    let img = loadImage(dropped.data, function()
      {
        console.log(img.width, img.height);
        dfile.importpng6448(img);
      });
  }
};

function setup() {
  let c = createCanvas(740, 600);

  c.drop(filedropped)

  noSmooth();

  dfilePanel = new DFilePanel(8, 8, 512, 384);

  resetUndo()

  let params = getURLParams();

  if (params.usenl != undefined) {
    config['usenl'] = params.usenl === "true";
  }
  else config['usenl'] = true;

  globalButtons = [
    dfilePanel,
    new TextButton("CLS", 24, 408, () => { dfile.cls(); snapUndo() }),
    new TextButton("SAVE", 4 * 16 + 24, 408, () => { dfile.save() }),
    new TextButton("LOAD", 9 * 16 + 24, 408, () => { dfile.cls(); dfile.threedmm(); }),
    new TextButton("UNDO", 14 * 16 + 24, 408, () => { undo() }, () => undoLevel != 0),
    new TextButton("REDO", 19 * 16 + 24, 408, () => { redo() }, () => undoLevel != undoBuffer.length-1),
  ]

  for (let i = 0; i < 128; i++) {
    globalButtons.push(new CharButton(i, 540 + (i & 7) * 24, 12 + (int)(i / 8) * 24));
  }

  globalButtons.push(new CharButtonToggle(6, 540 + 7 * 24, 408, true, (s)=>{dfile.checks = s}));

  mode = new LMode();
};

function resetUndo () {
  undoBuffer = [];
  undoBuffer.push(dfile.buffer());
  undoLevel = undoBuffer.length - 1;
  dfile.changed = false;
};

function snapUndo () {
  if (!dfile.changed) return;

  undoBuffer = undoBuffer.slice(0, undoLevel + 1);
  undoBuffer.push(dfile.buffer());
  undoLevel = undoBuffer.length - 1;

  dfile.changed = false;
};

function undo () {
  if (undoLevel == 0) return;

  --undoLevel
  dfile.regionalAction(0, 0, 32, 24, (n, c) => undoBuffer[undoLevel][n]);
  dfile.changed = false;
};

function redo () {
  if (undoLevel == undoBuffer.length - 1) return;

  ++undoLevel;
  dfile.regionalAction(0, 0, 32, 24, (n, c) => undoBuffer[undoLevel][n]);
  dfile.changed = false;
};

function drawZeddyText(text, x, y, isInverse) {
  for (let i = 0; i < text.length; i++) {
    image(dfile.char(dfile.a2z(text.charAt(i))), x, y, 16, 16);
    x += 16;
  }
};

function draw() {
  background(128);

  fill(0);
  noStroke();

  tellButtons((x) => { x.draw(); })
  mode.draw();

  let o = 1 + dfile.cx + 33 * dfile.cy;
  fill(0)
  noStroke()
  text('Selected char: $'+hex(selectedChr, 2), 540, 408)
  text('Cursor X,Y: $'+hex(dfile.cx, 2)+',$'+hex(dfile.cy, 2), 540, 428)
  text('Cursor d-file byte offset: $'+hex(o, 3), 540, 448)
  text('Char at cursor pos: $'+hex(dfile.getCharAt(dfile.cx, dfile.cy), 2), 540, 468)
};

function tellButtons(thingToDo) {
  for (let x of globalButtons) {
    thingToDo(x);
  }
  for (let x of modalButtons) {
    thingToDo(x);
  }
}

function keyPressed() {
  if (mode != undefined)
    mode.keyPressed();
};

function keyTyped() {
  if (mode != undefined)
    mode.keyTyped();
};

function mouseClicked() {
  tellButtons((x) => { x.mouseClicked(); })
};

function doubleClicked() {
  tellButtons((x) => { x.doubleClicked(); })
  if (mode != undefined)
    mode.doubleClicked();
};

function mouseMoved() {
  tellButtons((x) => { x.mouseMoved(); })
  if (mode != undefined)
    mode.mouseMoved();
}

function mouseDragged() {
  tellButtons((x) => { x.mouseDragged(); })
  if (mode != undefined)
    mode.mouseDragged();
};

function mousePressed() {
  tellButtons((x) => { x.mousePressed(); })
  if (mode != undefined)
    mode.mousePressed();
};

function mouseReleased() {
  if (mode != undefined)
    mode.mouseReleased();
};
