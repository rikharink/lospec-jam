export enum NoteType {
  Hold = 0,
  Melodic = 1,
  Pause = 2,
  Percussion = 3,
  Slide = 4,
}

export enum WaveformType {
  Buzzy = 1,
  BuzzyRumble = 2,
  FlangyWavering = 3,
  PureHigh = 4,
  PureBuzzy = 6,
  ReedyRumble = 7,
  WhiteNoise = 8,
  PureLow = 12,
  ElectronicRumble = 14,
  ElectronicSqueal = 15,
  PureCombined = 16,
}

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
  waveform: WaveformType;
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
  type: NoteType;
  number: number;
  value: number;
}

export interface IPattern {
  name: string;
  evenspeed?: number;
  oddspeed?: number;
  notes: INote[];
}

export interface ISong {
  channels: IChannel[];
  instruments: IMelodicInstrument[];
  metaAuthor: string;
  metaComment: string;
  metaName: string;
  globalspeed?: boolean;
  oddspeed: number;
  evenspeed: number;
  patterns: IPattern[];
  percussion: IPercussionInstrument[];
  pitchGuideBaseFrequency: number;
  pitchGuideName: string;
  pitchGuideTvStandard: string;
  rowsperbeat: number;
  tvmode: string;
  version: number;
}
