interface IPalette {
  [color: number]: number;
  foreground: number;
  background: number;
  text: number;
  accent: number;
}

class LtroOne implements IPalette {
  [color: number]: number;
  constructor() {
    [
      0xeae1f0, 0x7e7185, 0x37313b, 0x1d1c1f, 0x89423f, 0xf63f4c, 0xfdbb27,
      0x8d902e, 0x4159cb, 0x59a7af,
    ].forEach((c, i) => {
      this[i] = c;
    });
  }

  public get foreground(): number {
    return this[8];
  }

  public get background(): number {
    return this[2];
  }

  public get text(): number {
    return this[0];
  }

  public get accent(): number {
    return this[9];
  }
}

export const Palette = new LtroOne();
