

import { Type, CreateMetadataCtor, FindMetadataOfType, GetOrDefineMetadata, GetMetadata, META_ANNOTATIONS, ObjectUtils } from '@uon/core';

import { GL_CONSTANT } from './GLConstant';


export interface RenderState {
    inherits?: Type<any>,

    cullFace?: boolean;
    cullFaceMode?: number;
    frontFace?: number;

    depthTest?: boolean;

    stencilTest?: boolean;

    blend?: boolean;
    blendEquation?: number;
    blendFunc?: number[];
    //blendFuncSeparate?: number[];

    lineWidth?: number;


}

export const DEFAULT_RENDER_STATE: RenderState = {
    cullFace: true,
    cullFaceMode: GL_CONSTANT.BACK,
    frontFace: GL_CONSTANT.CW,
    depthTest: true,
    stencilTest: false,
    blend: true,
    blendEquation: GL_CONSTANT.FUNC_ADD,
    blendFunc: [GL_CONSTANT.SRC_ALPHA, GL_CONSTANT.ONE_MINUS_SRC_ALPHA, GL_CONSTANT.SRC_ALPHA, GL_CONSTANT.ONE],
    lineWidth: 1.0,

};


function BOOLEAN_OP(flag: number) {


    return function(gl: WebGLRenderingContext, val: boolean) {
        if(val === true) {
            gl.enable(flag);
        }
        else {
            gl.disable(flag);
        }
    }
    
}

export const RENDER_STATE_FUNC_MAP: any = {
    cullFace: BOOLEAN_OP(GL_CONSTANT.CULL_FACE),
    depthTest: BOOLEAN_OP(GL_CONSTANT.DEPTH_TEST),
    stencilTest: BOOLEAN_OP(GL_CONSTANT.STENCIL_TEST),
    blend: BOOLEAN_OP(GL_CONSTANT.BLEND),
    cullFaceMode: (gl: WebGLRenderingContext, val: number) => { gl.cullFace(val); },
    frontFace: (gl: WebGLRenderingContext, val: number) => { gl.frontFace(val); },
    blendEquation: (gl: WebGLRenderingContext, val: number) => { gl.blendEquation(val); },
    blendFunc: (gl: WebGLRenderingContext, val: number[]) => { gl.blendFuncSeparate.apply(gl, val); },
    lineWidth: (gl: WebGLRenderingContext, val: number) => { gl.lineWidth(val); },

};


export function RenderState<T extends RenderState>(e: T) {

    const meta_ctor = CreateMetadataCtor((meta: T) => meta);
    if (this instanceof RenderState) {
        meta_ctor.apply(this, arguments);
        return this;
    }

    return function RenderStateDecorator(target: any) {

        let config_default = {};
        if (e.inherits) {

            let parent_state: RenderState = FindMetadataOfType(META_ANNOTATIONS, e.inherits, RenderState);

            if (!parent_state) {
                throw new Error(`RenderState: inherits was defined 
                with ${e.inherits.name} but doesn't have 
                RenderState metadata attached`);
            }


            config_default = parent_state;
        }



        // get annotations array for this type
        let annotations = GetOrDefineMetadata(META_ANNOTATIONS, target, []);


        // merge base config with the one provided
        let merged_config = ObjectUtils.extend({}, config_default, e);

        // create the metadata
        let meta_instance = new (<any>RenderState)(merged_config);


        // push the metadata
        annotations.push(meta_instance);


        return target;
    }
}
