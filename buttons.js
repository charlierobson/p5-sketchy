const Buttonx = function (x, y, w, h) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.state = 0
}

Buttonx.prototype.mouseWithin = function () {
    return mouseX >= this.x &&
        mouseX < this.x + this.w &&
        mouseY >= this.y &&
        mouseY < this.y + this.h
}

Buttonx.prototype.showHilite = function () {
}

Buttonx.prototype.draw = function () {
}

Buttonx.prototype.mouseMoved = function () {
    switch (this.state) {
        case 0: { // not active
            if (this.mouseWithin()) {
                // become active
                this.state = 1
            }
        }
            break;

        case 1: { // active
            if (!this.mouseWithin()) {
                // become inactive
                this.state = 0
            }
        }
            break;
    }
}

Buttonx.prototype.mouseDragged = function () {
}

Buttonx.prototype.mouseClicked = function () {
}

Buttonx.prototype.mousePressed = function () {
}

Buttonx.prototype.doubleClicked = function () {
}

// ----------------------------------------------------------------------------------------

const ModeButton = function (x, y, w, h) {
    Buttonx.call(this, x, y, w, h)
    this.mode = 0
}

ModeButton.prototype = Object.create(Buttonx.prototype);

ModeButton.prototype.showHilite = function () {
    strokeWeight(2);
    noFill();
    stroke(color(0, 255, 0));
    rect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);
}

ModeButton.prototype.draw = function () {
    fill(0);
    textAlign(CENTER, CENTER);
    text("Mode", this.x + this.w / 2, this.y + this.h + 10);
    image(this.mode == 0 ? imgLcursor : imgGcursor, this.x, this.y, this.w, this.h);
    if (this.state == 1) {
        this.showHilite();
    }
}

ModeButton.prototype.mouseClicked = function () {
    if (this.state == 1) {
        this.mode = 128 - this.mode;
    }
}

// ----------------------------------------------------------------------------------------

const DFilePanel = function (x, y, w, h) {
    Buttonx.call(this, x, y, w, h)
    this.plotmode = 0
    this.imgtarget = createImage(256, 192);
}

DFilePanel.prototype = Object.create(Buttonx.prototype);

DFilePanel.prototype.showHilite = function () {
    strokeWeight(2);
    noFill();
    stroke(color(0, 255, 0));
    rect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);
}

DFilePanel.prototype.draw = function () {
    dfile.render(this.imgtarget);
    image(this.imgtarget, this.x, this.y, this.w, this.h);
}

DFilePanel.prototype.doubleClicked = function () {
    if (!this.mouseWithin()) {
        return;
    }

    plotting = false;
    dfile.cx = (int)((mouseX - this.x) / 16);
    dfile.cy = (int)((mouseY - this.y) / 16);
}

DFilePanel.prototype.mouseDragged = function () {
    if (!this.mouseWithin()) {
        return;
    }

    plotting = true;

    dfile.plot((int)((mouseX - this.x) / 8), (int)((mouseY - this.y) / 8), this.plotmode);
}

DFilePanel.prototype.mousePressed = function () {
    let px = (int)((mouseX - this.x) / 8);
    let py = (int)((mouseY - this.y) / 8);
    this.plotmode = dfile.pleek(px, py) ? 0 : 1;
}