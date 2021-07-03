import { Container, Graphics, InteractionEvent, LINE_CAP, Point } from 'pixi.js';
import { isObject } from 'tone';
import { clamp, normalize } from '../math/math';
import { Palette } from '../palette';
import { ContentView } from './content-view';

interface SliderOptions {
    width: number;
    height: number;
    min: number;
    max: number;
    value: number;
    trackColor: number;
    trackColorDisabled: number;
    thumbColor: number;
    thumbColorDisabled: number;
    trackWidth: number;
    thumbWidth: number;
    thumbHeight: number;
}

export class Slider extends ContentView {
    private _value: number;
    private _min: number;
    private _max: number;
    private _sliderWidth: number;
    private _sliderHeight: number;
    private _trackColor: number;
    private _trackColorDisabled: number;
    private _trackWidth: number;
    private _thumbColor: number;
    private _thumbColorDisabled: number;
    private _thumbWidth: number;
    private _thumbHeight: number;
    private _isDragging: boolean = false;
    private _lastPos?: Point;
    private _disabled = false;
    private _thumb?: Graphics;

    constructor({
        min = 0,
        max = 1,
        value = 0,
        width = 200,
        height = 32,
        trackColor = Palette.foreground,
        trackColorDisabled = Palette[8],
        trackWidth = 2,
        thumbColor = Palette.accent,
        thumbColorDisabled = Palette[8],
        thumbWidth = 12,
        thumbHeight = 16,
    }: Partial<SliderOptions>) {
        super();
        this._min = min;
        this._max = max;
        this._value = value;
        this._sliderWidth = width;
        this._sliderHeight = height;
        this._trackColor = trackColor;
        this._trackColorDisabled = trackColorDisabled
        this._trackWidth = trackWidth;
        this._thumbColor = thumbColor;
        this._thumbColorDisabled = thumbColorDisabled;
        this._thumbWidth = thumbWidth;
        this._thumbHeight = thumbHeight;
        window.addEventListener('pointerup', this.stopMove.bind(this));
        this.draw();
    }

    private draw() {
        let slider = new Graphics();

        // DRAW TRACK
        let track = new Graphics();
        track.interactive = false;
        track.lineStyle({
            color: !this.disabled ? this._trackColor : this._trackColorDisabled,
            width: this._trackWidth,
            cap: LINE_CAP.BUTT,
        });
        let startY = this._sliderHeight / 2;
        let startX = 0;
        let endX = startX + this._sliderWidth;
        track.moveTo(startX, startY);
        track.lineTo(endX, startY);


        // DRAW THUMB
        let thumb = new Graphics();
        let nv = normalize(this._value, this._min, this._max);
        let thumbX = endX * nv - this._thumbWidth / 2;
        let startThumbY = startY - this._thumbHeight / 2;
        thumb.beginFill(!this.disabled ? this._thumbColor : this._thumbColorDisabled);
        thumb.drawRoundedRect(thumbX, startThumbY, this._thumbWidth, this._thumbHeight, 4);
        thumb.endFill();

        // SETUP INTERACTION
        thumb.interactive = !this.disabled;
        thumb.on('pointerdown', this.startMove.bind(this));
        thumb.on('pointerup', this.stopMove.bind(this));

        slider.interactive = !this.disabled;
        slider.on('pointermove', this.move.bind(this))
        slider.on('pointerup', this.stopMove.bind(this));
        this.on('pointerup', this.stopMove.bind(this));
        slider.addChild(track, thumb);

        this.content = slider;
    }

    private move(ev: InteractionEvent) {
        if (this._isDragging) {
            let pos = ev.data.global.clone();
            let dx = pos.x - this._lastPos.x;
            let movement = dx / this.width;
            this.value = clamp(this._min, this._max, this._value + movement);
            this._lastPos = pos;
        }
    }

    private startMove(ev: InteractionEvent) {
        if (ev.data.button === 0) {
            this._lastPos = ev.data.global.clone();
            this._isDragging = true;
        }
    }

    private stopMove() {
        this._lastPos = undefined;
        this._isDragging = false;
    }

    public get value() {
        return this._value;
    }

    public get min() {
        return this._min;
    }

    public get max() {
        return this._max;
    }

    public set value(value: number) {
        if (value == this._value) return;
        if (value < this._min || value > this._max) {
            throw Error(`Value ${value} must be between ${this._min} and ${this._max}`);
        }
        this._value = value;
        this.emit('slidervaluechanged', this._value);
        this.draw();
    }

    public scaleWidthToParent() {
        this.width = this.parent.width;
    }

    public get disabled() {
        return this._disabled;
    }

    public set disabled(value: boolean) {
        this._disabled = value;
        this.draw();
    }
}
