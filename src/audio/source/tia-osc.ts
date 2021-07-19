import { connectSeries, Gain, InputNode, Mono, optionsFromArguments, Param, ToneAudioNode, ToneAudioNodeOptions } from "tone";
import { readOnly, RecursivePartial } from "tone/build/esm/core/util/Interface";
import { ToneAudioWorklet } from "tone/build/esm/core/worklet/ToneAudioWorklet";
import { workletName } from "./tia-osc.worklet";

interface TiaOscOptions extends ToneAudioNodeOptions {
    f: number;
    v: number;
    c: number;
}

export class TiaOsc extends ToneAudioWorklet<TiaOscOptions> {
    readonly Name = 'TiaOsc';

    readonly f: Param<"number">;
    readonly v: Param<"number">;
    readonly c: Param<"number">;
    public get input(): InputNode {
        throw new Error("Output only");
    }
    readonly output: Gain;
    readonly mono: Mono;

    constructor(f: number, v: number, c: number);
    constructor(options?: RecursivePartial<TiaOscOptions>);
    constructor() {
        super(optionsFromArguments(TiaOsc.getDefaults(), arguments, ["f", "v", "c"]));
        let options = optionsFromArguments(TiaOsc.getDefaults(), arguments, ["f", "v", "c"]);
        this.output = new Gain({ context: this.context });
        this.mono = new Mono({ context: this.context });

        this.f = new Param<"number">({
            context: this.context,
            value: options.f,
            units: "number",
            minValue: 0,
            maxValue: 31,
            param: this._dummyParam,
            swappable: true,
        });

        this.v = new Param<"number">({
            context: this.context,
            value: options.v,
            units: "number",
            minValue: 0,
            maxValue: 15,
            param: this._dummyParam,
            swappable: true,
        });

        this.c = new Param<"number">({
            context: this.context,
            value: options.f,
            units: "number",
            minValue: 0,
            maxValue: 15,
            param: this._dummyParam,
            swappable: true,
        });

        readOnly(this, ["f", "v", "c"]);
    }

    protected _audioWorkletName(): string {
        return workletName;
    }

    onReady(node: AudioWorkletNode) {
        connectSeries(node, this.mono, this.output);
        const f = node.parameters.get("f") as AudioParam;;
        this.f.setParam(f);
        const v = node.parameters.get("v") as AudioParam;;
        this.v.setParam(v);
        const c = node.parameters.get("c") as AudioParam;;
        this.c.setParam(c);
    }

    dispose(): this {
        super.dispose();
        this.output.dispose();
        this.f.dispose();
        this.v.dispose();
        this.c.dispose();
        return this;
    }

    static getDefaults(): TiaOscOptions {
        return Object.assign(ToneAudioNode.getDefaults(), {
            f: 0,
            v: 0,
            c: 0,
        });
    }

}