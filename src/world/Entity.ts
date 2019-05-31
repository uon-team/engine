

import { TypeDecorator, MakeTypeDecorator, Type } from '@uon/core';



export interface EntityDecorator {
    (meta: Entity): TypeDecorator;
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
     * The components type to instanciate upon creating the entity
     */
    components: Type<any>[];


}
