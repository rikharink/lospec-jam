import { ILoaderResource, Loader } from 'pixi.js';
import { Gain, Transport } from 'tone';
import { Seconds } from 'tone/build/esm/core/type/Units';
import { Track } from '../../sound/track';
import { TiaOsc } from './tia-osc';
import {
  ISong,
  IMelodicInstrument,
  IPercussionInstrument,
  IPattern,
  ISequence,
  INote,
  NoteType,
} from './tia-tracker-types';

enum TiaSoundChannel {
  A = 0,
  B = 1,
}

const READ_AHEAD_SIZE: Seconds = 1;

//TODO: frequency envelope is modefier on base frequency instead of pure value
//TODO: combined pure instrument support
//TODO: What if envelope is longer than current frames per row
//TODO: different sized pattern a & b && next pattern support
//TODO: overlay percussion
export class TiaSound implements Track {
  private _song: ISong;
  private _isRunning: boolean = false;
  private _stepLoopId?: number;
  private _sequenceA = 0;
  private _sequenceB = 0;
  private _row = 0;
  private _frame = 0;

  private _out: Gain = new Gain();
  private _oscA = new TiaOsc({ f: 0, v: 0, c: 0 });
  private _oscB = new TiaOsc({ f: 0, v: 0, c: 0 });

  private _instrumentA?: IMelodicInstrument;
  private _instrumentB?: IMelodicInstrument;

  private _frequencyA?: number;
  private _frequencyB?: number;

  public static middleware(resource: ILoaderResource, next: Function) {
    if (resource.extension !== 'ttt') return next();
    const song: ISong = JSON.parse(resource.xhr.responseText);
    resource.data = song;
    return next();
  }

  public constructor() {
    this._oscA.connect(this._out);
    this._oscB.connect(this._out);
    this._out.toDestination();
  }

  public get output() {
    return this._out;
  }

  public get id(): string {
    return this._song.metaName;
  }

  public get framerate(): number {
    return this._song.tvmode === 'ntsc' ? 60 : 50;
  }

  public get secondsPerFrame(): Seconds {
    return 1 / this.framerate;
  }

  public loadSong(resourceId: string | number) {
    let resource = Loader.shared.resources[resourceId];
    this._song = resource.data;
    if (this._stepLoopId) {
      Transport.clear(this._stepLoopId);
    }
    this._stepLoopId = Transport.scheduleRepeat(this.schedule.bind(this), READ_AHEAD_SIZE);
  }

  public play(): void {
    if (this._isRunning) return;
    if (Transport.state !== "started") {
      Transport.start();
    }
    this._isRunning = true;
  }

  public stop(): void {
    this._isRunning = false;
    Transport.clear(this._stepLoopId);
    this._stepLoopId = undefined;
  }

  private schedule() {
    let time = this.currentTime;
    for (let i = 0; i < this.framerate * READ_AHEAD_SIZE; i++) {
      this.step(time + i * this.secondsPerFrame);
    }
  }

  private step(startTime: number) {
    if (this.currentPatternA === undefined || this.currentPatternB === undefined) return;
    if (this._frame === 0) {
      let noteA = this.currentPatternA.notes[this._row];
      let noteB = this.currentPatternB.notes[this._row];
      this.scheduleNote(noteA, TiaSoundChannel.A, startTime);
      this.scheduleNote(noteB, TiaSoundChannel.B, startTime);
    }
    this.nextFrame();
    return;
  }

  private nextFrame() {
    this._frame++;
    if (this._frame >= this.currentSpeed) {
      this._frame = 0;
      this._row++;
      if (this._row >= this.currentPatternA.notes.length) {
        this.nextPattern();
      }
    }
  }

  private nextPattern() {
    this._sequenceA = this.currentSequenceA.gototarget !== -1
      ? this.currentSequenceA.gototarget
      : this._sequenceA + 1;
    this._sequenceB = this.currentSequenceB.gototarget !== -1
      ? this.currentSequenceB.gototarget
      : this._sequenceB + 1;
    if (this._sequenceA >= this._song.channels[0].sequence.length || this._sequenceB >= this._song.channels[1].sequence.length) {
      this.stop();
    }
    this._row = 0;
  }

  private get currentTime() {
    return this._out.context.currentTime;
  }

  private scheduleNote(note: INote, channel: TiaSoundChannel, time: number) {
    const instrument = this.getInstrument(note);
    switch (note.type) {
      case NoteType.Hold:
        return this.scheduleHold(channel, time);
      case NoteType.Pause:
        return this.schedulePause(channel, time);
      case NoteType.Slide:
        return this.scheduleSlide(note.value, channel, time);
      case NoteType.Melodic:
        return this.scheduleMelodic(<IMelodicInstrument>instrument, note.value, channel, time);
      case NoteType.Percussion:
        return this.schedulePercussion(<IPercussionInstrument>instrument, channel, time);
    }
  }

  private scheduleHold(channel: TiaSoundChannel, time: number) {
    let instrument = this.getInstrumentForChannel(channel);
    if (instrument === undefined) return;
    this.playSustain(this.getFrequencyForChannel(channel), instrument, channel, time);
  }

  private schedulePause(channel: TiaSoundChannel, time: number) {
    let frequency = this.getFrequencyForChannel(channel);
    this.setFrequencyForChannel(undefined, channel);
    let osc = this.getOscForChannel(channel);
    let instrument = this.getInstrumentForChannel(channel);
    if (!instrument) {
      osc.v.setValueAtTime(0, time);
    } else {
      let releaseFrequencies = instrument.frequencies.slice(instrument.releaseStart, instrument.frequencies.length).map(f => frequency + f);
      let releaseVolumes = instrument.volumes.slice(instrument.releaseStart, instrument.frequencies.length);
      for (let i = instrument.releaseStart; i < instrument.envelopeLength; i++) {
        let f = releaseFrequencies[i];
        let c = instrument.waveform;
        let v = releaseVolumes[i];
        let t = time + i + this.secondsPerFrame;
        osc.f.setValueAtTime(f, t);
        osc.c.setValueAtTime(c, t);
        osc.v.setValueAtTime(v, t);
      }
    }
    this.setInstrumentForChannel(undefined, channel);
  }

  private scheduleSlide(slideAmount: number, channel: TiaSoundChannel, time: number) {
    let frequency = this.getFrequencyForChannel(channel);
    if (frequency === undefined) return;

    let osc = this.getOscForChannel(channel);
    let newFrequency = frequency + slideAmount;
    osc.f.setValueAtTime(newFrequency, time);
    this.setFrequencyForChannel(newFrequency, channel);
  }

  private scheduleMelodic(instrument: IMelodicInstrument, frequency: number, channel: TiaSoundChannel, time: number) {
    this.setInstrumentForChannel(instrument, channel);
    this.setFrequencyForChannel(frequency, channel);
    let osc = this.getOscForChannel(channel);

    //ATTACK/DECAY
    let attackDecayFrequencies = instrument.frequencies.slice(0, instrument.sustainStart).map(f => frequency + f);
    let attackDecayVolumes = instrument.volumes.slice(0, instrument.sustainStart);
    for (let i = 0; i < instrument.sustainStart; i++) {
      let f = attackDecayFrequencies[i];
      let c = instrument.waveform;
      let v = attackDecayVolumes[i];
      let t = time + i + this.secondsPerFrame;
      osc.f.setValueAtTime(f, t);
      osc.c.setValueAtTime(c, t);
      osc.v.setValueAtTime(v, t);
    }

    //SUSTAIN
    this.playSustain(frequency, instrument, channel, time);
  }

  private playSustain(frequency: number, instrument: IMelodicInstrument, channel: TiaSoundChannel, time: number) {
    let osc = this.getOscForChannel(channel);
    let sustainFrequencies = instrument.frequencies.slice(instrument.sustainStart, instrument.releaseStart).map(f => frequency + f);
    let sustainVolumes = instrument.volumes.slice(instrument.sustainStart, instrument.releaseStart);
    for (let i = instrument.sustainStart; i < instrument.releaseStart; i++) {
      let f = sustainFrequencies[i];
      let c = instrument.waveform;
      let v = sustainVolumes[i];
      let t = time + i + this.secondsPerFrame;
      console.debug(f, c, v, t);
      osc.f.setValueAtTime(f, t);
      osc.c.setValueAtTime(c, t);
      osc.v.setValueAtTime(v, t);
    }
  }

  private schedulePercussion(instrument: IPercussionInstrument, channel: TiaSoundChannel, time: number) {
    this.setFrequencyForChannel(undefined, channel);
    this.setInstrumentForChannel(undefined, channel);
    let osc = this.getOscForChannel(channel);
    for (let i = 0; i < instrument.envelopeLength; i++) {
      let f = instrument.frequencies[i];
      let c = instrument.waveforms[i];
      let v = instrument.volumes[i];
      let t = time + i * this.secondsPerFrame;
      osc.f.setValueAtTime(f, t);
      osc.c.setValueAtTime(c, t);
      osc.v.setValueAtTime(v, t);
    }
    osc.v.setValueAtTime(0, time + instrument.envelopeLength * this.secondsPerFrame);
  }

  private getInstrument(note: INote): IMelodicInstrument | IPercussionInstrument | null {
    switch (note.type) {
      case NoteType.Melodic:
        return this._song.instruments[note.number];
      case NoteType.Percussion:
        return this._song.percussion[note.number];
      default:
        return null;
    }
  }

  private getInstrumentForChannel(channel: TiaSoundChannel) {
    return channel === TiaSoundChannel.A ?
      this._instrumentA :
      this._instrumentB;
  }

  private setInstrumentForChannel(instrument: IMelodicInstrument, channel: TiaSoundChannel) {
    channel === TiaSoundChannel.A
      ? this._instrumentA = instrument
      : this._instrumentB = instrument;
  }

  private getFrequencyForChannel(channel: TiaSoundChannel): number | undefined {
    return channel === TiaSoundChannel.B ?
      this._frequencyA :
      this._frequencyB;
  }

  private setFrequencyForChannel(frequency: number | undefined, channel: TiaSoundChannel) {
    if (channel === TiaSoundChannel.A) {
      this._frequencyA = frequency;
    } else {
      this._frequencyB = frequency;
    }
  }

  private getOscForChannel(channel: TiaSoundChannel): TiaOsc {
    return channel === TiaSoundChannel.A ? this._oscA : this._oscB;
  }

  private get currentSpeed(): number {
    let isEven = this._row % 2 === 0;
    if (this._song.globalspeed === undefined || this._song.globalspeed === true) {
      return isEven ? this._song.evenspeed : this._song.oddspeed;
    } else {
      let pattern = this.currentPatternA;
      return isEven
        ? (pattern.evenspeed ?? this._song.evenspeed)
        : (pattern.oddspeed ?? this._song.oddspeed);
    }
  }

  private get currentSequenceA(): ISequence {
    return this._song.channels[0].sequence[this._sequenceA];
  }

  private get currentSequenceB(): ISequence {
    return this._song.channels[1].sequence[this._sequenceB];
  }

  private get currentPatternA(): IPattern {
    return this._song.patterns[this.currentSequenceA?.patternindex];
  }

  private get currentPatternB(): IPattern {
    return this._song.patterns[this.currentSequenceB?.patternindex];
  }
}
