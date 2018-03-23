class dfilezx81
{
  int[] _dfile;
  Font _font;
  PGraphics _bg;
  int _cursorx, _cursory;

  public static final int RESET = 0;
  public static final int SET = 1;
  public static final int XOR = 2;

  DFileZX81() {
    _bg = createGraphics(256, 192);
    _font = new Font("data/zx81.fnt");
    cls();
  }

  PImage charimg(int n) {
    return _font.character(n);
  }

  void setcurpos(int x, int y) {
    _cursorx = x;
    _cursory = y;
  }

  int cursorx() {
    return _cursorx;
  }

  int cursory() {
    return _cursory;
  }

  void cls() {
    _dfile = new int[32*24];
    _cursorx = 0;
    _cursory = 0;
  }

  void fill(char c) {
    fill(0, 0, 32, 24, c);
  }

  void fill(int x, int y, int w, int h, char c) {
    for (int yy = y; yy < y + h; ++yy) {
      for (int xx = x; xx < x + w; ++xx) {
        _dfile[xx + (yy * 32)] = c;
      }
    }
  }

  void cursorup() {
    --_cursory;
    if (_cursory == -1) {
      _cursory = 23;
    }
  }

  void cursordown() {
    ++_cursory;
    if (_cursory == 24) {
      _cursory = 0;
    }
  }

  void cursorleft() {
    --_cursorx;
    if (_cursorx == -1) {
      _cursorx = 31;
      --_cursory;
      if (_cursory < 0) {
        _cursory = 23;
      }
    }
  }

  void cursorright() {
    _cursorx++;
    if (_cursorx == 32) {
      _cursorx = 0;
      _cursory ++;
      if (_cursory == 24) {
        _cursory = 0;
      }
    }
  }

  void putc(char c) {
    _dfile[_cursorx + 32 * _cursory] = Charxlate.a2z(c);
    cursorright();
  }

  void putz(int c) {
    _dfile[_cursorx + 32 * _cursory] = c;
    cursorright();
  }

  void setz(int x, int y, char c) {
    _dfile[x + 32 * y] = c;
  }

  int getc(int x, int y) {
    return _dfile[x + 32 * y];
  }

  void setc(int x, int y, char c) {
    _dfile[x + 32 * y] = Charxlate.a2z(c);
  }

  void plot(int x, int y, int mode) {
    int b = (y & 1) == 0 ? 1 : 4;
    if ((x & 1) != 0) {
      b *= 2;
    }

    int c = _dfile[x / 2 + (y / 2) * 32];
    if ((c & 127) > 8) {
      c = 0;
    }
    if (c > 127) {
      c ^= 0x8f;
    }

    if (mode == 0) {
      c = (~b) & c;
    } else if (mode == 1) {
      c |= b;
    } else {
      c = c ^ b;
    }
    if (c > 7) {
      c ^= 0x8f;
    }
    _dfile[x / 2 + (y / 2) * 32] = c;
  }

  boolean pleek(int x, int y) {
    int b = (y & 1) == 0 ? 1 : 4;
    if ((x & 1) != 0) {
      b *= 2;
    }

    int c = _dfile[x / 2 + (y / 2) * 32];
    if ((c & 127) > 8) {
      c = 0;
    }
    if (c > 127) {
      c ^= 0x8f;
    }

    return (c & b) != 0;
  }

  PImage render() {
    _bg.beginDraw();
    _bg.background(240);
    _bg.fill(225);
    _bg.noStroke();
    for (int y = 0; y < 24; ++y) {
      boolean b = (y & 1) != 0;
      for (int x = 0; x < 32; ++x) {
        if (_dfile[x + (32 * y)] != 0) {
          _bg.image(_font.character(_dfile[x + (32 * y)]), x * 8, y * 8);
        } else if (b) {
          _bg.rect(x * 8, y * 8, 8, 8);
        }
        b = !b;
      }
    }
    _bg.endDraw();

    return _bg;
  }

  void save(String filename) {
    int idx = 0;
    byte[] dfb = new byte[32*24];
    for (int i : _dfile) {
      dfb[idx++] = (byte)(i & 0xff);
    }
    saveBytes(filename, dfb);
  }

  void load(String filename) {
    byte[] dfb = loadBytes(filename);
    int idx = 0;
    for (byte b : dfb) {
      _dfile[idx++] = b & 0xff;
    }
  }
}