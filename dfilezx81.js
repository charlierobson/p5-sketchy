function dfilezx81() {

    this.cx = 0;
    this.cy = 0;

    this.preload = function () {
        this.font = loadImage('data/zx81.png');
        this.bg = createGraphics(256, 192);
        this.dfilemem = new ArrayBuffer(32 * 24);
        this.dfile = new Uint8Array(this.dfilemem);
        this.dfile.fill(0);
    }

    this.cls = function () {
        this.dfile.fill(0);
        this.cx = 0
        this.cy = 0
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
        let i = zeddycs.indexOf(cc.toUpperCase());
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

    this.rst10_zeddy = function (cc) {
        this.dfile[this.cx + 32 * this.cy] = cc;
        this.cursorRight();
    }

    this.plot = function (px, py, mode) {
        let b = (py & 1) == 0 ? 1 : 4;
        if ((px & 1) != 0) {
            b *= 2;
        }

        let i = (int)(px / 2) + (int)(py / 2) * 32;

        let c = this.dfile[i];
        if ((c & 127) > 8) {
            c = 0;
        }
        if (c > 127) {
            c ^= 0x8f;
        }

        if (mode == 0) {
            c = ~b & c;
        } else if (mode == 1) {
            c |= b;
        } else {
            c = c ^ b;
        }

        if (c > 7) {
            c ^= 0x8f;
        }

        this.dfile[i] = c;
    }

    this.pleek = function (px, py) {
        let b = (py & 1) == 0 ? 1 : 4;
        if ((px & 1) != 0) {
            b *= 2;
        }

        let i = (int)(px / 2) + (int)(py / 2) * 32;

        let c = this.dfile[i];
        if ((c & 127) > 8) {
            c = 0;
        }
        if (c > 127) {
            c ^= 0x8f;
        }

        return (c & b) != 0;
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
                if ((b & 0x40) == 0x40) {
                    b = 15;
                }
                if (b != 0) {
                    b &= 127;
                    this.bg.copy(this.font, 0, b * 8 + fo, 8, 8, x * 8, y * 8, 8, 8);
                } else if (cc) {
                    this.bg.rect(x * 8, y * 8, 8, 8);
                }
                cc = !cc;
            }
        }

        target.copy(this.bg, 0, 0, 256, 192, 0, 0, 256, 192);
    }

    this.printat = function (x, y, str) {
        this.cx = x & 31;
        this.cy = y % 24;
        this.print(str)
    }

    this.print = function (str) {
        for (let i = 0; i < str.length; ++i) {
            this.rst10_ascii(str.charAt(i))
        }
    }

    this.save = function (filename) {
        let strings = []
        for (let y = 0, n = 0; y < 24; ++y) {
            let s = "\t.byte\t"
            for (let x = 0; x < 32; ++x) {
                s += "$" + ("00" + this.dfile[n++].toString(16)).substr(-2)
                if (x != 31) {
                    s += ", "
                }
            }
            strings.push(s);
        }
        saveStrings(strings, "screen.asm")
    }

    this.load = function (input) {
        this.cls()
        let regex = /\$[0-9A-Fa-f]{2}/g
        let result = input.match(regex);
        if (result != null && result.length == 768) {
            for (let i = 0; i < 768; ++i) {
                this.dfile[i] = parseInt(result[i].substring(1,3), 16)
            }
        }
        else {
            this.printat(1, 1, "INVALID FILE")
        }
    }
}
