export interface Gamepad {
    vibrationActuator?: {
        playEffect: (type: 'dual-rumble', effect: StrictEffect) => Promise<string>;
        reset: () => Promise<string>;
    };
}