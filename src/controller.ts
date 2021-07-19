import {
  GamepadManagerEventType,
  GamepadManagerEvent,
  GamepadManagerButtonEvent,
} from './managers/gamepad-manager';
import { InputDevice, InputManager } from './managers/input-manager';

export enum ControllerAction {
  'UpPressed' = 'up-pressed',
  'DownPressed' = 'down-pressed',
  'LeftPressed' = 'left-pressed',
  'RightPressed' = 'right-pressed',
  'APressed' = 'a-pressed',
  'BPressed' = 'b-pressed',
  'UpReleased' = 'up-released',
  'DownReleased' = 'down-released',
  'LeftReleased' = 'left-released',
  'RightReleased' = 'right-released',
  'AReleased' = 'a-released',
  'BReleased' = 'b-released',
  'Start' = 'start',
}

export function setupController() {
  InputManager.shared.addEvents(
    {
      action: ControllerAction.UpPressed,
      inputs: [
        {
          type: InputDevice.Keyboard,
          eventType: 'keydown',
          key: 'ArrowUp',
        },
        {
          type: InputDevice.Gamepad,
          eventType: GamepadManagerEventType.GamepadButtonDown,
          predicate: (ev: GamepadManagerEvent) => {
            let e = ev as GamepadManagerButtonEvent;
            return e?.button === 12;
          },
        },
      ],
    },
    {
      action: ControllerAction.DownPressed,
      inputs: [
        {
          type: InputDevice.Keyboard,
          eventType: 'keydown',
          key: 'ArrowDown',
        },
        {
          type: InputDevice.Gamepad,
          eventType: GamepadManagerEventType.GamepadButtonDown,
          predicate: (ev: GamepadManagerEvent) => {
            let e = ev as GamepadManagerButtonEvent;
            return e?.button === 13;
          },
        },
      ],
    },
    {
      action: ControllerAction.LeftPressed,
      inputs: [
        {
          type: InputDevice.Keyboard,
          eventType: 'keydown',
          key: 'ArrowLeft',
        },
        {
          type: InputDevice.Gamepad,
          eventType: GamepadManagerEventType.GamepadButtonDown,
          predicate: (ev: GamepadManagerEvent) => {
            let e = ev as GamepadManagerButtonEvent;
            return e?.button === 14;
          },
        },
      ],
    },
    {
      action: ControllerAction.RightPressed,
      inputs: [
        {
          type: InputDevice.Keyboard,
          eventType: 'keydown',
          key: 'ArrowRight',
        },
        {
          type: InputDevice.Gamepad,
          eventType: GamepadManagerEventType.GamepadButtonDown,
          predicate: (ev: GamepadManagerEvent) => {
            let e = ev as GamepadManagerButtonEvent;
            return e?.button === 15;
          },
        },
      ],
    },
    {
      action: ControllerAction.APressed,
      inputs: [
        {
          type: InputDevice.Keyboard,
          eventType: 'keydown',
          key: 'z',
        },
        {
          type: InputDevice.Keyboard,
          eventType: 'keydown',
          key: ' ',
        },
        {
          type: InputDevice.Gamepad,
          eventType: GamepadManagerEventType.GamepadButtonDown,
          predicate: (ev: GamepadManagerEvent) => {
            let e = ev as GamepadManagerButtonEvent;
            return e?.button === 0;
          },
        },
      ],
    },
    {
      action: ControllerAction.BPressed,
      inputs: [
        {
          type: InputDevice.Keyboard,
          eventType: 'keydown',
          key: 'x',
        },
        {
          type: InputDevice.Keyboard,
          eventType: 'keydown',
          key: 'Alt',
        },
        {
          type: InputDevice.Gamepad,
          eventType: GamepadManagerEventType.GamepadButtonDown,
          predicate: (ev: GamepadManagerEvent) => {
            let e = ev as GamepadManagerButtonEvent;
            return e?.button === 1;
          },
        },
      ],
    },
    {
      action: ControllerAction.UpReleased,
      aliases: ['previous-item'],
      inputs: [
        {
          type: InputDevice.Keyboard,
          eventType: 'keyup',
          key: 'ArrowUp',
        },
        {
          type: InputDevice.Gamepad,
          eventType: GamepadManagerEventType.GamepadButtonUp,
          predicate: (ev: GamepadManagerEvent) => {
            let e = ev as GamepadManagerButtonEvent;
            return e?.button === 12;
          },
        },
      ],
    },
    {
      action: ControllerAction.DownReleased,
      aliases: ['next-item'],
      inputs: [
        {
          type: InputDevice.Keyboard,
          eventType: 'keyup',
          key: 'ArrowDown',
        },
        {
          type: InputDevice.Gamepad,
          eventType: GamepadManagerEventType.GamepadButtonUp,
          predicate: (ev: GamepadManagerEvent) => {
            let e = ev as GamepadManagerButtonEvent;
            return e?.button === 13;
          },
        },
      ],
    },
    {
      action: ControllerAction.LeftReleased,
      inputs: [
        {
          type: InputDevice.Keyboard,
          eventType: 'keyup',
          key: 'ArrowLeft',
        },
        {
          type: InputDevice.Gamepad,
          eventType: GamepadManagerEventType.GamepadButtonUp,
          predicate: (ev: GamepadManagerEvent) => {
            let e = ev as GamepadManagerButtonEvent;
            return e?.button === 14;
          },
        },
      ],
    },
    {
      action: ControllerAction.RightReleased,
      inputs: [
        {
          type: InputDevice.Keyboard,
          eventType: 'keyup',
          key: 'ArrowRight',
        },
        {
          type: InputDevice.Gamepad,
          eventType: GamepadManagerEventType.GamepadButtonUp,
          predicate: (ev: GamepadManagerEvent) => {
            let e = ev as GamepadManagerButtonEvent;
            return e?.button === 15;
          },
        },
      ],
    },
    {
      action: ControllerAction.AReleased,
      inputs: [
        {
          type: InputDevice.Keyboard,
          eventType: 'keyup',
          key: 'z',
        },
        {
          type: InputDevice.Keyboard,
          eventType: 'keyup',
          key: ' ',
        },
        {
          type: InputDevice.Gamepad,
          eventType: GamepadManagerEventType.GamepadButtonUp,
          predicate: (ev: GamepadManagerEvent) => {
            let e = ev as GamepadManagerButtonEvent;
            return e?.button === 0;
          },
        },
      ],
    },
    {
      action: ControllerAction.BReleased,
      aliases: ['back'],
      inputs: [
        {
          type: InputDevice.Keyboard,
          eventType: 'keyup',
          key: 'x',
        },
        {
          type: InputDevice.Keyboard,
          eventType: 'keyup',
          key: 'Alt',
        },
        {
          type: InputDevice.Keyboard,
          eventType: 'keyup',
          key: 'Backspace',
        },
        {
          type: InputDevice.Keyboard,
          eventType: 'keyup',
          key: 'Escape',
        },
        {
          type: InputDevice.Gamepad,
          eventType: GamepadManagerEventType.GamepadButtonUp,
          predicate: (ev: GamepadManagerEvent) => {
            let e = ev as GamepadManagerButtonEvent;
            return e?.button === 1;
          },
        },
      ],
    },
    {
      action: ControllerAction.Start,
      inputs: [
        {
          type: InputDevice.Keyboard,
          eventType: 'keyup',
          key: 'Enter',
        },
        {
          type: InputDevice.Gamepad,
          eventType: GamepadManagerEventType.GamepadButtonUp,
          predicate: (ev: GamepadManagerEvent) => {
            let e = ev as GamepadManagerButtonEvent;
            return e?.button === 9;
          },
        },
      ],
    },
  );
}
