function dfilezx81() {

    this.preload = function () {
        this.font = loadImage('data/zx81.png');
        this.bg = createGraphics(256, 192);
        this.dfilemem = new ArrayBuffer(32 * 24);
        this.dfile = new Uint8Array(this.dfilemem);
        this.dfile[100] = 12;
        this.dfile[80] = 22;
        this.dfile[300] = 135;
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

        target.copy(this.bg, 0,0,256,192,0,0,256,192);
    }
}
