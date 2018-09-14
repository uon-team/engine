import { Type, StringUtils, FindMetadataOfType, CreateMetadataCtor, GetOrDefineMetadata, META_ANNOTATIONS, META_PROPERTIES, TypeDecorator, MakeTypeDecorator } from '@uon/core';
import { GL_CONSTANT } from './GLConstant';


export enum ShaderDataType {
    vec4 = GL_CONSTANT.FLOAT_VEC4,
    vec3 = GL_CONSTANT.FLOAT_VEC3,
    vec2 = GL_CONSTANT.FLOAT_VEC2,
    mat4 = GL_CONSTANT.FLOAT_MAT4,
    mat3 = GL_CONSTANT.FLOAT_MAT3,
    mat2 = GL_CONSTANT.FLOAT_MAT2,
    float = GL_CONSTANT.FLOAT,
    int = GL_CONSTANT.INT,
    sampler2D = GL_CONSTANT.SAMPLER_2D,
    sampler2DArray = GL_CONSTANT.SAMPLER_2D_ARRAY

}

export interface UniformInfo {
    name: string;
    type: ShaderDataType;
    location?: WebGLUniformLocation;
}

export interface UniformBlockInfo {
    name: string;
    members: UniformInfo[];
}

export interface VertexInput {
    name: string;
    type: ShaderDataType;
    size?: number;
    location: number;
}

export interface VertexOutput {
    name: string;
    type: ShaderDataType;
}

export interface FragmentOutput {

    name: string;
    type: ShaderDataType;
}


export interface ShaderDeclarationDecorator {
    (meta: ShaderDeclaration): TypeDecorator;
    new(meta: ShaderDeclaration): ShaderDeclaration
}


/**
 * Decorator for defining shader parts
 * @param e 
 */
export const ShaderDeclaration: ShaderDeclarationDecorator = MakeTypeDecorator(
    "ShaderDeclaration",
    (meta: ShaderDeclaration) => meta,
    null,
    (cls: any, meta: ShaderDeclaration) => {

    }
);

export interface ShaderDeclaration {

    deps?: Type<any>[];

    vin?: VertexInput[];
    vout?: VertexOutput[];
    fout?: FragmentOutput[];
    uniform?: (UniformInfo | UniformBlockInfo)[];

    funcs?: any[];

    vs?: string;
    fs?: string;

    vsDefs?: string;
    fsDefs?: string;
}




/**
 * Base class for shaders
 */
export class ShaderBase {

    private _id: WebGLShader;


    /**
     * Creates a new shader
     * @param _gl 
     * @param _type 
     * @param _text 
     */
    constructor(
        protected _gl: WebGL2RenderingContext,
        protected _type: number,
        protected _text: string
    ) {

        // this._hash = StringUtils.hash(_text);
        this._id = _gl.createShader(_type);

        // set shader source
        _gl.shaderSource(this._id, _text);

        // compile shader
        _gl.compileShader(this._id);

        // check compile status
        if (!_gl.getShaderParameter(this._id, _gl.COMPILE_STATUS)) {

            const log_info = _gl.getShaderInfoLog(this._id);
            _gl.deleteShader(this._id);
            this._id = null;
            console.log(_text);
            throw new Error(log_info);
        }


    }

    /**
     * The shader text
     */
    get text() {
        return this._text;
    }

    /**
     * The WebGL name for this shader
     */
    get id() {
        return this._id;
    }

}

/**
 * Vertex shader
 */
export class VertexShader extends ShaderBase {


    constructor(gl: WebGL2RenderingContext, text: string) {
        super(gl, gl.VERTEX_SHADER, text);

    }
}


/**
 * Fragment shader
 */
export class FragmentShader extends ShaderBase {


    constructor(gl: WebGL2RenderingContext, text: string) {
        super(gl, gl.FRAGMENT_SHADER, text);

    }
}


/**
 * A shader program object
 */
export class ShaderProgram {

    private _id: WebGLProgram;

    private _uniforms: UniformInfo[] = [];
    private _vins: VertexInput[] = [];

    /**
     * Creates a shader program with a compiled vertex and fragment shader
     * @param _gl 
     * @param _vs 
     * @param _fs 
     */
    constructor(protected _gl: WebGL2RenderingContext,
        protected _vs: VertexShader,
        protected _fs: FragmentShader) {


        const id = this._id = _gl.createProgram();

        // attach the shaders
        _gl.attachShader(id, _vs.id);
        _gl.attachShader(id, _fs.id);

        // link the program
        _gl.linkProgram(id);

        if (!_gl.getProgramParameter(id, _gl.LINK_STATUS)) {

            const details = _gl.getProgramInfoLog(id);

            _gl.deleteProgram(id);
            this._id = null;

            throw new Error(`Linker exception:  ${details}`);
        }


        // extract attributes
        let attr_count = _gl.getProgramParameter(id, _gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < attr_count; i++) {

            let attr = _gl.getActiveAttrib(id, i);
            let loc = _gl.getAttribLocation(id, attr.name);
            _gl.bindAttribLocation(id, loc, attr.name);

            this._vins.push({
                name: attr.name,
                type: attr.type,
                size: attr.size,
                location: loc
            });
        }


        // extract uniforms
        attr_count = _gl.getProgramParameter(id, _gl.ACTIVE_UNIFORMS);

        for (let i = 0; i < attr_count; i++) {

            let attr = _gl.getActiveUniform(id, i);
            let loc = _gl.getUniformLocation(id, attr.name);
            this._uniforms.push({
                name: attr.name,
                type: attr.type,
                location: loc
            });

        }


    }

    /**
     * The WebGL name for this program
     */
    get id() {
        return this._id;
    }

    /**
     * A list of active uniforms
     */
    get uniforms() {
        return this._uniforms;
    }

    /**
     * A list of active vertex shader inputs (aka attributes in ES 1.0)
     */
    get inputs() {
        return this._vins;
    }


}


