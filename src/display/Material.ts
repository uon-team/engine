import { Type, FindMetadataOfType, CreateMetadataCtor, GetOrDefineMetadata, META_ANNOTATIONS, META_PROPERTIES } from '@uon/core';

import { ShaderDeclaration } from './Shader';


export interface Material {
    imports: Type<any>[];
    state?: Type<any>;
}


export function Material<T extends Material>(e: T) {

    const meta_ctor = CreateMetadataCtor((meta: T) => meta);
    if (this instanceof Material) {
        meta_ctor.apply(this, arguments);
        return this;
    }

    return function MaterialDecorator(target: any) {

         // make sure imports have a ShaderDeclaration attached
         for(let i = 0; i < e.imports.length; ++i) {
            let decl = e.imports[i];
            let sd = FindMetadataOfType(META_ANNOTATIONS, decl, ShaderDeclaration);
            if(!sd) {
                throw new Error(`Material import ${decl.name} must have a ShaderDeclaration decorator`);
            } 
        }


        // get annotations array for this type
        let annotations = GetOrDefineMetadata(META_ANNOTATIONS, target, []);

        // create the metadata
        let meta_instance = new (<any>Material)(e);


        // push the metadata
        annotations.push(meta_instance);


        return target;
    }
}


export interface Uniform {
    name: string;
    type?: any;
}

export function Uniform<T extends Uniform>(e?: T) {

    const meta_ctor = CreateMetadataCtor((meta: T) => meta);
    if (this instanceof Uniform) {
        meta_ctor.apply(this, arguments);
        return this;
    }

    return function UniformDecorator(target: any, key: string) {
        let annotations = GetOrDefineMetadata(META_PROPERTIES, target, {});


        let meta: Uniform = e || { name: key };
        meta.type = Reflect.getMetadata('design:type', target, key);

        // create the metadata with either a provided token or the class type
        let meta_instance = new (<any>Uniform)(meta);

        // push the metadata
        annotations[key] = annotations[key] || [];
        annotations[key].push(meta_instance);

        //return target;
    }
}