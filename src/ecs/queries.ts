import { defineQuery, Changed } from 'bitecs';
import { Position, Velocity, IsPlayerCharacter } from './components';

export const playerCharacterQuery = defineQuery([
  Position,
  Velocity,
  IsPlayerCharacter,
]);

export const velocityChangedQuery = defineQuery([Changed(Velocity)]);
