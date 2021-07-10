import type { Identifiable } from '../interfaces/identifiable';
import type { Container, Ticker } from 'pixi.js';
import type { Track } from '../sound/track';
import { SelectableItem } from '../managers/selection-manager';

export interface Scene extends Identifiable {
  stage: Container;
  backgroundColor: number;
  track?: Track;
  ticker?: Ticker;
  canPause: boolean;
  selectableItems: SelectableItem[];
  reset?: () => void;
  activate?: () => void;
  selectedItem?: number;
}
