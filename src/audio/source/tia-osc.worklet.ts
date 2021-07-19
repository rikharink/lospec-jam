// ADAPTED FROM https://www.biglist.com/lists/stella/archives/200311/msg00156.html
// // sound.c
// version 0.2
//
// Copyright (c) 2003 Adam Wozniak (adam@xxxxxxxxxxxxxxxx)
// All Rights Reserved
//
// Permission granted to freely copy and use for any purpose, provided
// this copyright header remains intact.

export const workletName = 'tia-osc';
import { registerProcessor } from "tone/build/esm/core/worklet/WorkletGlobalScope";

const tiaOsc = `
class TiaOsc extends AudioWorkletProcessor {
  poly0 = [1, -1];
  poly1 = [1, 1, -1];
  poly2 = [16, 15, -1];
  poly4 = [1, 2, 2, 1, 1, 1, 4, 3, -1];
  poly5 = [1, 2, 1, 1, 2, 2, 5, 4, 2, 1, 3, 1, 1, 1, 1, 4, -1];
  poly9 = [
    1, 4, 1, 3, 2, 4, 1, 2, 3, 2, 1, 1, 1, 1, 1, 1, 2, 4, 2, 1, 4, 1, 1, 2, 2, 1,
    3, 2, 1, 3, 1, 1, 1, 4, 1, 1, 1, 1, 2, 1, 1, 2, 6, 1, 2, 2, 1, 2, 1, 2, 1, 1,
    2, 1, 6, 2, 1, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 7, 2, 3, 2, 2, 1, 1, 1, 3, 2, 1,
    1, 2, 1, 1, 7, 1, 1, 3, 1, 1, 2, 3, 3, 1, 1, 1, 2, 2, 1, 1, 2, 2, 4, 3, 5, 1,
    3, 1, 1, 5, 2, 1, 1, 1, 2, 1, 2, 1, 3, 1, 2, 5, 1, 1, 2, 1, 1, 1, 5, 1, 1, 1,
    1, 1, 1, 1, 1, 6, 1, 1, 1, 2, 1, 1, 1, 1, 4, 2, 1, 1, 3, 1, 3, 6, 3, 2, 3, 1,
    1, 2, 1, 2, 4, 1, 1, 1, 3, 1, 1, 1, 1, 3, 1, 2, 1, 4, 2, 2, 3, 4, 1, 1, 4, 1,
    2, 1, 2, 2, 2, 1, 1, 4, 3, 1, 4, 4, 9, 5, 4, 1, 5, 3, 1, 1, 3, 2, 2, 2, 1, 5,
    1, 2, 1, 1, 1, 2, 3, 1, 2, 1, 1, 3, 4, 2, 5, 2, 2, 1, 2, 3, 1, 1, 1, 1, 1, 2,
    1, 3, 3, 3, 2, 1, 2, 1, 1, 1, 1, 1, 3, 3, 1, 2, 2, 3, 1, 3, 1, 8, -1,
  ];
  poly68 = [5, 6, 4, 5, 10, 5, 3, 7, 4, 10, 6, 3, 6, 4, 9, 6, -1];
  poly465 = [
    2, 3, 2, 1, 4, 1, 6, 10, 2, 4, 2, 1, 1, 4, 5, 9, 3, 3, 4, 1, 1, 1, 8, 5, 5, 5,
    4, 1, 1, 1, 8, 4, 2, 8, 3, 3, 1, 1, 7, 4, 2, 7, 5, 1, 3, 1, 7, 4, 1, 4, 8, 2,
    1, 3, 4, 7, 1, 3, 7, 3, 2, 1, 6, 6, 2, 2, 4, 5, 3, 2, 6, 6, 1, 3, 3, 2, 5, 3,
    7, 3, 4, 3, 2, 2, 2, 5, 9, 3, 1, 5, 3, 1, 2, 2, 11, 5, 1, 5, 3, 1, 1, 2, 12,
    5, 1, 2, 5, 2, 1, 1, 12, 6, 1, 2, 5, 1, 2, 1, 10, 6, 3, 2, 2, 4, 1, 2, 6, 10,
    -1,
  ];
  divisors = [1, 1, 15, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1];

  polys = [
    this.poly0,
    this.poly4,
    this.poly4,
    this.poly465,
    this.poly1,
    this.poly1,
    this.poly2,
    this.poly5,
    this.poly9,
    this.poly5,
    this.poly2,
    this.poly0,
    this.poly1,
    this.poly1,
    this.poly2,
    this.poly68,
  ];

  static get parameterDescriptors() {
    return [
      {
        name: 'f',
        defaultValue: 0,
        minValue: 0,
        maxValue: 31,
      },
      {
        name: 'v',
        defaultValue: 0,
        minValue: 0,
        maxValue: 15,
      },
      {
        name: 'c',
        defaultValue: 0,
        minValue: 0,
        maxValue: 15,
      },
      //IDEAL PAL: 31200
      //IDEAL NTSC: 31440
      //Adam Wozniak Measured NTSC 31456
      {
        name: 'tiasamplerate',
        defaultValue: 31456,
        automationRate: 'k-rate',
      },
    ];
  }

  constructor() {
    super();
  }

  previousF = -1;
  previousV = -1;
  previousC = -1;

  state = {
    offset: 0,
    count: 0,
    last: 1,
    f: 0,
    rate: 0,
  };

  resetState() {
    this.state = {
      offset: 0,
      count: 0,
      last: 1,
      f: 0,
      rate: 0,
    };
  }

  process(_inputs, outputs, parameters) {
    let output = outputs[0][0];
    let size = output.length;
    let tiasamplerate = parameters.tiasamplerate[0];
    let buf = 0;
    let i = 0;

    while (size) {
      let f = parameters.f[i] | parameters.f[0];
      let v = parameters.v[i] | parameters.v[0];
      let c = parameters.c[i] | parameters.c[0];

      if (
        f !== this.previousF ||
        c !== this.previousC ||
        v !== this.previousV
      ) {
        this.resetState();
      }

      this.state.f++;
      if (this.state.f === this.divisors[c] * (f + 1)) {
        let poly = this.polys[c];
        this.state.f = 0;
        this.state.count++;
        if (this.state.count === poly[this.state.offset]) {
          this.state.offset++;
          this.state.count = 0;
          if (poly[this.state.offset] === -1) {
            this.state.offset = 0;
          }
          this.state.last = !(this.state.offset & 0x01);
        }
      }

      this.state.rate += sampleRate;

      // RESAMPLE
      while (this.state.rate >= tiasamplerate && size) {
        output[buf] += this.state.last ? v << 3 : 0;
        this.state.rate -= tiasamplerate;
        buf += 1;
        size -= 1;
      }

      this.previousF = f;
      this.previousV = v;
      this.previousC = c;
      i++;
    }
    return true;
  }
}`;

registerProcessor(workletName, tiaOsc);