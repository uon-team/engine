import { System, SystemLike } from "../System";
import { Component } from "../Component";
import { World } from "../World";
import { Timer } from "../../Timer";

import { Vector3, Matrix4, Quaternion } from '@uon/math';




@Component()
export class Transform3D {

    translation: Vector3 = new Vector3();
    orientation: Quaternion = new Quaternion();
    scale: Vector3 = new Vector3(1, 1, 1);

    readonly world: Matrix4 = new Matrix4();

    dirty: boolean = true;

    constructor() {

    }

}


@System({
    use: [
        Transform3D
    ]
})
export class TransformSystem3D implements SystemLike {


    constructor(private world: World, private timer: Timer) {

    }

    update() {

        const transform_components = this.world.getAllComponentsByType(Transform3D);


        for(let i = 0, l = transform_components.length; i < l; ++i) {

            let t = transform_components[i];

            if(t.dirty) {
                t.world.compose(t.translation, t.orientation, t.scale);
            }
            
        }
        
    }

    postUpdate() {

        const transform_components = this.world.getAllComponentsByType(Transform3D);

        for(let i = 0, l = transform_components.length; i < l; ++i) {
            transform_components[i].dirty = false;
        }

    }


}

