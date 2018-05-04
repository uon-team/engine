

import { Type, CreateMetadataCtor, GetOrDefineMetadata, META_ANNOTATIONS } from '@uon/core';



export interface SystemLike {

    update: () => void;
    postUpdate?: () => void;
}


export interface System {
    use: Type<any>[];
}


/**
 * System decorator. Systems are instanciated with DI
 * @param e 
 */
export function System<T extends System>(e: T) {

    const meta_ctor = CreateMetadataCtor((meta: T) => meta);
    if (this instanceof System) {
        meta_ctor.apply(this, arguments);
        return this;
    }

    return function SystemDecorator(target: any) {


        // get annotations array for this type
        let annotations = GetOrDefineMetadata(META_ANNOTATIONS, target, []);


        // create the metadata
        let meta_instance = new (<any>System)(e);


        // push the metadata
        annotations.push(meta_instance);


        return target;
    }
}