import type { Identifiable } from '../interfaces/identifiable';

export interface Track extends Identifiable {
  play(): void;
  stop(): void;
}
