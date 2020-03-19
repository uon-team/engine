import { GL_CONSTANT, RequireWebGL2 } from './GLConstant';


export enum BufferUsage {
    StaticDraw = GL_CONSTANT.STATIC_DRAW,
    StaticRead = GL_CONSTANT.STATIC_READ,
    StaticCopy = GL_CONSTANT.STATIC_COPY,

    DynamicDraw = GL_CONSTANT.DYNAMIC_DRAW,
    DynamicRead = GL_CONSTANT.DYNAMIC_READ,
    DynamicCopy = GL_CONSTANT.DYNAMIC_COPY,

    StreamDraw = GL_CONSTANT.STREAM_DRAW,
    StreamRead = GL_CONSTANT.STREAM_READ,
    StreamCopy = GL_CONSTANT.STREAM_COPY
}



/**
 * Base class for buffers
 */
export class Buffer {

    protected _id: WebGLBuffer;
    constructor(
        protected _gl: WebGLRenderingContext,
        protected _target: number,
        protected _usage: BufferUsage) {

        this._id = _gl.createBuffer();
    }

    /**
     * The WebGL name for this buffer
     */
    get id() {
        return this._id;
    }

    /**
     * The buffer target (aray, elements, uniform)
     */
    get target() {
        return this._target;
    }


    /**
     * Delete the buffer on the gpu
     */
    release() {
        if(this._id) {
            this._gl.deleteBuffer(this._id);
            this._id = null;
        }
    }
}



/**
 * Index buffer
 */
export class IndexBuffer extends Buffer {

    private _count: number = 0;


    /**
     * Creates a new buffer on the gpu for storing indices
     * @param gl 
     * @param usage 
     */
    constructor(gl: WebGLRenderingContext, usage: BufferUsage = BufferUsage.StaticDraw) {
        super(gl, gl.ELEMENT_ARRAY_BUFFER, usage);

    }


    /**
     * The number of indices in the buffer
     */
    get count() {
        return this._count;
    }


    /**
     * Uploads index data into the buffer
     * @param data 
     */
    update(data: Uint16Array) {

        const gl = this._gl;

        gl.bindBuffer(this._target, this._id);

        gl.bufferData(this._target, data, this._usage);

        gl.bindBuffer(this._target, null);

        this._count = data.length;

    }
}


export interface VertexLayoutElement {
    name?: string;
    count: number;
    type?: number;
    offset?: number;
    location?: number;
}

/**
 * Supports only float elements
 */
export class VertexLayout {

    // the stride in bytes
    readonly stride: number;

    constructor(readonly elements: VertexLayoutElement[]) {

        let stride = 0
        elements.forEach((el) => {

            el.offset = stride;
            stride += el.count * 4; // count * sizeof(float)
        });

        this.stride = stride;

    }
}

/**
 * Vertex buffer
 */
export class VertexBuffer extends Buffer {

    // the number of vertices in the buffer
    private _count: number = 0;

    // the vertex layout
    private _layout: VertexLayout;


    /**
     * Creates a new GL buffer fro storing vertex data
     * @param gl 
     * @param usage 
     */
    constructor(gl: WebGLRenderingContext, usage: BufferUsage = BufferUsage.StaticDraw) {
        super(gl, gl.ARRAY_BUFFER, usage);


    }

    /**
     * The number of vertices in the buffer
     */
    get count() {
        return this._count;
    }

    /**
     * The vertex stride in bytes
     */
    get stride() {
        return this._layout.stride;
    }

    /**
     * The layout for each vertex
     */
    get layout() {
        return this._layout;
    }


    /**
     * Uploads a buffer to the gpu
     * @param data 
     * @param layout 
     */
    update(data: Float32Array, layout: VertexLayout) {


        this._layout = layout;

        const gl = this._gl;

        // update the buffer
        gl.bindBuffer(this._target, this._id);
        gl.bufferData(this._target, data, this._usage);
        gl.bindBuffer(this._target, null);

        
        this._layout = layout;
        this._count = data.byteLength / layout.stride;
    }
}


/**
 * Uniform buffer
 */
export class UniformBuffer extends Buffer {


    /**
     * Creates a new buffer on the gpu for storing uniform data
     * @param gl 
     * @param usage 
     */
    constructor(gl: WebGL2RenderingContext, usage: BufferUsage = BufferUsage.DynamicDraw) {

        RequireWebGL2(gl);

        super(gl, gl.UNIFORM_BUFFER, usage);

    }

}