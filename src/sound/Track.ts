import type { Identifiable } from '../interfaces/identifiable';

export interface Track extends Identifiable {
  load(): Promise<Track>;
  play(): void;
  stop(): void;
}
