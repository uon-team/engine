

import { CreateMetadataCtor, GetOrDefineMetadata, META_ANNOTATIONS, Provider, TypeDecorator, MakeTypeDecorator } from '@uon/core';



export interface EntityDecorator {
    (meta?: Entity): TypeDecorator;
    new(meta: Entity): Entity
}


/**
 * Entity decorator defines an entity type
 */
export const Entity: EntityDecorator = MakeTypeDecorator("Entity", (meta: Entity) => meta);



export interface Entity {

    /**
     * Optional type id
     */
    typeId?: string;


    /**
     * Optional list of providers when creating an entity of this type
     */
    providers?: Provider[];
}
