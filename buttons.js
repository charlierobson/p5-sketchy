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
    Buttonx.call(this, x, y, 6 * 16, 16)
}

ModeButton.prototype = Object.create(Buttonx.prototype);

ModeButton.prototype.showHilite = function () {
    strokeWeight(2);
    noFill();
    stroke(color(0, 255, 0));
    rect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);
}


ModeButton.prototype.draw = function () {
    let text = "MODE:"
    text += mode == 0 ? "L" : "G"
    drawZeddyText(text, this.x, this.y, mode == 128);
    if (this.state == 1) {
        this.showHilite();
    }
}

ModeButton.prototype.mouseClicked = function () {
    if (this.state == 1) {
        mode = 128 - mode;
    }
}

// ----------------------------------------------------------------------------------------

const TextButton = function (text, x, y, thingToDo) {
    Buttonx.call(this, x, y, text.length * 16, 16)
    this.text = text
    this.thingToDo = thingToDo
}

TextButton.prototype = Object.create(Buttonx.prototype);

TextButton.prototype.showHilite = function () {
    strokeWeight(2);
    noFill();
    stroke(color(0, 255, 0));
    rect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);
}

TextButton.prototype.draw = function () {
    drawZeddyText(this.text, this.x, this.y);
    if (this.state == 1) {
        this.showHilite();
    }
}

TextButton.prototype.mouseClicked = function () {
    if (this.state == 1) {
        this.thingToDo();
    }
}


// ----------------------------------------------------------------------------------------

const CharButton = function (chr, x, y) {
    Buttonx.call(this, x, y, 16, 16)
    this.chr = (chr & 63) + (chr > 63 ? 128 : 0)
}

CharButton.prototype = Object.create(Buttonx.prototype);

CharButton.prototype.showHilite = function () {
    strokeWeight(2);
    noFill();
    stroke(color(0, 255, 0));
    rect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);
}

CharButton.prototype.draw = function () {
    image(dfile.char(this.chr), this.x, this.y, 16, 16);
    if (this.state == 1) {
        this.showHilite();
    }
    if (selectedChr == this.chr) {
        this.showHilite();
    }
}

CharButton.prototype.mouseClicked = function () {
    if (this.state == 1) {
        selectedChr = this.chr
    }
}

CharButton.prototype.doubleClicked = function () {
    if (this.state == 1) {
        if (!plotting) {
            dfile.rst10_zeddy(this.chr)
        }
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
    if (this.dragEndX != -1) {
        noFill()
        strokeWeight(1)
        stroke((millis() & 512) == 512 ? color(200, 0, 0) : color(0, 200, 0))

        rect(this.selrectx * 16 + this.x, this.selrecty * 16 + this.y, this.selrectw * 16, this.selrecth * 16)
    }
}

DFilePanel.prototype.doubleClicked = function () {
    if (!this.mouseWithin()) {
        return;
    }

    plotting = false;
    dfile.cx = (int)((mouseX - this.x) / 16);
    dfile.cy = (int)((mouseY - this.y) / 16);
}

DFilePanel.prototype.selectionRect = function () {
    return new rect_t(this.selrectx, this.selrecty, this.selrectw, this.selrecth)
}

DFilePanel.prototype.mouseDragged = function () {
    if (!this.mouseWithin()) {
        return;
    }
    plotting = true;
    if (mode == 128) {
        dfile.plot((int)((mouseX - this.x) / 8), (int)((mouseY - this.y) / 8), this.plotmode);
    } else {
        this.dragEndX = (int)((mouseX - this.x) / 16);
        this.dragEndY = (int)((mouseY - this.y) / 16);
        this.selrectx = Math.min(this.dragStartX, this.dragEndX)
        this.selrecty = Math.min(this.dragStartY, this.dragEndY)
        this.selrectw = Math.abs(this.dragStartX - this.dragEndX) + 1
        this.selrecth = Math.abs(this.dragStartY - this.dragEndY) + 1
    }
}

DFilePanel.prototype.mousePressed = function () {
    if (this.state == 1) {
        let px = (int)((mouseX - this.x) / 8);
        let py = (int)((mouseY - this.y) / 8);
        this.dragStartX = (int)((mouseX - this.x) / 16);
        this.dragEndX = -1
        this.dragStartY = (int)((mouseY - this.y) / 16);
        this.plotmode = dfile.pleek(px, py) ? 0 : 1;
    }
}
