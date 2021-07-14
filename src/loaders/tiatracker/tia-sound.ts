import { ILoaderResource, Loader } from 'pixi.js';
import { Transport } from 'tone';
import { Seconds } from 'tone/build/esm/core/type/Units';
import { Track } from '../../sound/track';
import {
  ISong,
  IMelodicInstrument,
  IPercussionInstrument,
  IPattern,
} from './tia-tracker-types';

export class TiaSound implements Track {
  private _song: ISong;
  private _isRunning: boolean = false;
  private _stepLoopId?: number;
  private _sequenceA = 0;
  private _sequenceB = 0;
  private _rowA = 0;
  private _rowB = 0;

  public static middleware(resource: ILoaderResource, next: Function) {
    if (resource.extension !== 'ttt') return next();
    const song: ISong = JSON.parse(resource.xhr.responseText);
    resource.data = song;
    return next();
  }

  public constructor() {
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
  }

  play(): void {
    if (this._isRunning) return;
    if (Transport.state !== "started") {
      Transport.start();
    }
    this._isRunning = true;
  }

  stop(): void {
    this._isRunning = false;
    Transport.clear(this._stepLoopId);
    this._stepLoopId = undefined;
  }

  private step() {
    if (!this._isRunning) return;
  }

  private currentSpeed(): ISpeed {
    if (this._song.globalspeed === undefined || this._song.globalspeed === true) {
      return { evenspeed: this._song.evenspeed, oddspeed: this._song.oddspeed };
    } else {
      let pattern = this.currentPatternA;
      return {
        evenspeed: pattern.evenspeed ?? this._song.evenspeed,
        oddspeed: pattern.oddspeed ?? this._song.oddspeed
      };
    }
  }

  private get currentPatternA(): IPattern {
    return this._song.patterns[this._song.channels[0].sequence[this._sequenceA].patternindex]
  }

  private get currentPatternB(): IPattern {
    return this._song.patterns[this._song.channels[1].sequence[this._sequenceB].patternindex]
  }

  private createMelodicInstrument(instrument: IMelodicInstrument) { }
  private creatPercussionInstrument(instrument: IPercussionInstrument) { }
}

interface ISpeed {
  evenspeed: number;
  oddspeed: number;
}
