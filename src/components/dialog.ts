import { Container, DisplayObject, Graphics, InteractionEvent } from 'pixi.js';
import { Game } from '../game';
import { Modal } from '../managers/modal-manager';
import { Palette } from '../palette';
import { middle } from '../util';
import { Button } from './button';
import { Label } from './label';
import { StackDirection, StackLayout } from './stack-layout';

interface DialogOptions {
  title: string;
  body: DisplayObject;
  margin: number;
  backgroundColor: number;
  borderRadius: number;
  ok?: () => void;
  okLabel: string;
  cancel?: () => void;
  cancelLabel: string;
}

export class Dialog extends Modal {
  constructor({
    title = '',
    margin = 4,
    backgroundColor = Palette.accent,
    borderRadius = 4,
    body = new Container(),
    ok,
    okLabel = 'OK',
    cancel,
    cancelLabel = 'CANCEL',
  }: Partial<DialogOptions>) {
    super();
    let [width, height] = Game.game.size;

    let dialog = new Graphics();
    dialog.beginFill(backgroundColor);
    dialog.drawRoundedRect(
      margin,
      margin,
      width - margin * 2,
      height - margin * 2,
      borderRadius,
    );
    dialog.endFill();
    if (title) {
      let titleLabel = new Label(title);

      let x = middle(width, titleLabel.width);
      titleLabel.position.set(x, margin * 2);
      dialog.addChild(titleLabel);
    }
    let actionButtons: Button[] = [];
    if (ok) {
      let okBtn = new Button({ text: okLabel, activeColor: Palette[7] });
      actionButtons.push(okBtn);
      okBtn.on('pointerup', ({ data }: InteractionEvent) => {
        if (data.button === 0) {
          ok();
        }
      });
    }
    if (cancel) {
      let cancelBtn = new Button({
        text: cancelLabel,
        activeColor: Palette[7],
      });
      actionButtons.push(cancelBtn);
      cancelBtn.on('pointerup', ({ data }: InteractionEvent) => {
        if (data.button === 0) {
          cancel();
        }
      });
    }

    dialog.addChild(body);

    if (actionButtons.length > 0) {
      let actions = new StackLayout({ direction: StackDirection.Horizontal });
      actions.setChildren(...actionButtons);
      dialog.addChild(actions);
      actions.centerInScreen();
      let x = middle(width, actions.width);
      actions.position.set(x, height - margin * 2 - actions.height);
      this.selectableItems = actionButtons.map((b, i) => {
        return {
          selectionIndex: i,
          update: b.redraw.bind(b),
        };
      });
    }
    super.content = dialog;
  }
}
