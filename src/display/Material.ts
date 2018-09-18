import { Type, FindMetadataOfType, META_ANNOTATIONS, TypeDecorator, MakeTypeDecorator, MakePropertyDecorator, GetMetadata } from '@uon/core';

import { ShaderDeclaration } from './Shader';


export interface MaterialDecorator {
    (meta: Material): TypeDecorator;
    new(meta: Material): Material
}

/**
 * Type decorator for materials
 */
export const Material: MaterialDecorator = MakeTypeDecorator("Material", (meta: Material) => meta, null, (cls: any, meta: Material) => {

    // make sure imports have a ShaderDeclaration attached
    for (let i = 0; i < meta.imports.length; ++i) {
        let decl = meta.imports[i];
        let sd = FindMetadataOfType(META_ANNOTATIONS, decl, ShaderDeclaration);
        if (!sd) {
            throw new Error(`Material import ${decl.name} must have a ShaderDeclaration decorator`);
        }
    }
});


export interface Material {
    imports: Type<any>[];
    state?: Type<any>;
}




export interface UniformDecorator {
    (meta?: Uniform): PropertyDecorator;
    new(meta: Uniform): Uniform
}


export const Uniform: UniformDecorator = MakePropertyDecorator("Uniform", (meta: Uniform) => meta, null, (cls: any, meta: Uniform, key: any) => {

    meta = meta || { name: key };
    meta.type = GetMetadata('design:type', cls, key);

});

export interface Uniform {
    name: string;
    type?: any;
}