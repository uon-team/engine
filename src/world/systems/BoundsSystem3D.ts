
import { Sphere } from '@uon/math';
import { System, SystemLike } from "../System";
import { Transform3D } from "./TransformSystem3D";
import { World } from "../World";
import { Timer } from "../../utils/Timer";


import { Component } from "../Component";



@Component()
export class Bounds3D {


    readonly local: Sphere = new Sphere();
    readonly world: Sphere = new Sphere();

    dirty: boolean = true;

    constructor() {

    }

}


@System({
    use: [
        Transform3D,
        Bounds3D
    ]
})
export class BoundsSystem3D implements SystemLike {



    constructor(private _world: World, private _timer: Timer) {

    }

    update() {

        let entities = this._world.getEntitiesForSystem(BoundsSystem3D);

        //console.log(bound_components);

        for (let [id, comps] of entities) {

            // grab transform
            let t: Transform3D = comps[0];
            let b: Bounds3D = comps[1];

            if (b.dirty || t.dirty) {
                b.world.copy(b.local).applyMatrix4(t.world);
                b.dirty = false;
            }

        }

    }


}

