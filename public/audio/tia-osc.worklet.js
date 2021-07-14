const poly0 = [1, -1];
const poly1 = [1, 1, -1];
const poly2 = [16, 15, -1];
const poly4 = [1, 2, 2, 1, 1, 1, 4, 3, -1];
const poly5 = [1, 2, 1, 1, 2, 2, 5, 4, 2, 1, 3, 1, 1, 1, 1, 4, -1];
const poly9 = [
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
const poly68 = [5, 6, 4, 5, 10, 5, 3, 7, 4, 10, 6, 3, 6, 4, 9, 6, -1];
const poly465 = [
  2, 3, 2, 1, 4, 1, 6, 10, 2, 4, 2, 1, 1, 4, 5, 9, 3, 3, 4, 1, 1, 1, 8, 5, 5, 5,
  4, 1, 1, 1, 8, 4, 2, 8, 3, 3, 1, 1, 7, 4, 2, 7, 5, 1, 3, 1, 7, 4, 1, 4, 8, 2,
  1, 3, 4, 7, 1, 3, 7, 3, 2, 1, 6, 6, 2, 2, 4, 5, 3, 2, 6, 6, 1, 3, 3, 2, 5, 3,
  7, 3, 4, 3, 2, 2, 2, 5, 9, 3, 1, 5, 3, 1, 2, 2, 11, 5, 1, 5, 3, 1, 1, 2, 12,
  5, 1, 2, 5, 2, 1, 1, 12, 6, 1, 2, 5, 1, 2, 1, 10, 6, 3, 2, 2, 4, 1, 2, 6, 10,
  -1,
];
const divisors = [1, 1, 15, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1];

const polys = [
  poly0,
  poly4,
  poly4,
  poly465,
  poly1,
  poly1,
  poly2,
  poly5,
  poly9,
  poly5,
  poly2,
  poly0,
  poly1,
  poly1,
  poly2,
  poly68,
];

const TIA_PAL_CLOCK = 312 * 228 * 50;
const TIA_NTSC_CLOCK = 262 * 228 * 60;
const VOLUME_INCREMENT = 0.0666666666667;
const TIA_SAMPLE_RATE = TIA_PAL_CLOCK / 114;

class TiaOsc extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'volume',
        defaultValue: 15,
        minValue: 0,
        maxValue: 15,
      },
      {
        name: 'frequency',
        defaultValue: 16,
        minValue: 1,
        maxValue: 32,
      },
      {
        name: 'distortion',
        defaultValue: 4,
        minValue: 0,
        maxValue: 15,
      },
    ];
  }

  constructor() {
    super();
  }

  getWave(distortion, frequency) {
    const poly = polys[distortion];
    let length = 0;
    for (let i = 0; i < poly.length; i++) {
      length += poly[i];
    }

    length = length * divisors[distortion] * (frequency + 1);
    let wave = new Float32Array(length);
    let f = 0;
    let count = 0;
    let offset = 0;
    let state = true;
    for (let i = 0; i < length; i++) {
      f++;
      if (f === divisors[distortion] * (frequency + 1)) {
        f = 0;
        count++;
        if (count === poly[offset]) {
          offset++;
          count = 0;

          if (poly.length === offset) {
            offset = 0;
          }
        }
        state = !(offset & 0x01);
      }
      wave[i] = state ? 1 : -1;
    }
    return wave;
  }

  fillBuffer(wave, length) {
    let buffer = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      buffer[i] = wave[i % wave.length];
    }
    return buffer;
  }

  upsample(source, destination, ratio, frames) {
    for(let i = 0; i < frames; i++){
      //todo LERP
    }
  }

  previousFrequency = -1;
  previousDistortion = -1;
  wave = [];
  waveIndex = 0;
  atariBuffer = [];

  process(_inputs, outputs, parameters) {
    let output = outputs[0][0];
    const nrSamples = output.length;
    for (let i = 0; i < nrSamples; i++) {
      let volume = parameters.volume[i] | parameters.volume[0];
      let frequency = parameters.frequency[i] | parameters.frequency[0];
      let distortion = parameters.distortion[i] | parameters.distortion[0];
      if (
        frequency !== this.previousFrequency ||
        distortion !== this.previousDistortion
      ) {
        this.wave = this.getWave(distortion, frequency);
        this.atariBuffer = this.fillBuffer(this.wave, nrSamples);
      }
      //TODO: resample????
      const d = sampleRate / TIA_SAMPLE_RATE;
      output[i] = this.wave[this.waveIndex] * volume * VOLUME_INCREMENT;
      this.waveIndex = (this.waveIndex + 1) % this.wave.length;
      this.previousFrequency = frequency;
      this.previousDistortion = distortion;
    }
    return true;
  }
}

registerProcessor('tia-osc', TiaOsc);
