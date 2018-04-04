const Mode = function () {
    modalButtons = []
    this.acceptsCharacters = false
    this.help = []
}

Mode.prototype.end = function () {
    snapUndo();
}

Mode.prototype.showHelp = function () {
    fill(0)
    noStroke(0)
    let y = 480
    for (let s of this.help) {
        text(s, 24, y)
        y += 20
    }
}

Mode.prototype.draw = function () {
}

Mode.prototype.doubleClicked = function () {
}

Mode.prototype.mouseMoved = function () {
}

Mode.prototype.mouseDragged = function () {
}

Mode.prototype.mousePressed = function () {
}

Mode.prototype.mouseReleased = function () {
}

Mode.prototype.keyPressed = function () {
}

Mode.prototype.keyTyped = function () {
}

// ----------------------------------------------------------------------------------------


const TextMode = function (code) {
    Mode.call(this)

    this.help = [
        "Type to insert alphanumeric characters at cursor position. Backspace deletes.",
        "Double click in screen area or use cursor keys to update cursor position.",
        "Click a character in the character set to insert it at cursor position."
    ]

    let cc = dfile.a2z(code)
    this.cursor = dfile.char(cc + 128)

    this.acceptsCharacters = true
}

TextMode.prototype = Object.create(Mode.prototype)

TextMode.prototype.doubleClicked = function () {
    if (!dfilePanel.mouseWithin()) { return; }

    dfile.cx = (int)((mouseX - dfilePanel.x) / 16);
    dfile.cy = (int)((mouseY - dfilePanel.y) / 16);
    snapUndo();
}

TextMode.prototype.draw = function () {
    if ((millis() & 512) == 0) image(this.cursor, dfile.cx * 16 + dfilePanel.x, dfile.cy * 16 + dfilePanel.y, 16, 16);

    this.showHelp()
}

TextMode.prototype.keyPressed = function () {
    if (keyCode === BACKSPACE) {
        dfile.cursorLeft();
        dfile.rst10_ascii(" ");
        dfile.cursorLeft();
    } else if (keyCode === UP_ARROW) {
        dfile.cursorUp()
    } else if (keyCode === DOWN_ARROW) {
        dfile.cursorDown();
    } else if (keyCode === LEFT_ARROW) {
        dfile.cursorLeft()
    } else if (keyCode === RIGHT_ARROW) {
        dfile.cursorRight()
    }
}

// ----------------------------------------------------------------------------------------

const LMode = function () {
    TextMode.call(this, "L")

    modalButtons.push(new TextButton("MODE:L", 24, 440, () => { mode.end(); mode = new GMode() }));

    this.help.push("Drag mouse to select region.")
    this.help.push("Click MODE button for [G] mode where you can type inverse characters and plot.")
}

LMode.prototype = Object.create(TextMode.prototype)

LMode.prototype.keyTyped = function () {
    let zxcc = dfile.a2z(key);
    dfile.rst10_zeddy(zxcc);
}

LMode.prototype.mouseDragged = function () {
    if (!dfilePanel.mouseWithin()) { return; }

    mode.end()
    mode = new SelectMode()
}

// ----------------------------------------------------------------------------------------

const GMode = function () {
    TextMode.call(this, "G")

    modalButtons.push(new TextButton("MODE:G", 24, 440, () => { mode.end(); mode = new LMode() }));

    this.help.push("Drag mouse to PLOT pixels. Pixel under cursor at start determines whether you plot or unplot.")
    this.help.push("Click MODE button for [L] mode where characters are normal and you can select regions.")

    this.plotMode = 1
}

GMode.prototype = Object.create(TextMode.prototype)

GMode.prototype.keyTyped = function () {
    let zxcc = dfile.a2z(key);
    dfile.rst10_zeddy(zxcc + 128);
}

GMode.prototype.mousePressed = function () {
    if (!dfilePanel.mouseWithin()) { return; }

    let px = (int)((mouseX - dfilePanel.x) / 8);
    let py = (int)((mouseY - dfilePanel.y) / 8);

    this.plotMode = dfile.pleek(px, py) ? 0 : 1;
}

GMode.prototype.mouseDragged = function () {
    if (!dfilePanel.mouseWithin()) { return; }

    mode.end()
    mode = new PlotMode(this.plotMode)
}

// ----------------------------------------------------------------------------------------

const PlotMode = function (plotMode) {
    Mode.call(this)
    this.plotMode = plotMode
}

PlotMode.prototype = Object.create(Mode.prototype)

PlotMode.prototype.mouseDragged = function () {
    if (!dfilePanel.mouseWithin()) { return; }

    dfile.plot((int)((mouseX - dfilePanel.x) / 8), (int)((mouseY - dfilePanel.y) / 8), this.plotMode);
}

PlotMode.prototype.mouseReleased = function () {
    mode.end()
    mode = new GMode()
}


// ----------------------------------------------------------------------------------------

const SelectMode = function () {
    Mode.call(this)
    modalButtons = [
        new TextButton("FILL", 24, 440, () => {
            dfile.regionalAction(this.selrectx, this.selrecty, this.selrectw, this.selrecth, (n, c) => selectedChr)
            snapUndo()
        }),
        new TextButton("INVERT", 5 * 16 + 24, 440, () => {
            dfile.regionalAction(this.selrectx, this.selrecty, this.selrectw, this.selrecth, (n, c) => c ^ 128)
            snapUndo()
        }),
        new TextButton("COPY", 12 * 16 + 24, 440, () => { mode.end(); mode = new PasteMode(this.selrectx, this.selrecty, this.selrectw, this.selrecth) })
    ]

    this.dragStartX = (int)((mouseX - dfilePanel.x) / 16);
    this.dragStartY = (int)((mouseY - dfilePanel.y) / 16);
    this.dragEndX = -1

    this.help = [
        "Click in the screen area to deselect region and return to [L] mode.",
        "Click FILL after selecting a character to use.",
        "Click INVERT to invert the region.",
        "Click COPY to copy the content within the region.",
    ]
}

SelectMode.prototype = Object.create(Mode.prototype)

SelectMode.prototype.mouseDragged = function () {
    if (!dfilePanel.mouseWithin()) { return; }

    this.dragEndX = (int)((mouseX - dfilePanel.x) / 16)
    this.dragEndY = (int)((mouseY - dfilePanel.y) / 16)

    this.selrectx = Math.min(this.dragStartX, this.dragEndX)
    this.selrecty = Math.min(this.dragStartY, this.dragEndY)
    this.selrectw = Math.abs(this.dragStartX - this.dragEndX) + 1
    this.selrecth = Math.abs(this.dragStartY - this.dragEndY) + 1
}

SelectMode.prototype.draw = function () {
    if (this.dragEndX == -1) { return }

    noFill()
    strokeWeight(1)
    stroke((millis() & 512) == 512 ? color(200, 0, 0) : color(0, 200, 0))

    rect(this.selrectx * 16 + dfilePanel.x, this.selrecty * 16 + dfilePanel.y, this.selrectw * 16, this.selrecth * 16)

    this.showHelp()
}

SelectMode.prototype.mousePressed = function () {
    if (!dfilePanel.mouseWithin()) { return; }

    mode.end()
    mode = new LMode()
}

SelectMode.prototype.doubleClicked = function () {
    if (!dfilePanel.mouseWithin()) { return; }

    dfile.cx = (int)((mouseX - dfilePanel.x) / 16)
    dfile.cy = (int)((mouseY - dfilePanel.y) / 16)

    mode.end()
    mode = new LMode()
}

// ----------------------------------------------------------------------------------------

const PasteMode = function (srx, sry, srw, srh) {
    Mode.call(this)

    this.selrectx = srx
    this.selrecty = sry
    this.selrectw = srw
    this.selrecth = srh


    this.copyM = new ArrayBuffer(srw * srh);
    this.copyA = new Uint8Array(this.copyM);
    this.copyBMap = createImage(srw * 8, srh * 8)

    dfile.regionalAction(srx, sry, srw, srh, (n, c) => {
        this.copyBMap.copy(dfile.char(c), 0, 0, 8, 8, (n % srw) * 8, (int)(n / srw) * 8, 8, 8)
        this.copyA[n] = c
        return c
    })

    modalButtons.push(new TextButton("PASTE", 24, 440, () => {
        dfile.regionalAction(this.selrectx, this.selrecty, this.selrectw, this.selrecth, (n, c) => this.copyA[n])
        mode.end()
        mode = new LMode()
    }))

    this.help = [
        "Click in the screen area to deselect region and return to [L] mode.",
        "Click PASTE to update the screen with the copied region.",
        "Change the paste position with the cursor keys."
    ]    
}

PasteMode.prototype = Object.create(Mode.prototype)

PasteMode.prototype.draw = function () {
    image(this.copyBMap, this.selrectx * 16 + dfilePanel.x, this.selrecty * 16 + dfilePanel.y, this.copyBMap.width * 2, this.copyBMap.height * 2)
    rect(this.selrectx * 16 + dfilePanel.x, this.selrecty * 16 + dfilePanel.y, this.selrectw * 16, this.selrecth * 16)

    this.showHelp()
}

PasteMode.prototype.mousePressed = function () {
    if (!dfilePanel.mouseWithin()) { return; }

    mode.end()
    mode = new LMode()
}

PasteMode.prototype.keyPressed = function () {
    if (keyCode === UP_ARROW) {
        if (this.selrecty > 0) --this.selrecty;
    } else if (keyCode === DOWN_ARROW) {
        if (this.selrecty + this.selrecth < 24) ++this.selrecty;
    } else if (keyCode === LEFT_ARROW) {
        if (this.selrectx > 0) --this.selrectx;
    } else if (keyCode === RIGHT_ARROW) {
        if (this.selrectx + this.selrectw < 32) ++this.selrectx;
    }
}
