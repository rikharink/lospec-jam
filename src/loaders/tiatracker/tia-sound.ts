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
  WaveformType,
} from './tia-tracker-types';

enum TiaSoundChannel {
  A = 0,
  B = 1,
}

const READ_AHEAD_SIZE: Seconds = 1;

interface ChannelState {
  channel: TiaSoundChannel;
  oscillator: TiaOsc;
  currentInstrument?: IMelodicInstrument;
  currentFrequency?: number;
  currentSequence: number;
  currentEnvelopeFrame: number;
}

//TODO: Melodic instrument envelopes sound all off... probably timing issues :-(
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

  private _channelA: ChannelState = {
    channel: TiaSoundChannel.A,
    oscillator: new TiaOsc({ f: 0, v: 0, c: 0 }),
    currentInstrument: undefined,
    currentFrequency: undefined,
    currentSequence: 0,
    currentEnvelopeFrame: 0,
  };

  private _channelB: ChannelState = {
    channel: TiaSoundChannel.B,
    oscillator: new TiaOsc({ f: 0, v: 0, c: 0 }),
    currentInstrument: undefined,
    currentFrequency: undefined,
    currentSequence: 0,
    currentEnvelopeFrame: 0,
  };

  public static middleware(resource: ILoaderResource, next: Function) {
    if (resource.extension !== 'ttt') return next();
    const song: ISong = JSON.parse(resource.xhr.responseText);
    resource.data = song;
    return next();
  }

  public constructor() {
    this._channelA.oscillator.connect(this._out);
    this._channelB.oscillator.connect(this._out);
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
    this._stepLoopId = Transport.scheduleRepeat(
      this.schedule.bind(this),
      READ_AHEAD_SIZE,
    );
  }

  public play(): void {
    if (this._isRunning) return;
    if (Transport.state !== 'started') {
      Transport.start();
    }
    this._isRunning = true;
  }

  public stop(time?: number): void {
    this._isRunning = false;
    console.debug(
      `STOP AT ${time ?? this.currentTime} currently ${this.currentTime}`,
    );
    this._channelA.oscillator.v.setValueAtTime(0, time ?? this.currentTime);
    this._channelB.oscillator.v.setValueAtTime(0, time ?? this.currentTime);
    Transport.clear(this._stepLoopId);
    this._stepLoopId = undefined;
  }

  private schedule() {
    let time = this.currentTime;
    for (let i = 0; i < this.framerate * READ_AHEAD_SIZE; i++) {
      this.step(time + i * this.secondsPerFrame);
    }
  }

  private step(time: number) {
    if (
      this.currentPatternA === undefined ||
      this.currentPatternB === undefined
    )
      return;

    if (this._frame === 0) {
      let noteA = this.currentPatternA.notes[this._row];
      let noteB = this.currentPatternB.notes[this._row];
      this.scheduleNote(noteA, TiaSoundChannel.A, time);
      this.scheduleNote(noteB, TiaSoundChannel.B, time);
    }
    this.nextFrame(time);
    return;
  }

  private nextFrame(time: number) {
    this._frame++;
    if (this._frame >= this.currentSpeed) {
      this._frame = 0;
      this._row++;
      if (this._row >= this.currentPatternA.notes.length) {
        this.nextPattern(time);
      }
    }
  }

  private nextPattern(time: number) {
    this._sequenceA =
      this.currentSequenceA.gototarget !== -1
        ? this.currentSequenceA.gototarget
        : this._sequenceA + 1;
    this._sequenceB =
      this.currentSequenceB.gototarget !== -1
        ? this.currentSequenceB.gototarget
        : this._sequenceB + 1;
    if (
      this._sequenceA >= this._song.channels[0].sequence.length ||
      this._sequenceB >= this._song.channels[1].sequence.length
    ) {
      this.stop(time);
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
        return this.scheduleMelodic(
          <IMelodicInstrument>instrument,
          note.value,
          channel,
          time,
        );
      case NoteType.Percussion:
        return this.schedulePercussion(
          <IPercussionInstrument>instrument,
          channel,
          time,
        );
    }
  }

  private scheduleHold(channel: TiaSoundChannel, time: number) {
    let instrument = this.getInstrumentForChannel(channel);
    let frequency = this.getFrequencyForChannel(channel);
    if (instrument === undefined || frequency === undefined) return;
    let currentEnvelopeFrame = this.getCurrentEnvelopeFrameForChannel(channel);
    if (currentEnvelopeFrame < instrument.sustainStart) {
      this.playAttackDecay(frequency, instrument, channel, time);
    } else if (currentEnvelopeFrame < instrument.releaseStart) {
      this.playSustain(frequency, instrument, channel, time);
    } else {
      this.playRelease(frequency, instrument, channel, time);
    }
  }

  private schedulePause(channel: TiaSoundChannel, time: number) {
    let frequency = this.getFrequencyForChannel(channel);
    this.setFrequencyForChannel(undefined, channel);
    let osc = this.getOscForChannel(channel);
    let instrument = this.getInstrumentForChannel(channel);
    this.setInstrumentForChannel(undefined, channel);

    if (!instrument) {
      osc.v.setValueAtTime(0, time);
      return;
    }

    //RELEASE
    this.playRelease(frequency, instrument, channel, time);
  }

  private scheduleSlide(
    slideAmount: number,
    channel: TiaSoundChannel,
    time: number,
  ) {
    let frequency = this.getFrequencyForChannel(channel);
    if (frequency === undefined) return;

    let osc = this.getOscForChannel(channel);
    let newFrequency = frequency + slideAmount;
    osc.f.setValueAtTime(newFrequency, time);
    this.setFrequencyForChannel(newFrequency, channel);
  }

  private scheduleMelodic(
    instrument: IMelodicInstrument,
    frequency: number,
    channel: TiaSoundChannel,
    time: number,
  ) {
    this.setInstrumentForChannel(instrument, channel);
    this.setFrequencyForChannel(frequency, channel);
    this.setCurrentEnvelopeFrameForChannel(0, channel);

    this.playAttackDecay(frequency, instrument, channel, time);
    if (this.getCurrentEnvelopeFrameForChannel(channel) < this.currentSpeed) {
      this.playSustain(frequency, instrument, channel, time);
    }
  }

  private getFrequency(frequency: number): number {
    return frequency % 31;
  }

  private getWaveformForInstrument(
    frequency: number,
    instrument: IMelodicInstrument,
  ): number {
    if (instrument.waveform !== WaveformType.PureCombined) {
      return instrument.waveform;
    }
    //SPLIT PURE COMBINED WAVEFORM
    return frequency >= 32 ? 12 : 4;
  }

  private playAttackDecay(
    frequency: number,
    instrument: IMelodicInstrument,
    channel: TiaSoundChannel,
    time: number,
  ) {
    console.debug('ATTACK/DECAY');
    let osc = this.getOscForChannel(channel);
    let attackDecayFrequencies = instrument.frequencies.map(
      (f) => (frequency + f) % 31,
    );
    let attackDecayVolumes = instrument.volumes;
    let currentEnvelopeFrame = this.getCurrentEnvelopeFrameForChannel(channel);
    for (let i = 0; i < this.currentSpeed; i++) {
      let f = this.getFrequency(attackDecayFrequencies[currentEnvelopeFrame]);
      let c = this.getWaveformForInstrument(frequency, instrument);
      let v = attackDecayVolumes[currentEnvelopeFrame];
      let t = time + i + this.secondsPerFrame;
      osc.f.setValueAtTime(f, t);
      osc.c.setValueAtTime(c, t);
      osc.v.setValueAtTime(v, t);
      currentEnvelopeFrame++;
      this.setCurrentEnvelopeFrameForChannel(currentEnvelopeFrame, channel);
    }
  }

  private playSustain(
    frequency: number,
    instrument: IMelodicInstrument,
    channel: TiaSoundChannel,
    time: number,
  ) {
    console.debug('SUSTAIN');
    let osc = this.getOscForChannel(channel);
    let sustainFrequencies = instrument.frequencies.map((f) => frequency + f);
    let sustainVolumes = instrument.volumes;
    let currentEnvelopeFrame = this.getCurrentEnvelopeFrameForChannel(channel);

    for (let i = 0; i < this.currentSpeed; i++) {
      let f = this.getFrequency(sustainFrequencies[currentEnvelopeFrame]);
      let c = this.getWaveformForInstrument(frequency, instrument);
      let v = sustainVolumes[currentEnvelopeFrame];
      let t = time + i + this.secondsPerFrame;
      osc.f.setValueAtTime(f, t);
      osc.c.setValueAtTime(c, t);
      osc.v.setValueAtTime(v, t);

      currentEnvelopeFrame++;
      if (currentEnvelopeFrame >= instrument.releaseStart) {
        currentEnvelopeFrame = instrument.sustainStart;
      }
      this.setCurrentEnvelopeFrameForChannel(currentEnvelopeFrame, channel);
    }
  }

  private playRelease(
    frequency: number,
    instrument: IMelodicInstrument,
    channel: TiaSoundChannel,
    time: number,
  ) {
    console.debug('RELEASE');
    let osc = this.getOscForChannel(channel);
    let releaseFrequencies = instrument.frequencies.map((f) => frequency + f);
    let releaseVolumes = instrument.volumes;

    let currentEnvelopeFrame = instrument.releaseStart;
    for (let i = 0; i < this.currentSpeed; i++) {
      let f = this.getFrequency(releaseFrequencies[currentEnvelopeFrame]);
      let c = this.getWaveformForInstrument(frequency, instrument);
      let v = releaseVolumes[currentEnvelopeFrame];
      let t = time + i + this.secondsPerFrame;
      osc.f.setValueAtTime(f, t);
      osc.c.setValueAtTime(c, t);
      osc.v.setValueAtTime(v, t);
      currentEnvelopeFrame++;
      this.setCurrentEnvelopeFrameForChannel(currentEnvelopeFrame, channel);
    }
  }

  private schedulePercussion(
    instrument: IPercussionInstrument,
    channel: TiaSoundChannel,
    time: number,
  ) {
    this.setFrequencyForChannel(undefined, channel);
    this.setInstrumentForChannel(undefined, channel);
    let osc = this.getOscForChannel(channel);
    let currentEnvelopeFrame = this.getCurrentEnvelopeFrameForChannel(channel);
    for (let i = 0; i < this.currentSpeed; i++) {
      let f = this.getFrequency(instrument.frequencies[currentEnvelopeFrame]);
      let c = instrument.waveforms[currentEnvelopeFrame];
      let v = instrument.volumes[currentEnvelopeFrame];
      let t = time + i * this.secondsPerFrame;
      osc.f.setValueAtTime(f, t);
      osc.c.setValueAtTime(c, t);
      osc.v.setValueAtTime(v, t);
      currentEnvelopeFrame++;
      if (currentEnvelopeFrame > instrument.envelopeLength) {
        osc.v.setValueAtTime(
          0,
          time + instrument.envelopeLength * this.secondsPerFrame,
        );
        currentEnvelopeFrame = 0;
      }
      this.setCurrentEnvelopeFrameForChannel(currentEnvelopeFrame, channel);
    }
  }

  private getInstrument(
    note: INote,
  ): IMelodicInstrument | IPercussionInstrument | null {
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
    return channel === TiaSoundChannel.A
      ? this._channelA.currentInstrument
      : this._channelB.currentInstrument;
  }

  private setInstrumentForChannel(
    instrument: IMelodicInstrument,
    channel: TiaSoundChannel,
  ) {
    channel === TiaSoundChannel.A
      ? (this._channelA.currentInstrument = instrument)
      : (this._channelB.currentInstrument = instrument);
  }

  private getFrequencyForChannel(channel: TiaSoundChannel): number | undefined {
    return channel === TiaSoundChannel.A
      ? this._channelA.currentFrequency
      : this._channelB.currentFrequency;
  }

  private setFrequencyForChannel(
    frequency: number | undefined,
    channel: TiaSoundChannel,
  ) {
    if (channel === TiaSoundChannel.A) {
      this._channelA.currentFrequency = frequency;
    } else {
      this._channelB.currentFrequency = frequency;
    }
  }

  private getOscForChannel(channel: TiaSoundChannel): TiaOsc {
    return channel === TiaSoundChannel.A
      ? this._channelA.oscillator
      : this._channelB.oscillator;
  }

  private getCurrentEnvelopeFrameForChannel(channel: TiaSoundChannel): number {
    return channel === TiaSoundChannel.A
      ? this._channelA.currentEnvelopeFrame
      : this._channelB.currentEnvelopeFrame;
  }

  private setCurrentEnvelopeFrameForChannel(
    frame: number,
    channel: TiaSoundChannel,
  ) {
    channel === TiaSoundChannel.A
      ? (this._channelA.currentEnvelopeFrame = frame)
      : (this._channelB.currentEnvelopeFrame = frame);
  }

  private get currentSpeed(): number {
    let isEven = this._row % 2 === 0;
    if (
      this._song.globalspeed === undefined ||
      this._song.globalspeed === true
    ) {
      return isEven ? this._song.evenspeed : this._song.oddspeed;
    } else {
      let pattern = this.currentPatternA;
      return isEven
        ? pattern.evenspeed ?? this._song.evenspeed
        : pattern.oddspeed ?? this._song.oddspeed;
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
