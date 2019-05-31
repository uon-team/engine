
import { Type, GetMetadata, FindMetadataOfType, META_ANNOTATIONS, META_PROPERTIES } from '@uon/core';
import { DisplayContext } from "../DisplayContext";
import { Material, Uniform } from "../Material";
import { CommandLike } from '../Command';
import { SetUniforms } from './Utils';
import { RenderState } from '../RenderState';
import { ShaderProgram } from '../Shader';


export class SetMaterialCommand implements CommandLike {


    private meta: Material;
    private uniforms: Uniform[];

    //private state: RenderState;
    private program: ShaderProgram;

    constructor(private material: any, private state: RenderState = null) {

        let ctor = material.constructor;
        this.meta = FindMetadataOfType(META_ANNOTATIONS, ctor, Material);

        if (!this.meta) {
            throw new Error(`Class ${ctor.name} must be decorated with Material`);
        }

        // extract uniforms
        this.uniforms = ExtractUniforms(ctor.prototype);

        // extract state
       /* if (this.meta.state) {
            this.state = FindMetadataOfType(META_ANNOTATIONS, this.meta.state, RenderState);

        }*/

    }



    compile(context: DisplayContext) {

        const gl = context.gl;
        const res = context.resources;

        const program = this.program = res.loadMaterial(this.meta);


    }


    call(context: DisplayContext) {

        // apply the state if defined
        if (this.state) {
            context.states.apply(this.state);
        }

        // set the program
        context.states.program = this.program;

        // upload material uniforms
        SetUniforms(context.gl, this.program, this.material);

    }
}

function ExtractUniforms(type: any) {

    let props: any = GetMetadata(META_PROPERTIES, type);

    let result: Uniform[] = [];

    for (let i in props) {

        let metas = props[i];

        for (let j = 0, l = metas.length; j < l; ++j) {

            if (metas[j] instanceof Uniform) {
                result.push(metas[j]);
            }
        }

    }

    return result;

}