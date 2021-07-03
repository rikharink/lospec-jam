interface IPalette {
  [color: number]: number;
  foreground: number;
  background: number;
  text: number;
  accent: number;
}

class DecTen implements IPalette {
  [color: number]: number;
  constructor() {
    [
      0xfffdce, 0xffcd6b, 0x78da22, 0x17854e, 0xe66649, 0x8349a6, 0x38153b,
      0xa6ced2, 0x4796cf, 0x204075,
    ].forEach((c, i) => {
      this[i] = c;
    });
  }

  public get foreground(): number {
    return this[5];
  }

  public get background(): number {
    return this[9];
  }

  public get text(): number {
    return this[0];
  }

  public get accent(): number {
    return this[6];
  }
}

export const Palette = new DecTen();
