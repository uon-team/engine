

import { Type, FindMetadataOfType, META_ANNOTATIONS, ObjectUtils, TypeDecorator, MakeTypeDecorator } from '@uon/core';

import { GL_CONSTANT } from './GLConstant';


export interface RenderStateDecorator {
    (meta: RenderState): TypeDecorator;
    new(meta: RenderState): RenderState
}




export const DEFAULT_RENDER_STATE: RenderState = {
    cullFace: true,
    cullFaceMode: GL_CONSTANT.BACK,
    frontFace: GL_CONSTANT.CW,
    depthTest: true,
    depthFunc: GL_CONSTANT.LEQUAL,
    depthMask: true,
    stencilTest: false,
    stencilMask: 0x00,
    stencilOp: [GL_CONSTANT.KEEP, GL_CONSTANT.KEEP, GL_CONSTANT.REPLACE],
    stencilFunc: [GL_CONSTANT.ALWAYS, 1, 0xff],
    colorMask: [true, true, true, true],
    blend: true,
    blendEquation: GL_CONSTANT.FUNC_ADD,
    blendFunc: [GL_CONSTANT.SRC_ALPHA, GL_CONSTANT.ONE_MINUS_SRC_ALPHA, GL_CONSTANT.SRC_ALPHA, GL_CONSTANT.ONE],
    lineWidth: 1.0,

};




/**
 * 
 */
export const RENDER_STATE_FUNC_MAP: any = {
    cullFace: BOOLEAN_OP(GL_CONSTANT.CULL_FACE),
    depthTest: BOOLEAN_OP(GL_CONSTANT.DEPTH_TEST),
    depthFunc: (gl: WebGLRenderingContext, val: number) => { gl.depthFunc(val); },
    depthMask: (gl: WebGLRenderingContext, val: boolean) => { gl.depthMask(val); },
    stencilTest: BOOLEAN_OP(GL_CONSTANT.STENCIL_TEST),
    stencilMask: (gl: WebGLRenderingContext, val: number) => { gl.stencilMask(val); },
    stencilOp: (gl: WebGLRenderingContext, val: number[]) => { gl.stencilOp(val[0], val[1], val[2]); },
    stencilFunc: (gl: WebGLRenderingContext, val: number[]) => { gl.stencilFunc(val[0], val[1], val[2]); },
    colorMask: (gl: WebGLRenderingContext, val: boolean[]) => { gl.colorMask(val[0], val[1], val[2], val[3]); },
    blend: BOOLEAN_OP(GL_CONSTANT.BLEND),
    cullFaceMode: (gl: WebGLRenderingContext, val: number) => { gl.cullFace(val); },
    frontFace: (gl: WebGLRenderingContext, val: number) => { gl.frontFace(val); },
    blendEquation: (gl: WebGLRenderingContext, val: number) => { gl.blendEquation(val); },
    blendFunc: (gl: WebGLRenderingContext, val: number[]) => { gl.blendFuncSeparate.apply(gl, val); },
    lineWidth: (gl: WebGLRenderingContext, val: number) => { gl.lineWidth(val); },

};

export const RenderState: RenderStateDecorator = MakeTypeDecorator("RenderState", (meta: RenderState) => meta, null, (cls: any, meta: RenderState) => {

    let config_default = {};
    if (meta.inherits) {

        let parent_state: RenderState = FindMetadataOfType(META_ANNOTATIONS, meta.inherits, RenderState);

        if (!parent_state) {
            throw new Error(`RenderState: inherits was defined 
            with ${meta.inherits.name} but doesn't have 
            RenderState metadata attached`);
        }

        config_default = parent_state;
    }

    // merge base config with the one provided
    let merged_config = ObjectUtils.extend({}, config_default, meta);

    ObjectUtils.extend(meta, merged_config);

});

export interface RenderState {
    inherits?: Type<any>,

    cullFace?: boolean;
    cullFaceMode?: number;
    frontFace?: number;

    depthTest?: boolean;
    depthFunc?: number;
    depthMask?: boolean;

    stencilTest?: boolean;
    stencilMask?: number;
    stencilOp?: number[];
    stencilFunc?: number[];

    colorMask?: boolean[];

    blend?: boolean;
    blendEquation?: number;
    blendFunc?: number[];
    //blendFuncSeparate?: number[];

    lineWidth?: number;


}


/**
 * @private
 * @param flag 
 */
function BOOLEAN_OP(flag: number) {


    return function (gl: WebGLRenderingContext, val: boolean) {
        if (val === true) {
            gl.enable(flag);
        }
        else {
            gl.disable(flag);
        }
    }

}
