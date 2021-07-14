import { GamepadManagerEventType, GamepadManagerEvent, GamepadManagerButtonEvent } from "./managers/gamepad-manager";
import { InputDevice, InputManager } from "./managers/input-manager";

export function setupController() {
    InputManager.shared.addEvents(
        {
            action: 'up-pressed',
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
            action: 'down-pressed',
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
            action: 'left-pressed',
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
            action: 'right-pressed',
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
            action: 'a-pressed',
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
            action: 'b-pressed',
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
            action: 'up-released',
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
            action: 'down-released',
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
            action: 'left-released',
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
            action: 'right-released',
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
            action: 'a-released',
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
            action: 'b-released',
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
            action: 'start',
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