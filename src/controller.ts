import { InputDevice, InputManager } from './managers/input-manager';

export enum ControllerAction {
  'Up' = 'up',
  'Down' = 'down',
  'Left' = 'left',
  'Right' = 'right',
  'A' = 'a',
  'B' = 'b',
  'Start' = 'start',
}

export function setupController() {
  InputManager.shared.addEvents(
    {
      action: ControllerAction.Up,
      inputs: [
        {
          type: InputDevice.Keyboard,
          key: 'ArrowUp',
        },
        {
          type: InputDevice.Gamepad,
          button: 12
        },
      ],
    },
    {
      action: ControllerAction.Down,
      inputs: [
        {
          type: InputDevice.Keyboard,
          key: 'ArrowDown',
        },
        {
          type: InputDevice.Gamepad,
          button: 13,
        },
      ],
    },
    {
      action: ControllerAction.Left,
      inputs: [
        {
          type: InputDevice.Keyboard,
          key: 'ArrowLeft',
        },
        {
          type: InputDevice.Gamepad,
          button: 14,
        },
      ],
    },
    {
      action: ControllerAction.Right,
      inputs: [
        {
          type: InputDevice.Keyboard,
          key: 'ArrowRight',
        },
        {
          type: InputDevice.Gamepad,
          button: 15,
        },
      ],
    },
    {
      action: ControllerAction.A,
      inputs: [
        {
          type: InputDevice.Keyboard,
          key: 'z',
        },
        {
          type: InputDevice.Keyboard,
          key: ' ',
        },
        {
          type: InputDevice.Gamepad,
          button: 0,
        },
      ],
    },
    {
      action: ControllerAction.B,
      aliases: ['back'],
      inputs: [
        {
          type: InputDevice.Keyboard,
          key: 'x',
        },
        {
          type: InputDevice.Keyboard,
          key: 'Alt',
        },
        {
          type: InputDevice.Keyboard,
          key: 'Backspace',
        },
        {
          type: InputDevice.Gamepad,
          button: 1,
        },
      ],
    },
    {
      action: ControllerAction.Start,
      inputs: [
        {
          type: InputDevice.Keyboard,
          key: 'Enter',
        },
        {
          type: InputDevice.Gamepad,
          button: 9,
        },
      ],
    },
  );
}
