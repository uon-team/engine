import { Type, Injector, Provider, FindMetadataOfType, META_ANNOTATIONS } from '@uon/core';


import { System, SystemLike } from './System';
import { Timer } from '../utils/Timer';
import { Entity } from './Entity';

interface EntityInstance<T> {
    id: number;
    instance: T;
}

/**
 * The main interface for this ECS implementation
 */
export class World {

    private _injector: Injector;
    private _entities: EntityInstance<any>[] = [];


    private _systems: SystemLike[] = [];
    private _systemMeta = new Map<Type<any>, System>();

    private _entityComponents: any[][] = [];
    private _freeIds: number[] = [];

    private _componentsByType = new Map<Type<any>, any[]>();
    private _componentsBySystem = new Map<Type<any>, Map<number, any[]>>();

    private _timer: Timer;

    /**
     * Creates a new world
     * @param systems 
     */
    constructor(systems: Type<SystemLike>[], extraProviders: Provider[] = []) {

        this._timer = new Timer();
        this._timer.start();

        let providers: Provider[] = [
            {
                token: World,
                value: this
            },
            {
                token: Timer,
                value: this._timer
            }
        ];

        providers = providers.concat(extraProviders);
        providers = providers.concat(systems);

        // create the injector for system instanciation
        this._injector = Injector.Create(providers, null);

        // instanciate systems right away
        for (let i = 0; i < systems.length; ++i) {

            // find system meta data
            let meta = FindMetadataOfType(META_ANNOTATIONS, systems[i], System);

            if (!meta) {
                throw new Error(`Provided system ${systems[i].name} must have a System decorator.`);
            }

            // create the system
            let sys: SystemLike = this._injector.get(systems[i]);

            // add to systems list
            this._systems.push(sys);

            // map type to meta for faster access
            this._systemMeta.set(systems[i], meta);

            // create a map to retreive components by system
            this._componentsBySystem.set(systems[i], new Map());
        }


    }


    /**
     * Access to the main timer 
     */
    get timer() {
        return this._timer;
    }

    /**
     * Access to the World root injector
     */
    get injector() {
        return this._injector;
    }

    /**
     * Get a system instance by type
     * @param type 
     */
    getSystem<T>(type: Type<T>): T {
        return this._injector.get(type);
    }


    /**
     * Create an entity and it's component storage
     */
    createEntity<T>(type: Type<T>): T {

        // find system meta data
        let meta = FindMetadataOfType(META_ANNOTATIONS, type, Entity);

        if (!meta) {
            throw new Error(`Provided entity type ${type.name} must have an Entity decorator.`);
        }

        let new_id = -1;
        let index = 0;
        let version = 0;

        if (this._freeIds.length) {
            new_id = this._freeIds.shift();

            index = new_id >> 8;
            version = (new_id & ((1 << 8) - 1)) + 1;
            version = version > 255 ? 0 : version; // wrap around
        }
        else {
            index = this._entityComponents.length;
            version++;
        }

        new_id = (index << 8) | version;
        this._entityComponents[index] = [];

        let providers: Provider[] = [];

        let injector: Injector;
        meta.components.forEach((t) => {
            providers.push({
                token: t,
                factory: () => {
                    return this.addComponent(new_id, t, injector);
                }
            });
        });

        injector = Injector.Create(providers, this._injector);
        let instance = injector.instanciate(type);

        this._entities[index] = {
            id: new_id,
            instance
        };

        return instance;
    }


    /**
     * Destroy an entity and all of it's components
     * @param id 
     */
    destroyEntity(id: number) {

        let index = id >> 8;
        let version = (id & ((1 << 8) - 1));

        let current = this._entities[index];
        // make sure version is correct
        if (!current || (current && current.id !== id)) {
            console.warn(`Entity at location ${index} no longer exists.
                version provided ${version}, expected ${current.id & ((1 << 8) - 1)}`)
            return;
        }

        let comps = this._entityComponents[index];
        if (comps) {

            for (let i = 0; i < comps.length; ++i) {

                this.removeFromComponent(comps[i].constructor, comps[i]);
            }

            this.removeFromSytems(id);

            this._entityComponents[index] = null;
            this._entities[index] = null;
            this._freeIds.push(id);


        }

    }

    /**
     * Get all components attached to an entity
     * @param id 
     */
    getEntityComponents(id: number) {

        let index = id >> 8;
        let version = (id & ((1 << 8) - 1));
        let current = this._entities[index];
        // make sure version is correct
        if (!current || (current && current.id !== id)) {
            console.warn(`Entity at location ${index} no longer exists.
                version provided ${version}, expected ${current.id & ((1 << 8) - 1)}`)
            return;
        }

        return this._entityComponents[index];
    }


    /**
     * Instanciate and add a component to an entity
     * @param entityId 
     * @param type 
     */
    addComponent<T>(entityId: number, type: Type<T>, injector?: Injector): T {

        let index = entityId >> 8;
        let version = (entityId & ((1 << 8) - 1));

        /*let current = this._entities[index];
        // make sure version is correct
        if (!current || (current && current.id !== entityId)) {
            console.warn(`Entity at location ${index} no longer exists.
                version provided ${version}, expected ${current.id & ((1 << 8) - 1)}`)
            return null;
        }*/

        let comps = this._entityComponents[index];

        if (!comps) {
            throw new Error(`Entity with id ${entityId} does not exist.`);
        }


        for (let i = 0; i < comps.length; ++i) {

            if (comps[i] instanceof type) {
                throw new Error(`Entity already has a component of type ${type.name}.`);
            }
        }

        let comp = injector ? injector.instanciate(type) : new (type as any)();
        comps.push(comp);
        this.addToComponents(type, comp);

        this.updateSystemInterests(entityId, comps);


        return comp as T;
    }

    /**
     * remove a component from an entity
     * @param entityId 
     * @param type 
     */
    removeComponent(entityId: number, type: Type<any>) {

        let index = entityId >> 8;
        let version = (entityId & ((1 << 8) - 1));

        let current = this._entities[index];
        // make sure version is correct
        if (!current || (current && current.id !== entityId)) {
            console.warn(`Entity at location ${index} no longer exists.
                version provided ${version}, expected ${current.id & ((1 << 8) - 1)}`)
            return;
        }

        let comps = this._entityComponents[index];

        if (comps) {

            for (let i = 0; i < comps.length; ++i) {

                if (comps[i] instanceof type) {
                    this.removeFromComponent(type, comps[i]);

                    comps.splice(i, 1);
                    break;
                }
            }

            this.updateSystemInterests(entityId, comps);

        }
    }

    /**
     * Get all components of type
     * @param type 
     */
    getAllComponentsByType<T>(type: Type<T>): T[] {

        return this._componentsByType.get(type);
    }


    /**
     * Get a list of components arranged by entity for a given system
     * @param type 
     */
    getEntitiesForSystem(type: Type<any>) {

        return this._componentsBySystem.get(type);

    }



    /**
     * Updates the main timer and all systems
     */
    update() {

        // update the timer
        this._timer.update();

        // update all systems
        for (let i = 0; i < this._systems.length; ++i) {

            this._systems[i].update();
        }


        // post update all systems
        for (let i = 0; i < this._systems.length; ++i) {

            if (this._systems[i].postUpdate) {
                this._systems[i].postUpdate();
            }

        }

    }


    /**
     * Add a component instance to it's list
     * @private
     * @param type 
     * @param comp 
     */
    private addToComponents(type: Type<any>, comp: any) {

        let comps = this._componentsByType.get(type);

        if (!comps) {
            comps = [];
            this._componentsByType.set(type, comps);
        }

        comps.push(comp);

    }

    /**
     * remove a component from it's list
     * @param type 
     * @param comp 
     */
    private removeFromComponent(type: Type<any>, comp: any) {

        let comps = this._componentsByType.get(type);

        if (comps) {

            for (let i = 0; i < comps.length; ++i) {

                if (comps[i] === comp) {
                    comps.splice(i, 1);
                    break;
                }
            }

        }
    }


    private removeFromSytems(id: number) {
        for (let [type, meta] of this._systemMeta) {
            let entity_comp_map = this._componentsBySystem.get(type);

            entity_comp_map.delete(id);
        }
    }

    private updateSystemInterests(id: number, components: any[]) {

        let ctypes = components.map(c => c.constructor);

        for (let [type, meta] of this._systemMeta) {

            let entity_comp_map = this._componentsBySystem.get(type);

            let comp_map = entity_comp_map.get(id);

            // matches interest
            if (this.matchComponentTypes(ctypes, meta.use)) {

                if (!comp_map) {
                    comp_map = components
                        .filter(t => meta.use.indexOf(t.constructor) > - 1)
                        .sort((a, b) => {
                            return meta.use.indexOf(a.constructor) - meta.use.indexOf(b.constructor);
                        });
                    console.log(`added to system ${type.name}`, id, comp_map);
                    entity_comp_map.set(id, comp_map);
                }

            }
            // doesnt match
            else {

                // if it was set, remove it
                if (comp_map) {

                    console.log(`removed from system ${type.name}`, id, comp_map);
                    entity_comp_map.delete(id);

                }
            }


        }

    }

    private matchComponentTypes(list: any[], mustContain: any[]) {

        let count = mustContain.length;
        let match = 0;

        for (let i = 0, l = list.length; i < l; ++i) {
            if (mustContain.indexOf(list[i]) > -1) {
                match++;
            }
        }

        return match === count;
    }

}

