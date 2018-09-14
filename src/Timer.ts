


/**
 * A simple timer
 */
export class Timer {

    private _startMS: number = 0;
    private _lastUpdateMS: number = 0;

    private _deltaMS: number = 0;

    constructor() {

    }

    /**
     * The delta between the last updates
     */
    get delta() {
        return this._deltaMS;
    }

    /**
     * Start the timer
     */
    start() {
        this._startMS = Date.now();
        this._lastUpdateMS = this._startMS;
    }


    /**
     * Update the timer
     */
    update() {

        let now = Date.now();

        this._deltaMS = (now - this._lastUpdateMS) / 1000;

        this._lastUpdateMS = now;

    }


}