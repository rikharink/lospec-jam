import type { Identifiable } from '../interfaces/identifiable';
import type { Container, Ticker } from 'pixi.js';
import type { Track } from '../sound/track';
import { SelectableItem } from '../managers/selection-manager';
import { IWorld } from 'bitecs';

export interface Scene extends Identifiable {
  world: IWorld;
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
