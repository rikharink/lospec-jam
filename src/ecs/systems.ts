import { InputManager } from './../managers/input-manager';
import { defineSystem, IWorld } from 'bitecs';
import { playerCharacterQuery, velocityChangedQuery } from './queries';
import { ControllerAction } from '../controller';
import { Position, Velocity } from './components';
import { clamp } from '../math/math';

export const velocitySystem = defineSystem((world: IWorld) => {
  for (let eid of velocityChangedQuery(world)) {
    //TODO: Make better
    let vx = Velocity.x[eid];
    let vy = Velocity.y[eid];
    vx += vx * -0.01;
    vy += vy * -0.01;
    Velocity.x[eid] = vx;
    Velocity.y[eid] = vy;
  }
  return world;
})

export const playerCharacterMovementSystem = defineSystem((world: IWorld) => {
  const input = InputManager.shared;
  const characters = playerCharacterQuery(world);
  for (let eid of characters) {
    if (input.hasAction(ControllerAction.Up)) {
      Velocity.y[eid] -= 0.5;
    }
    if (input.hasAction(ControllerAction.Down)) {
      Velocity.y[eid] += 0.5;
    }
    if (input.hasAction(ControllerAction.Left)) {
      Velocity.x[eid] -= 0.5;
    }
    if (input.hasAction(ControllerAction.Right)) {
      Velocity.x[eid] += 0.5;
    }
    Velocity.x[eid] = clamp(-1, 1, Velocity.x[eid]);
    Velocity.y[eid] = clamp(-1, 1, Velocity.y[eid]);
    Position.x[eid] += Velocity.x[eid];
    Position.y[eid] += Velocity.y[eid];
  }
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
