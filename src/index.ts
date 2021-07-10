import './styles/reset.css';
import './styles/style.css';
import { Game } from './game';
import { Palette } from './palette';

Game.init({
  width: 240,
  height: 135,
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
