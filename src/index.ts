import './styles/reset.css';
import './styles/style.css';
import { Game } from './game';
import { Palette } from './palette';
import { SCALE_MODES, settings } from 'pixi.js';

settings.SCALE_MODE = SCALE_MODES.NEAREST;
settings.ROUND_PIXELS = true;

Game.init({
  scaling: 5,
  width: 240,
  height: 135,
  sharedTicker: true,
  sharedLoader: true,
  backgroundColor: Palette.background,
  antialias: false,
  resolution: window.devicePixelRatio,
  autoDensity: true,
})
  .catch((e) => console.error(e))
  .then((game) => {
    //@ts-ignore
    window.game = game;
  });
export {};
