import { InputManager } from './../managers/input-manager';
import { defineSystem, IWorld } from 'bitecs';
import { playerCharacterQuery } from './queries';

export const playerCharacterMovementSystem = defineSystem((world: IWorld) => {
  const input = InputManager.shared;
  const characters = playerCharacterQuery(world);
  return world;
});

export const timerSystem = defineSystem((world: IWorld) => {
  const now = performance.now();
  if (!world.time) {
    world.time = {
      delta: 0,
      elapsed: 0,
      then: now,
    };
  }
  const delta = now - world.time.then;
  world.time.delta = delta;
  world.time.elapsed += delta;
  world.time.then = now;
  return world;
});
