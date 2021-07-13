import { Transport, start, Gain, Context, Oscillator } from 'tone';
import type { Time } from 'tone/build/esm/core/type/Units';
import { TiaOsc, TIA_PAL_CLOCK } from '../sound/tia';
import type { Track } from '../sound/track';

export class AudioManager {
  private static _shared = new AudioManager();
  private readonly _main: Gain;
  private readonly _music: Gain;
  private readonly _fx: Gain;
  private _currentTrack: Track | undefined;

  private _mainOn: boolean = true;
  private _musicOn: boolean = true;
  private _fxOn: boolean = true;

  private _previousGainMain?: number;
  private _previousGainMusic?: number;
  private _previousGainFx?: number;
  private _context: Context;



  constructor() {
    this._context = new Context();
    this._main = new Gain();
    this._main.toDestination();
    this._music = new Gain();
    this._music.connect(this._main);
    this._fx = new Gain();
    this._fx.connect(this._main);
  }

  public get context(): Context {
    return this._context;
  }

  public toggleMain(state: boolean) {
    if (state && this._previousGainMain) {
      this.start();
      this.main.gain.rampTo(this._previousGainMain);
    } else {
      this._previousGainMain = this.main.gain.value;
      this.main.gain.rampTo(0);
      this.stop();
    }
  }

  public toggleMusic(state: boolean) {
    if (state && this._previousGainMusic) {
      this.music.gain.rampTo(this._previousGainMusic);
    } else {
      this._previousGainMusic = this.music.gain.value;
      this.music.gain.rampTo(0);
    }
  }

  public toggleFx(state: boolean) {
    if (state && this._previousGainFx) {
      this.fx.gain.rampTo(this._previousGainFx);
    } else {
      this._previousGainFx = this.fx.gain.value;
      this.fx.gain.rampTo(0);
    }
  }

  public get main(): Gain {
    return this._main;
  }

  public get mainOn(): boolean {
    return this._mainOn;
  }

  public get music(): Gain {
    return this._music;
  }

  public get musicOn(): boolean {
    return this._musicOn;
  }

  public get fx(): Gain {
    return this._fx;
  }

  public get fxOn(): boolean {
    return this._fxOn;
  }

  public async init(): Promise<void> {
    await start();
  }

  public start(time?: Time) {
    Transport.start(time);
  }

  public stop(time?: Time) {
    Transport.stop(time);
  }

  public static get shared() {
    return AudioManager._shared;
  }

  public playTrack(track?: Track) {
    if (!track || this._currentTrack?.id === track.id) return;
    this._currentTrack?.stop();
    this._currentTrack = track;
    this._currentTrack?.play();
  }

  private setupTia() {

  }
}
