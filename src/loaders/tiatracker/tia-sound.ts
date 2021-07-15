import { ILoaderResource, Loader } from 'pixi.js';
import { Context, Gain, Transport } from 'tone';
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
    this._stepLoopId = Transport.scheduleRepeat(this.step.bind(this), this.secondsPerFrame);
    console.debug(this.secondsPerFrame);
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

  //TODO: look-ahead scheduling of notes
  //TODO: seems to not be in time?
  lastTime = 0;
  private step() {
    let time = this.currentTime;
    // console.debug('TIME DELTA: ', time - this.lastTime, this.lastTime, time, this._frame, this._row);
    this.lastTime = time;
    //START OF ROW
    if (this._frame === 0) {
      let noteA = this.currentPatternA.notes[this._row];
      let noteB = this.currentPatternB.notes[this._row];
      this.scheduleNote(noteA, TiaSoundChannel.A);
      this.scheduleNote(noteB, TiaSoundChannel.B);
    }
    this._frame++;

    if (this._frame >= this.currentSpeed) {
      this._frame = 0;
      this._row++;
      if (this._row >= this.currentPatternA.notes.length) {
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
    }
    return;
  }

  private get currentTime() {
    return this._out.context.currentTime;
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

  private getOscForChannel(channel: TiaSoundChannel): TiaOsc {
    return channel === TiaSoundChannel.A ? this._oscA : this._oscB;
  }

  private scheduleHold(channel: TiaSoundChannel) {
    let currentInstrument = channel == TiaSoundChannel.A ? this._instrumentA : this._instrumentB;
    if (!currentInstrument) return;
  }

  private schedulePause(channel: TiaSoundChannel) {
    let osc = this.getOscForChannel(channel);
    let instrument = this.getInstrumentForChannel(channel);
    if (!instrument) {
      osc.v.setValueAtTime(0, this.currentTime);
    } else {
      //TODO: Release
    }
    channel === TiaSoundChannel.A
      ? this._instrumentA = null
      : this._instrumentB = null;
  }

  private scheduleSlide(slideAmount: number, channel: TiaSoundChannel) {
    let osc = this.getOscForChannel(channel);
    osc.f.setValueAtTime(osc.f.getValueAtTime(this.currentTime) + slideAmount, this.currentTime);
  }

  private scheduleMelodic(instrument: IMelodicInstrument, frequency: number, channel: TiaSoundChannel) {
    channel === TiaSoundChannel.A
      ? this._instrumentA = instrument
      : this._instrumentB = instrument;
  }

  //TODO: Overlay percussion
  private schedulePercussion(instrument: IPercussionInstrument, channel: TiaSoundChannel) {
    channel === TiaSoundChannel.A
      ? this._instrumentA = null
      : this._instrumentB = null;
    let osc = this.getOscForChannel(channel);
    let startTime = this.currentTime;
    for (let i = 0; i < instrument.envelopeLength; i++) {
      let f = instrument.frequencies[i];
      let c = instrument.waveforms[i];
      let v = instrument.volumes[i];
      let time = startTime + i * this.secondsPerFrame;
      osc.f.setValueAtTime(f, time);
      osc.c.setValueAtTime(c, time);
      osc.v.setValueAtTime(v, time);
    }
    osc.v.setValueAtTime(0, startTime + instrument.envelopeLength * this.secondsPerFrame);
  }

  private scheduleNote(note: INote, channel: TiaSoundChannel) {
    const instrument = this.getInstrument(note);
    switch (note.type) {
      case NoteType.Hold:
        return this.scheduleHold(channel);
      case NoteType.Pause:
        return this.schedulePause(channel);
      case NoteType.Slide:
        return this.scheduleSlide(note.value, channel);
      case NoteType.Melodic:
        return this.scheduleMelodic(<IMelodicInstrument>instrument, note.value, channel);
      case NoteType.Percussion:
        return this.schedulePercussion(<IPercussionInstrument>instrument, channel);
    }
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
    return this._song.patterns[this.currentSequenceA.patternindex];
  }

  private get currentPatternB(): IPattern {
    return this._song.patterns[this.currentSequenceB.patternindex];
  }
}
