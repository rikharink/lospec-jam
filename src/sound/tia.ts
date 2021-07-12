/*   ADAPTED FROM https://github.com/6502ts/6502.ts/blob/master/src/machine/stella/tia/ToneGenerator.ts:
 *   Copyright (c) 2014 -- 2020 Christian Speckner and contributors
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy
 *   of this software and associated documentation files (the "Software"), to deal
 *   in the Software without restriction, including without limitation the rights
 *   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the Software is
 *   furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in all
 *   copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *   SOFTWARE.
 */
/*
 * The tone generator has been heavily influenced by the code found at
 * http://www.biglist.com/lists/stella/archives/200311/msg00156.html with following licence:
 *
 * sound.c
 * version 0.2
 *
 * Copyright (c) 2003 Adam Wozniak (adam@wozniakconsulting.com)
 * All Rights Reserved
 *
 * Permission granted to freely copy and use for any purpose, provided
 * this copyright header remains intact.
 */


import { BufferSource } from "tone";
import { Hertz } from "tone/build/esm/core/type/Units";

const poly0 = [1, -1];
const poly1 = [1, 1, -1];
const poly2 = [16, 15, -1];
const poly4 = [1, 2, 2, 1, 1, 1, 4, 3, -1];
const poly5 = [1, 2, 1, 1, 2, 2, 5, 4, 2, 1, 3, 1, 1, 1, 1, 4, -1];
const poly9 = [1, 4, 1, 3, 2, 4, 1, 2, 3, 2, 1, 1, 1, 1, 1, 1,
    2, 4, 2, 1, 4, 1, 1, 2, 2, 1, 3, 2, 1, 3, 1, 1,
    1, 4, 1, 1, 1, 1, 2, 1, 1, 2, 6, 1, 2, 2, 1, 2,
    1, 2, 1, 1, 2, 1, 6, 2, 1, 2, 2, 1, 1, 1, 1, 2,
    2, 2, 2, 7, 2, 3, 2, 2, 1, 1, 1, 3, 2, 1, 1, 2,
    1, 1, 7, 1, 1, 3, 1, 1, 2, 3, 3, 1, 1, 1, 2, 2,
    1, 1, 2, 2, 4, 3, 5, 1, 3, 1, 1, 5, 2, 1, 1, 1,
    2, 1, 2, 1, 3, 1, 2, 5, 1, 1, 2, 1, 1, 1, 5, 1,
    1, 1, 1, 1, 1, 1, 1, 6, 1, 1, 1, 2, 1, 1, 1, 1,
    4, 2, 1, 1, 3, 1, 3, 6, 3, 2, 3, 1, 1, 2, 1, 2,
    4, 1, 1, 1, 3, 1, 1, 1, 1, 3, 1, 2, 1, 4, 2, 2,
    3, 4, 1, 1, 4, 1, 2, 1, 2, 2, 2, 1, 1, 4, 3, 1,
    4, 4, 9, 5, 4, 1, 5, 3, 1, 1, 3, 2, 2, 2, 1, 5,
    1, 2, 1, 1, 1, 2, 3, 1, 2, 1, 1, 3, 4, 2, 5, 2,
    2, 1, 2, 3, 1, 1, 1, 1, 1, 2, 1, 3, 3, 3, 2, 1,
    2, 1, 1, 1, 1, 1, 3, 3, 1, 2, 2, 3, 1, 3, 1, 8,
    -1];
const poly68 = [5, 6, 4, 5, 10, 5, 3, 7, 4, 10, 6, 3, 6, 4, 9, 6, -1];
const poly465 = [2, 3, 2, 1, 4, 1, 6, 10, 2, 4, 2, 1, 1, 4, 5,
    9, 3, 3, 4, 1, 1, 1, 8, 5, 5, 5, 4, 1, 1, 1,
    8, 4, 2, 8, 3, 3, 1, 1, 7, 4, 2, 7, 5, 1, 3,
    1, 7, 4, 1, 4, 8, 2, 1, 3, 4, 7, 1, 3, 7, 3,
    2, 1, 6, 6, 2, 2, 4, 5, 3, 2, 6, 6, 1, 3, 3,
    2, 5, 3, 7, 3, 4, 3, 2, 2, 2, 5, 9, 3, 1, 5,
    3, 1, 2, 2, 11, 5, 1, 5, 3, 1, 1, 2, 12, 5, 1,
    2, 5, 2, 1, 1, 12, 6, 1, 2, 5, 1, 2, 1, 10, 6,
    3, 2, 2, 4, 1, 2, 6, 10, -1];
const divisors = [1, 1, 15, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1];

const polys = [poly0, poly4, poly4, poly465,
    poly1, poly1, poly2, poly5,
    poly9, poly5, poly2, poly0,
    poly1, poly1, poly2, poly68];


interface TiaOptions {
    tone: number;
    frequency: number;
    clockspeed: Hertz;
}

export const TIA_PAL_CLOCK: Hertz = 312 * 228 * 50;
export const TIA_NTSC_CLOCK: Hertz = 262 * 228 * 60;
const BUFFER_BUFFER = new Map<number, AudioBuffer>();

export class TiaOsc extends BufferSource {
    constructor({
        tone,
        frequency,
        clockspeed = TIA_PAL_CLOCK
    }: Partial<TiaOptions>) {
        let buffer = TiaOsc.getBuffer(tone, frequency, clockspeed);
        super(buffer);
        super.loop = true;
    }

    static getKey(tone: number, frequency: number): number {
        // Hack: this is at the boundary of hearing anyway and causes nasty artifacts during
        // resampling, so we kill it right away.
        if (polys[tone] === poly0 && divisors[tone] * (frequency + 1) === 1) {
            return 0;
        }
        return (tone << 5) | frequency;
    }

    static getBuffer(tone: number, frequency: number, clockspeed: number): AudioBuffer {
        const key = TiaOsc.getKey(tone, frequency);
        let buffered = BUFFER_BUFFER.get(key);
        if (buffered) {
            return buffered;
        }

        tone = (key >>> 5) & 0x0f;
        frequency = key & 0x1f;
        const poly = polys[tone];
        let length = 0;
        for (let i = 0; i < poly.length; i++) {
            length += poly[i];
        }
        length = length * divisors[tone] * (frequency + 1);
        const sampleRate = clockspeed / 114;
        const buffer = new AudioBuffer({ length, sampleRate });
        const content = buffer.getChannelData(0);
        let f = 0;
        let count = 0;
        let offset = 0;
        let state = true;
        for (let i = 0; i < length; i++) {
            f++;
            if (f === divisors[tone] * (frequency + 1)) {
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
            content[i] = state ? 1 : -1;
        }
        BUFFER_BUFFER.set(key, buffer);
        return buffer;
    }
}