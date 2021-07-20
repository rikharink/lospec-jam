import { playerCharacterMovementSystem, timerSystem, velocitySystem } from './../ecs/systems';
import type { Scene } from '../interfaces/scene';
import { AnimatedSprite, Container, Ticker, UPDATE_PRIORITY } from 'pixi.js';
import { Palette } from '../palette';
import { addComponent, addEntity, createWorld, pipe } from 'bitecs';
import { Game } from '../game';
import { IsPlayerCharacter, Velocity, Position } from '../ecs/components';

export function getMainScene(): Scene {
  const id = 'main';
  const game = Game.shared;
  let world = createWorld();
  const player = addEntity(world);
  addComponent(world, Position, player);
  addComponent(world, Velocity, player);
  addComponent(world, IsPlayerCharacter, player);

  const stage = new Container();
  const backgroundColor = Palette.background;
  stage.name = id;

  let ticker = new Ticker();
  let ghostyIdleAnim = game.spritesheet.animations['ghosty-idle'];
  let ghostyIdle = new AnimatedSprite(ghostyIdleAnim, true);
  ghostyIdle.animationSpeed = 0.025;
  ghostyIdle.x = 85;
  ghostyIdle.y = 105;
  ghostyIdle.gotoAndPlay(0);
  stage.addChild(ghostyIdle);
  const pipeline = pipe(timerSystem, velocitySystem, playerCharacterMovementSystem);
  ticker.add(() => {
    pipeline(world);
    ghostyIdle.x = Position.x[player];
    ghostyIdle.y = Position.y[player];
  }, UPDATE_PRIORITY.INTERACTION);

  return {
    id,
    world,
    stage,
    backgroundColor,
    ticker,
    canPause: true,
    selectableItems: [],
  };
}
