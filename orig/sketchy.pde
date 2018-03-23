import controlP5.*;
ControlP5 cp5;

DFileZX81 dfile;

int mode;
boolean ctrl, shift;

int sf = 2;
int scnx = 4;
int scny = 4;

boolean selection;
int selectxstart, selectystart;
int selrectx, selrecty, selrectw, selrecth;


int mx() {
  int mx = (mouseX - scnx) / sf / 8;
  return Math.max(Math.min(mx, 31), 0);
}

int my() {
  int my = (mouseY - scny) / sf / 8;
  return Math.max(Math.min(my, 23), 0);
}

int mxhr() {
  int mx = (mouseX - scnx) / sf / 4;
  return Math.max(Math.min(mx, 63), 0);
}

int myhr() {
  int my = (mouseY - scny) / sf / 4;
  return Math.max(Math.min(my, 47), 0);
}



void setup() {
  size(800, 600);
  noSmooth();

  cp5 = new ControlP5(this);

  dfile = new DFileZX81();
  PImage checker = dfile.render();
  checker.save("checker.png");

  selrectx = -1;
  selrecty = -1;

  cp5.addButton("load").setPosition(10, 420).setSize(100, 20);
  cp5.addButton("save").setPosition(150, 420).setSize(100, 20);
  cp5.addButton("fill").setPosition(10, 450).setSize(100, 20);
  cp5.addButton("invert").setPosition(150, 450).setSize(100, 20);
}

public void fill() {
  dfile.fill(selrectx, selrecty, selrectw, selrecth, (char)selectedchar);
}

public void invert() {
  for (int yy = selrecty; yy < selrecty + selrecth; ++yy) {
    for (int xx = selrectx; xx < selrectx + selrectw; ++xx) {
      dfile.setz(xx, yy, (char)(dfile.getc(xx, yy) ^ 128));
    }
  }
}

public void load() {
  selectInput("Select a file to load from:", "fileSelectedLoad");
}

void fileSelectedLoad(File selection) {
  if (selection != null) {
    dfile.load(selection.getAbsolutePath());
  }
}

public void save() {
  selectOutput("Select a file to write to:", "fileSelectedSave");
}

void fileSelectedSave(File selection) {
  if (selection != null) {
    dfile.save(selection.getAbsolutePath());
  }
}


void draw() {
  background(200);
  image(dfile.render(), scnx, scny, 256 * sf, 192 * sf);

  fill(0);
  text(ctrl ? "Draw mode: PLOT" : "Draw mode: CHAR", 8, 400);
  noFill();
  if (!ctrl) {
    stroke((millis() & 512) == 512 ? color(128, 0, 0) : color(0, 128, 0));

    if (selection) {
      rect(selrectx * 8 * sf + scnx, selrecty * 8 * sf + scny, selrectw * 8 * sf, selrecth * 8 * sf);
    } else {
      rect((dfile.cursorx() * 8 * sf) + scnx-1, (dfile.cursory() * 8 * sf) + scny-1, 8 * sf + 1, 8 * sf + 1);
    }
  }
  for (int i = 0; i < 64; ++i) {
    image(dfile.charimg(i), 10 + 16 * (i % 32), 490 + 16 * (i / 32));
    image(dfile.charimg(i+128), 10 + 16 * (i % 32), 490 + 32 + 16 * (i / 32));
  }
  
  int sc = selectedchar;
  if (sc > 127) {
    sc -= 64;
  }
  int scx = sc % 32;
  int scy = sc / 32;
  stroke(scy > 1 ? 255 : 0);
  rect(scx * 16 + 10-2, scy * 16 + 490-2, 11, 11);
}

int selectedchar = 0;

int mouseOverChar() {
  if (mouseY >= 490 - 4 && mouseY < 490 - 4 + 64 && mouseX >= 6 && mouseX < 10 + 31 * 16 + 8 + 4) {
    int x = (mouseX - (10 - 4)) / 16;
    int y = (mouseY - (490 - 4)) / 16;
    return x + 32 * y + (y > 1 ? 64 : 0);
  }

  return -1;
}

void updateBit(int mode) {
  dfile.plot(mxhr(), myhr(), mode);
}

boolean mouseInZeddyScreen() {
  return mouseX >= scnx &&
    mouseX < scnx + 512 &&
    mouseY >= scny &&
    mouseY < scny + 384;
}

void mousePressed() {
  if (shift) {
    selectxstart = mx();
    selectystart = my();
  } else if (mouseInZeddyScreen()) {
    mode = dfile.pleek(mxhr(), myhr()) ? DFileZX81.RESET : DFileZX81.SET;
  }
}

void mouseDragged() {
  if (ctrl) { 
    updateBit(mode);
  } else if (shift) {
    selection = true;
    selrectw = Math.abs(selectxstart - mx()) + 1;
    selrecth = Math.abs(selectystart - my()) + 1;
    selrectx = Math.min(selectxstart, mx());
    selrecty = Math.min(selectystart, my());
  }
}

void mouseClicked() {
  if (mouseInZeddyScreen()) {
    selection = false;

    if (ctrl) {
      updateBit(DFileZX81.XOR);
    } else {
      dfile.setcurpos(mx(), my());
      selrectx = 0;
      selrecty = 0;
      selrectw = 32;
      selrecth = 24;
    }
  } else {
    int charnum = mouseOverChar();
    if (charnum != -1) {
      selectedchar = charnum;
    }
  }
}


void keyPressed() {
  ctrl = key==CODED && keyCode == CONTROL;
  shift = key==CODED && keyCode == SHIFT;
  if (ctrl || shift) return;

  if (key == CODED) {
    if (keyCode == UP) {
      dfile.cursorup();
    } else if (keyCode == DOWN) {
      dfile.cursordown();
    } else  if (keyCode == LEFT) {
      dfile.cursorleft();
    } else  if (keyCode == RIGHT) {
      dfile.cursorright();
    }
    return;
  }

  if (selection) return;
  if (key == BACKSPACE) {
    dfile.cursorleft();
    dfile.putc(' ');
    dfile.cursorleft();
    return;
  } else if (keyCode == TAB) {
    dfile.putz(selectedchar);
    return;
  }

  dfile.putc(key);
}


void keyReleased() {
  if (key==CODED && keyCode == CONTROL) {
    ctrl = false;
  }
  if (key==CODED && keyCode == SHIFT) {
    shift = false;
  }
}