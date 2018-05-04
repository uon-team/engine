

import { CreateMetadataCtor, GetOrDefineMetadata, META_ANNOTATIONS, Provider } from '@uon/core';

export interface Entity {

    // an optional type id
    typeId?: string;

    providers: Provider[];
}

export function Entity<T extends Entity>(e?: T) {

    const meta_ctor = CreateMetadataCtor((meta: T) => meta);
    if (this instanceof Entity) {
        meta_ctor.apply(this, arguments);
        return this;
    }

    return function EntityDecorator(target: any) {


        // get annotations array for this type
        let annotations = GetOrDefineMetadata(META_ANNOTATIONS, target, []);


        // create the metadata with either a privided token or the class type
        let meta_instance = new (<any>Entity)(e);


        // push the metadata
        annotations.push(meta_instance);


        return target;
    }
}