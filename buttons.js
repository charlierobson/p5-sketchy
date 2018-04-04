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
    strokeWeight(2);
    noFill();
    stroke(color(0, 255, 0));
    rect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);
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

const TextButton = function (text, x, y, thingToDo, enableTestFn = function(){return true}) {
    Buttonx.call(this, x, y, text.length * 16, 16)
    this.text = text
    this.thingToDo = thingToDo
    this.enabled = enableTestFn
}

TextButton.prototype = Object.create(Buttonx.prototype)

TextButton.prototype.draw = function () {
    drawZeddyText(this.text, this.x, this.y);
    if (this.state == 1 && this.enabled()) {
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

CharButton.prototype.draw = function () {
    image(dfile.char(this.chr), this.x, this.y, 16, 16);
    if (this.state == 1 || selectedChr == this.chr) {
        this.showHilite();
    }
}

CharButton.prototype.mouseClicked = function () {
    if (this.state == 1) {
        selectedChr = this.chr
    }
}

CharButton.prototype.doubleClicked = function () {
    if (this.state == 1 && mode.acceptsCharacters) {
        dfile.rst10_zeddy(this.chr)
    }
}

// ----------------------------------------------------------------------------------------

const CharButtonToggle = function (chr, x, y, initialState, action) {
    Buttonx.call(this, x, y, 16, 16)
    this.chr = (chr & 63) + (chr > 63 ? 128 : 0)
    this.action = action
    this.selected = initialState
}

CharButtonToggle.prototype = Object.create(Buttonx.prototype);

CharButtonToggle.prototype.draw = function () {
    image(dfile.char(this.chr), this.x, this.y, 16, 16);
    if (this.state == 1 || this.selected) {
        this.showHilite();
    }
}

CharButtonToggle.prototype.mouseClicked = function () {
    if (this.state == 1) {
        this.selected = !this.selected
        this.action(this.selected)
    }
}

// ----------------------------------------------------------------------------------------

const DFilePanel = function (x, y, w, h) {
    Buttonx.call(this, x, y, w, h)
    this.imgtarget = createImage(256, 192);
}

DFilePanel.prototype = Object.create(Buttonx.prototype);

DFilePanel.prototype.draw = function () {
    dfile.render(this.imgtarget);
    image(this.imgtarget, this.x, this.y, this.w, this.h);
}
