import type { Identifiable } from '../interfaces/identifiable';
import type { Container, Ticker } from 'pixi.js';
import type { Track } from '../sound/track';

export interface Scene extends Identifiable {
  stage: Container;
  backgroundColor: number;
  track?: Track;
  ticker?: Ticker;
  canPause: boolean;
  reset?: () => void;
  selectNext?: () => void;
  selectPrevious?: () => void;
}
