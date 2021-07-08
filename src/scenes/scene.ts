import type { Identifiable } from '../interfaces/identifiable';
import type { Container, Ticker } from 'pixi.js';
import type { Track } from '../sound/track';
import { ContentView } from '../components/content-view';

export interface Scene extends Identifiable {
  stage: Container;
  backgroundColor: number;
  track?: Track;
  ticker?: Ticker;
  canPause: boolean;
  reset?: () => void;
  selectedItem?: number;
  selectableItems?: ContentView[];
  activate?: () => void;
}
