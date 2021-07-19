import { defineQuery } from 'bitecs';
import { Position, Velocity, IsPlayerCharacter } from './components';

export const playerCharacterQuery = defineQuery([
  Position,
  Velocity,
  IsPlayerCharacter,
]);
