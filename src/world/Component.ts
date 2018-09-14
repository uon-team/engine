

import { Type, CreateMetadataCtor, GetOrDefineMetadata, META_ANNOTATIONS, TypeDecorator, MakeTypeDecorator } from '@uon/core';


export interface ComponentDecorator {
    (meta?: Component): TypeDecorator;
    new(meta: Component): Component
}


/**
 * Defines a component type with it's dependencies
 */
export const Component: ComponentDecorator = MakeTypeDecorator("Component", (meta: Component) => meta);


export interface Component {
    deps?: Type<any>[];
}
