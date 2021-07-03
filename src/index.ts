import './styles/reset.css';
import './styles/style.css';
import { Game } from './game';
import { Palette } from './palette';

Game.init({
  width: 640,
  height: 480,
  sharedTicker: true,
  sharedLoader: true,
  backgroundColor: Palette.background,
})
  .catch((e) => console.error(e))
  .then((game) => {
    //@ts-ignore
    window.game = game;
  });
export {};
