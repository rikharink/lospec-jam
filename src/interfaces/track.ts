import type { Identifiable } from './identifiable';

export interface Track extends Identifiable {
  play(): void;
  stop(): void;
}
