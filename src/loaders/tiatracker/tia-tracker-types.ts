export interface ISequence {
  gototarget: number;
  patternindex: number;
}

export interface IChannel {
  sequence: ISequence[];
}

export interface IMelodicInstrument {
  envelopeLength: number;
  frequencies: number[];
  name: string;
  releaseStart: number;
  sustainStart: number;
  version: number;
  volumes: number[];
  waveform: number;
}

export interface IPercussionInstrument {
  envelopeLength: number;
  frequencies: number[];
  name: string;
  overlay: boolean;
  version: number;
  volumes: number[];
  waveforms: number[];
}

export interface INote {
  type: number;
  number: number;
  value: number;
}

export interface IPattern {
  name: string;
  notes: INote[];
}

export interface ISong {
  channels: IChannel[];
  evenspeed: number;
  instruments: IMelodicInstrument[];
  metaAuthor: string;
  metaComment: string;
  metaName: string;
  oddspeed: number;
  patterns: IPattern[];
  percussion: IPercussionInstrument[];
  pitchGuideBaseFrequency: number;
  pitchGuideName: string;
  pitchGuideTvStandard: string;
  rowsperbeat: number;
  tvmode: string;
  version: number;
}
