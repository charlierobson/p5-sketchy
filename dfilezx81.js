function dfilezx81() {

    this.cx = 0;
    this.cy = 0;

    this.preload = function () {
        this.font = loadImage('data/zx81.png');
        this.bg = createGraphics(256, 192);
        this.dfilemem = new ArrayBuffer(32 * 24);
        this.dfile = new Uint8Array(this.dfilemem);
    }

    this.char = function (charcode) {
        glyph = createImage(8, 8);
        let fo = charcode > 127 ? 512 : 0;
        charcode &= 127;
        glyph.copy(this.font, 0, charcode * 8 + fo, 8, 8, 0, 0, 8, 8);
        return glyph;
    }

    this.a2z = function (cc) {
        let zeddycs = " ??????????\"£$:?()><=+-*/;,.0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let i = zeddycs.indexOf(cc);
        if (i == -1) {
            i = 15;
        }
        return i;
    }

    this.cursorRight = function () {
        this.cx += 1;
        if (this.cx > 31) {
            this.cx = 0;
            this.cursorDown();
        }
    }

    this.cursorLeft = function () {
        this.cx -= 1;
        if (this.cx < 0) {
            this.cx = 31;
            this.cursorUp();
        }
    }

    this.cursorDown = function () {
        this.cy += 1;
        if (this.cy > 24) {
            this.cy = 0;
        }
    }

    this.cursorUp = function () {
        this.cy -= 1;
        if (this.cy < 0) {
            this.cy = 23;
        }
    }

    this.rst10_ascii = function (cc) {
        this.dfile[this.cx + 32 * this.cy] = this.a2z(cc);
        this.cursorRight();
    }

    this.render = function (target) {
        this.bg.fill(220);
        this.bg.noStroke();
        this.bg.noSmooth();
        this.bg.background(240);
        for (let y = 0; y < 24; ++y) {
            let cc = (y & 1) == 0;
            for (let x = 0; x < 32; ++x) {
                let b = this.dfile[x + 32 * y];
                let fo = b > 127 ? 512 : 0;
                b &= 127;
                if ((b & 0x40) == 0x40) {
                    b = 15;
                }
                if (b != 0) {
                    this.bg.copy(this.font, 0, b * 8 + fo, 8, 8, x * 8, y * 8, 8, 8);
                } else if (cc) {
                    this.bg.rect(x * 8, y * 8, 8, 8);
                }
                cc = !cc;
            }
        }

        target.copy(this.bg, 0, 0, 256, 192, 0, 0, 256, 192);
    }
}
