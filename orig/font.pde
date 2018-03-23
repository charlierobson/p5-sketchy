class Font
{
  PImage[] _glyphs;

  Font(String filename) {
    byte[] font = loadBytes(filename);

    color B = color(0);
    color W = color(255);

    _glyphs = new PImage[128];

    for (int bo = 0, i = 0; i < 64; ++i) {
      PImage glyph = new PImage(8, 8);
      PImage iglyph = new PImage(8, 8);
      glyph.loadPixels();
      iglyph.loadPixels();
      for (int n = 0, j = 0; j < 8; j ++) {
        byte b = font[bo++];
        glyph.pixels[n] = (b & 0x80) != 0 ? B : W;
        iglyph.pixels[n++] = (b & 0x80) != 0 ? W : B;
        glyph.pixels[n] = (b & 0x40) != 0 ? B : W;
        iglyph.pixels[n++] = (b & 0x40) != 0 ? W : B;
        glyph.pixels[n] = (b & 0x20) != 0 ? B : W;
        iglyph.pixels[n++] = (b & 0x20) != 0 ? W : B;
        glyph.pixels[n] = (b & 0x10) != 0 ? B : W;
        iglyph.pixels[n++] = (b & 0x10) != 0 ? W : B;
        glyph.pixels[n] = (b & 0x08) != 0 ? B : W;
        iglyph.pixels[n++] = (b & 0x08) != 0 ? W : B;
        glyph.pixels[n] = (b & 0x04) != 0 ? B : W;
        iglyph.pixels[n++] = (b & 0x04) != 0 ? W : B;
        glyph.pixels[n] = (b & 0x02) != 0 ? B : W;
        iglyph.pixels[n++] = (b & 0x02) != 0 ? W : B;
        glyph.pixels[n] = (b & 0x01) != 0 ? B : W;
        iglyph.pixels[n++] = (b & 0x01) != 0 ? W : B;
      }
      glyph.updatePixels();
      _glyphs[i] = glyph;

      iglyph.updatePixels();
      _glyphs[i+64] = iglyph;
    }
  }

  PImage character(int c) {
    int clo = c & 127;
    if (clo >= 64 && clo < 128) {
      return _glyphs[15]; // '?'
    }

    if (c > 127) {
      c-= 64;
    }
    return _glyphs[c];
  }
}