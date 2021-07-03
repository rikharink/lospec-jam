import { AudioManager } from '../managers/audio-manager';
import { Container } from 'pixi.js';
import type { Scene } from '../scenes/scene';
import { StackDirection, StackLayout } from '../components/stack-layout';
import { Toggle } from '../components/toggle';
import { Label } from '../components/label';
import { Palette } from '../palette';
import { getBackButton } from '../components/button';
import { Game } from '../game';
import { Slider } from '../components/slider';

function addLabelToToggle(label: string, toggle: Toggle) {
  let layout = new StackLayout({ direction: StackDirection.Horizontal });
  let lbl = new Label(label);
  lbl.anchor.set(0, -0.15);
  layout.setChildren(lbl, toggle);
  return layout;
}

function addLabelToSlider(label: string, slider: Slider) {
  let layout = new StackLayout({ direction: StackDirection.Horizontal });
  let lbl = new Label(label);
  layout.setChildren(lbl, slider);
  return layout;
}

export function getSettingsScene(): Scene {
  const id = 'settings';
  const audioManager = AudioManager.shared;
  const backgroundColor = Palette.background;
  const [width, height] = Game.game.size;
  const stage = new Container();
  stage.name = id;
  const text = new Label('SETTING');

  text.anchor.set(0.5, 0);
  text.position.set(width / 2, 20);

  stage.addChild(text);

  let settings = new StackLayout({});
  let mainSlider = new Slider({
    width: 150,
    value: audioManager.main.gain.value,
  });

  let musicSlider = new Slider({
    width: 150,
    value: audioManager.music.gain.value,
  });

  let fxSlider = new Slider({
    width: 150,
    value: audioManager.fx.gain.value,
  });

  mainSlider.on('slidervaluechanged', (value: number) =>
    audioManager.main.gain.rampTo(value),
  );
  musicSlider.on('slidervaluechanged', (value: number) =>
    audioManager.music.gain.rampTo(value),
  );
  fxSlider.on('slidervaluechanged', (value: number) =>
    audioManager.fx.gain.rampTo(value),
  );

  let mainToggle = new Toggle({
    state: audioManager.mainOn,
  });

  let musicToggle = new Toggle({
    state: audioManager.musicOn,
  });

  musicToggle.on('toggle', (state) => {
    audioManager.toggleMusic(state);
    musicSlider.disabled = !state;
  });

  let fxToggle = new Toggle({
    state: audioManager.fxOn,
  });

  fxToggle.on('toggle', (state) => {
    audioManager.toggleFx(state);
    fxSlider.disabled = !state;
  });

  mainToggle.on('toggle', (state) => {
    audioManager.toggleMain(state);
    musicToggle.disabled = !state;
    fxToggle.disabled = !state;
    mainSlider.disabled = !state;
    musicSlider.disabled = !state;
    fxSlider.disabled = !state;
  });

  let main = addLabelToToggle('play sound    ', mainToggle);
  let music = addLabelToToggle('play music    ', musicToggle);
  let fx = addLabelToToggle('play effects  ', fxToggle);

  let mainVolume = addLabelToSlider('sound    ', mainSlider);
  let musicVolume = addLabelToSlider('music    ', musicSlider);
  let fxVolume = addLabelToSlider('effects  ', fxSlider);

  settings.setChildren(main, music, fx, mainVolume, musicVolume, fxVolume);
  settings.centerInScreen();
  stage.addChild(settings);

  stage.addChild(getBackButton());

  return {
    id,
    stage,
    backgroundColor,
    canPause: false,
  };
}
