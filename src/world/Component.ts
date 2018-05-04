

import { Type, CreateMetadataCtor, GetOrDefineMetadata, META_ANNOTATIONS } from '@uon/core';

export interface Component {
    deps?: Type<any>[];
}

export function Component<T extends Component>(e?: T) {

    const meta_ctor = CreateMetadataCtor((meta: T) => meta);
    if (this instanceof Component) {
        meta_ctor.apply(this, arguments);
        return this;
    }

    return function ComponentDecorator(target: any) {


        // get annotations array for this type
        let annotations = GetOrDefineMetadata(META_ANNOTATIONS, target, []);


        // create the metadata
        let meta_instance = new (<any>Component)(e);


        // push the metadata
        annotations.push(meta_instance);


        return target;
    }
}