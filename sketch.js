
var dfile;
var imgtarget;
var imgLcursor;
var imgGcursor;

var dfilePanel;

var globalButtons = [];
var modalButtons = [];

var mode;
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

function copyrgn(rcy) {
  this.copyM = new ArrayBuffer(rcy.w * rcy.h);
  this.copyA = new Uint8Array(this.copyM);
  this.copyBMap = createImage(w * 16, h * 16)
  for (let b = 0, yy = rcy.y; yy < rcy.y + rcy.h; ++yy) {
    for (let xx = rcy.x; xx < rcy.x + rcy.w; ++xx) {
      let cc = dfile.getCharAt(xx, yy)
      this.copyA[b++] = cc
      this.copyBMap.copy(dfile.char(cc), 0, 0, 8, 8, xx * 16, yy * 16, 16, 16);
    }
  }

  function paste(rcy) {
    for (let b = 0, yy = rcy.y; yy < rcy.y + rcy.h; ++yy) {
      for (let xx = rcy.x; xx < rcy.x + rcy.w; ++xx) {
        dfile.setCharAt(xx, yy, this.copyA[b++])
      }
    }
  }

  function draw(x, y) {
    image(this.copyBMap, x * 16 + dfile.x, y * 16 + dfile.y)
  }
}

var clipboard;

function cpr(udp) {
  // let cr = dfilePanel.selectionRect()
  // clipboard = this.copyrgn(cr)
  // this.fillrgn(cr, 0)
  // udp(cr)
  // clipboard.paste(cr)
  // clipboard = null
}

function keyPressed() {
  mode.keyPressed()
  /*
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
  */
}

function keyTyped() {
  mode.keyTyped()
}

function tellButtons(thingToDo) {
  for (let x of globalButtons) {
    thingToDo(x)
  }
  for (let x of modalButtons) {
    thingToDo(x)
  }
}

function mouseMoved() {
  tellButtons((x) => { x.mouseMoved() })
}

function mouseClicked() {
  tellButtons((x) => { x.mouseClicked() })
}

function doubleClicked() {
  tellButtons((x) => { x.doubleClicked() })
  mode.doubleClicked()
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
