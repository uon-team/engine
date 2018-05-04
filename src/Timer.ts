


export class Timer {

    private _startMS: number = 0;
    private _lastUpdateMS: number = 0;

    private _deltaMS: number = 0;

    constructor() {

    }

    get delta() {
        return this._deltaMS;
    }

    start() {
        this._startMS = Date.now();
        this._lastUpdateMS = this._startMS;
    }

    update() {

        let now = Date.now();

        this._deltaMS = (now - this._lastUpdateMS) / 1000;

        this._lastUpdateMS = now;

    }


}