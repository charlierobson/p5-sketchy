
var dfile;
var imgtarget;
var imgLcursor;
var imgGcursor;

var dfilePanel;

var allButtons = [];

var mode = 0;
var plotting = false;

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
  imgtarget = createImage(256, 192);
  imgLcursor = dfile.char(0xb1);
  imgGcursor = dfile.char(0xac);
  noSmooth();

  dfilePanel = new DFilePanel(8, 8, 512, 384);

  allButtons = [
    dfilePanel,
    new ModeButton(24, 400),
    new TextButton("CLS", 8 * 16 + 24, 400, () => { dfile.cls() }),
    new TextButton("SAVE", 12 * 16 + 24, 400, () => { dfile.save() }),
    new TextButton("LOAD", 17 * 16 + 24, 400, () => { dfile.cls(); dfile.printat(1, 1, "DROP SCREEN DATA FILE HERE") }),
    new TextButton("FILL", 22 * 16 + 24, 400, () => { if (mode == 0) rgnFill() })
  ];
  for (let i = 0; i < 128; i++) {
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

  tellButtons((x) => { x.draw() });

  if (!plotting) {
    let img = mode == 0 ? imgLcursor : imgGcursor;
    if ((millis() & 512) == 0) image(img, dfile.cx * 16 + dfilePanel.x, dfile.cy * 16 + dfilePanel.y, 16, 16);
  }
}

function rgnFill() {
  dfile.fillrgn(dfilePanel.selrectx, dfilePanel.selrecty, dfilePanel.selrectw, dfilePanel.selrecth, selectedChr)
}

function fillrgn(rcy, c) {
  dfile.fillrgn(rcy.x, rcy.y, rcy.w, rcy.h, c)
}

function copyrgn(rcy) {
  this.copyM = new ArrayBuffer(rcy.w * rcy.h);
  this.copyA = new Uint8Array(this.copyM);
  for (let b = 0, yy = rcy.y; yy < rcy.y + rcy.h; ++yy) {
    for (let xx = rcy.x; xx < rcy.x + rcy.w; ++xx) {
      this.copyA[b++] = dfile.getCharAt(xx, yy);
    }
  }
}

function pastergn(rcy) {
  for (let b = 0, yy = rcy.y; yy < rcy.y + rcy.h; ++yy) {
    for (let xx = rcy.x; xx < rcy.x + rcy.w; ++xx) {
      dfile.setCharAt(xx, yy, this.copyA[b++])
    }
  }
}

function cpr(udp) {
  if (plotting && keyIsDown(SHIFT)) {
    let cr = dfilePanel.selectionRect()
    this.copyrgn(cr)
    this.fillrgn(cr, 0)
    udp(cr)
    this.pastergn(cr)
  }
}

function keyPressed() {
  if (keyCode === BACKSPACE) {
    dfile.cursorLeft();
    dfile.rst10_ascii(" ");
    dfile.cursorLeft();
  } else if (keyCode === UP_ARROW) {
    if (plotting && keyIsDown(SHIFT)) {
      cpr((cr) => {
        --cr.y
        --dfilePanel.selrecty
      });
    } else {
      dfile.cursorUp()
    }
  } else if (keyCode === DOWN_ARROW) {
    if (plotting && keyIsDown(SHIFT)) {
      cpr((cr) => {
        ++cr.y
        ++dfilePanel.selrecty
      })
    } else {
      dfile.cursorDown();
    }
  } else if (keyCode === LEFT_ARROW) {
    if (plotting && keyIsDown(SHIFT)) {
      cpr((cr) => {
        --dfilePanel.selrectx
        --cr.x
      })
    } else {
      dfile.cursorLeft()
    }
  } else if (keyCode === RIGHT_ARROW) {
    if (plotting && keyIsDown(SHIFT)) {
      cpr((cr) => {
        ++dfilePanel.selrectx
        ++cr.x
      })
    } else {
      dfile.cursorRight()
    }
  }
}

function keyTyped() {
  print(key, typeof key);
  let zxcc = dfile.a2z(key);
  dfile.rst10_zeddy(zxcc + mode);
}

function tellButtons(thingToDo) {
  for (let x of allButtons) {
    thingToDo(x);
  }
}

function mouseMoved() {
  tellButtons((x) => { x.mouseMoved() });
}

function mouseClicked() {
  tellButtons((x) => { x.mouseClicked() });
}

function doubleClicked() {
  tellButtons((x) => { x.doubleClicked() });
}

function mouseDragged() {
  tellButtons((x) => { x.mouseDragged() });
}

function mousePressed() {
  tellButtons((x) => { x.mousePressed() });
}
