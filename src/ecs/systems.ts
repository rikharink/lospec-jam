import { InputManager } from './../managers/input-manager';
import { defineSystem, IWorld } from 'bitecs';
import { playerCharacterQuery } from './queries';
import { ControllerAction } from '../controller';
import { Position, Velocity } from './components';
import { clamp } from '../math/math';

function clampVelocity(eid: number) {
  Velocity.x[eid] = clamp(-1, 1, Velocity.x[eid]);
  Velocity.y[eid] = clamp(-1, 1, Velocity.y[eid]);
}

//TODO: make better
function decreaseVelocity(eid: number) {
  let vx = Velocity.x[eid];
  let vy = Velocity.y[eid];
  if (Math.abs(vx) > 0 || Math.abs(vy) > 0) {
    console.debug('before', vx, vy);
  }
  vx += vx * -0.01;
  vy += vy * -0.01;
  if (Math.abs(vx) > 0 || Math.abs(vy) > 0) {
    console.debug(vx, vy);
  }
  Velocity.x[eid] = vx;
  Velocity.y[eid] = vy;
}

export const playerCharacterMovementSystem = defineSystem((world: IWorld) => {
  const input = InputManager.shared;
  const characters = playerCharacterQuery(world);
  const hasUp = input.hasAction(ControllerAction.UpPressed);
  const hasDown = input.hasAction(ControllerAction.DownPressed);
  const hasLeft = input.hasAction(ControllerAction.LeftPressed);
  const hasRight = input.hasAction(ControllerAction.RightPressed);
  for (let character of characters) {
    decreaseVelocity(character);
    if (hasUp) {
      Velocity.y[character] -= 0.5;
    }
    if (hasDown) {
      Velocity.y[character] += 0.5;
    }
    if (hasLeft) {
      Velocity.x[character] -= 0.5;
    }
    if (hasRight) {
      Velocity.x[character] += 0.5;
    }
    clampVelocity(character);
    Position.x[character] += Velocity.x[character];
    Position.y[character] += Velocity.y[character];
  }

  const hasUpReleased = input.hasAction(ControllerAction.UpReleased);
  const hasDownReleased = input.hasAction(ControllerAction.DownReleased);
  const hasLeftReleased = input.hasAction(ControllerAction.LeftReleased);
  const hasRightReleased = input.hasAction(ControllerAction.RightReleased);
  if (hasUpReleased) {
    input.clearState(ControllerAction.UpPressed, ControllerAction.UpReleased);
  }
  if (hasDownReleased) {
    input.clearState(
      ControllerAction.DownPressed,
      ControllerAction.DownReleased,
    );
  }
  if (hasLeftReleased) {
    input.clearState(
      ControllerAction.LeftPressed,
      ControllerAction.LeftReleased,
    );
  }
  if (hasRightReleased) {
    input.clearState(
      ControllerAction.RightPressed,
      ControllerAction.RightReleased,
    );
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
