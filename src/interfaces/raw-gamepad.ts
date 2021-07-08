export interface GamepadEffect {
    startDelay: number,
    duration: number,
    weakMagnitude: number,
    strongMagnitude: number
}


export interface RawGamepad extends Gamepad {
    vibrationActuator?: {
        playEffect: (type: 'dual-rumble', effect: GamepadEffect) => Promise<string>;
        reset: () => Promise<string>;
    };
}