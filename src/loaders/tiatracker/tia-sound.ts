import { ILoaderResource, Loader } from "pixi.js";
import { OfflineContext } from "tone";
import { Seconds } from "tone/build/esm/core/type/Units";
import { Track } from "../../sound/track";
import { Song } from "./tia-tracker-types";

export class TiaSound implements Track {
    private _song: Song;
    private _buffer?: AudioBuffer;
    private _context: OfflineContext;

    public get id(): string {
        return this._song.metaName;
    }

    public static middleware(resource: ILoaderResource, next: Function) {
        if (resource.extension !== "ttt") return next();
        const song: Song = JSON.parse(resource.xhr.responseText);
        const sound = new TiaSound(song);
        sound.load()
            .then((s) => {
                resource.data = s;
                return next();
            })
            .catch((err) => {
                console.error(err);
                return next();
            });
    }

    // public static calculateSongDuration(song: Song): Seconds {
    //     //TODO
    //     return -1;
    // }

    private constructor(song: Song) {
        this._song = song;
        // this._context = new OfflineContext(1, TiaSound.calculateSongDuration(song), 44100);
    }


    play(): void {

    }

    stop(): void {

    }

    load(): Promise<TiaSound> {
        return new Promise<TiaSound>((resolve, reject) => {
            try {
                //TODO: render song to playable buffer
                resolve(this);
            }
            catch (err) {
                reject(err);
            }
        });
    }
}