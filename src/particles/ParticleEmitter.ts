
import { Vector3 } from '@uon/math';

export class ParticleEmitter {


    private _attractors: any[];

    private _emitRate: number;
    private _maxParticles: number = 5000;

    private _duration: number;
    private _falloffDuration: number;

    private _count: number = 0;

    private _alive: Uint8Array;
    private _positions: Float32Array;
    private _colors: Float32Array;
    private _scales: Float32Array;

    constructor() {

    }


}