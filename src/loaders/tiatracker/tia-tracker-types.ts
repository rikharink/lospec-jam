export interface Sequence {
    gototarget: number;
    patternindex: number;
}

export interface Channel {
    sequence: Sequence[];
}

export interface Instrument {
    envelopeLength: number;
    frequencies: number[];
    name: string;
    releaseStart: number;
    sustainStart: number;
    version: number;
    volumes: number[];
    waveform: number;
}

export interface Note {
    number: number;
    type: number;
    value: number;
}

export interface Pattern {
    name: string;
    notes: Note[];
}

export interface Percussion {
    envelopeLength: number;
    frequencies: number[];
    name: string;
    overlay: boolean;
    version: number;
    volumes: number[];
    waveforms: number[];
}

export interface Song {
    channels: Channel[];
    evenspeed: number;
    instruments: Instrument[];
    metaAuthor: string;
    metaComment: string;
    metaName: string;
    oddspeed: number;
    patterns: Pattern[];
    percussion: Percussion[];
    pitchGuideBaseFrequency: number;
    pitchGuideName: string;
    pitchGuideTvStandard: string;
    rowsperbeat: number;
    tvmode: string;
    version: number;
}