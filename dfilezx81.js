function dfilezx81() {
    this.cx = 0
    this.cy = 0
    this.checks = true

    this.changed = false

    this.preload = function () {
        this.font = loadImage('data/zx81.png');
        this.bg = createGraphics(256, 192);
        this.dfilemem = new ArrayBuffer(32 * 24);
        this.dfile = new Uint8Array(this.dfilemem);
        this.dfile.fill(0);
    }

    this.buffer = function () {
        return this.dfile.slice(0)
    }

    this.cls = function () {
        this.regionalAction(0, 0, 32, 24, (n, c) => 0)
        this.cx = 0
        this.cy = 0
    }

    this.regionalAction = function (x, y, w, h, fn) {
        for (let n = 0, yy = y; yy < y + h; ++yy) {
            for (let xx = x; xx < x + w; ++xx) {
                let b = this.dfile[xx + yy * 32]
                let c = fn(n++, b)
                this.dfile[xx + yy * 32] = c
                this.changed |= b != c
            }
        }
    }

    this.getCharAt = function (x, y) {
        return this.dfile[x + 32 * y]
    }

    this.setCharAt = function (x, y, c) {
        this.changed |= this.dfile[x + 32 * y] != c
        this.dfile[x + 32 * y] = c
    }

    this.char = function (charcode) {
        glyph = createImage(8, 8);
        let fo = charcode > 127 ? 512 : 0;
        charcode &= 127;
        glyph.copy(this.font, 0, charcode * 8 + fo, 8, 8, 0, 0, 8, 8);
        return glyph;
    }

    this.threedmm = function () {
        if (this.exit == undefined) {
            this.exit = [];
            for (let i = 0; i < 22; ++i) {
                let c = random(128);
                if (c > 64) c += 64;
                this.exit.push((int)(c));
            }
        }
        else {
            let c = random(128);
            if (c > 64) c += 64;
            this.exit = this.exit.slice(1);
            this.exit.push((int)(c));
        }

        this.printat(3, 23, "DROP SCREEN DATA FILE HERE");
        this.square(5, 1, 22, 128);
        for (let s = 2; s < 22; s += 2) {
            this.square(16-(s/2), 12-(s/2), s, this.exit[(18-s)/2]);
        }
    }

    this.square = function(x, y, s, c) {
        this.regionalAction(x,y,  s,1,()=>c);
        this.regionalAction(x+s-1,y,1,s,()=>c);
        this.regionalAction(x,y+s-1,s,1,()=>c);
        this.regionalAction(x,y,  1,s,()=>c);
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
        if (this.cy > 23) {
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
        this.setCharAt(this.cx, this.cy, this.a2z(cc));
        this.cursorRight();
    }

    this.rst10_zeddy = function (cc) {
        this.setCharAt(this.cx, this.cy, cc);
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

        this.changed |= this.dfile[i] != c
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
        this.bg.fill(this.checks ? 230 : 255);
        this.bg.noStroke();
        this.bg.noSmooth();
        this.bg.background(this.checks ? 242 : 255);
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
            if (config['usenl']) {
                s += "$76,";
            }
            for (let x = 0; x < 32; ++x) {
                s += "$" + ("00" + this.dfile[n++].toString(16)).substr(-2)
                if (x != 31) {
                    s += ", "
                }
            }
            strings.push(s);
        }
        if (config['usenl']) {
            strings.push("\t.byte\t$76");
        }
        saveStrings(strings, "sketchy-screen" + (config.usenl ? "-nl" : ""))
    }

    this.load = function (input) {
        this.cls();
        let regex = /\$[0-9A-Fa-f]{2}/g;
        let result = input.match(regex);
        if (result != null && (result.length == 768 || result.length == 768 + 25)) {
            for (let n = 0, i = 0; i < result.length; ++i) {
                let v = parseInt(result[i].substring(1, 3), 16);
                if (v != 0x76) {
                    this.dfile[n++] = v;
                }
            }
            this.changed = true;
            return true;
        }
        return false;
    }

    this.importpng6448 = function (input) {
        this.cls();
        input.loadPixels();
        for (let p = 0, y = 0; y < 48; ++y) {
            for (let x = 0; x < 64; ++x) {
                let sr = input.pixels[p] == 0 ? 1 : 0;
                this.plot(x, y, sr);
                p+=4;
            }
        }
    }
}
