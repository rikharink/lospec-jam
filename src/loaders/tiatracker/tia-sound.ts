import { ILoaderResource } from 'pixi.js';
import { Track } from '../../sound/track';
import {
  ISong,
  IMelodicInstrument,
  IPercussionInstrument,
} from './tia-tracker-types';

export class TiaSound implements Track {
  private _song: ISong;

  public static middleware(resource: ILoaderResource, next: Function) {
    if (resource.extension !== 'ttt') return next();
    const song: ISong = JSON.parse(resource.xhr.responseText);
    const sound = new TiaSound(song);
    sound
      .load()
      .then((s) => {
        resource.data = s;
        return next();
      })
      .catch((err) => {
        console.error(err);
        return next();
      });
  }

  private constructor(song: ISong) {
    this._song = song;
  }

  public get id(): string {
    return this._song.metaName;
  }

  play(): void {}

  stop(): void {}

  load(): Promise<TiaSound> {
    return new Promise<TiaSound>((resolve, reject) => {
      try {
        //TODO: render song to playable buffer
        resolve(this);
      } catch (err) {
        reject(err);
      }
    });
  }

  private createMelodicInstrument(instrument: IMelodicInstrument) {}
  private creatPercussionInstrument(instrument: IPercussionInstrument) {}
}
