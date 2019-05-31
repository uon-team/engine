import { GL_CONSTANT, RequireWebGL2 } from './GLConstant';

export type ImageType = ImageBitmap | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;




/**
 * Enumeration of texture formats
 */
export enum TextureFormat {

    /** 1 component */
    R8 = GL_CONSTANT.R8,
    R16F = GL_CONSTANT.R16F,
    R32F = GL_CONSTANT.R32F,
    D16 = GL_CONSTANT.DEPTH_COMPONENT16,
    D24 = GL_CONSTANT.DEPTH_COMPONENT24,
    D32 = GL_CONSTANT.DEPTH_COMPONENT32F,
    D24S8 = GL_CONSTANT.DEPTH24_STENCIL8,

    /** 2 component */
    RG8 = GL_CONSTANT.RG8,
    RG16F = GL_CONSTANT.RG16F,
    RG32F = GL_CONSTANT.RG32F,

    /** 3 components */
    RGB8 = GL_CONSTANT.RGB,
    RGB16F = GL_CONSTANT.RGB16F,
    RGB32F = GL_CONSTANT.RGB32F,

    /** 4 components */
    RGBA8 = GL_CONSTANT.RGBA8,
    RGBA16F = GL_CONSTANT.RGBA16F,
    RGBA32F = GL_CONSTANT.RGBA32F,


}



/**
 * Texture creation options
 */
export interface TextureCreationOptions {
    width?: number;
    height?: number;
    depth?: number;
    format?: TextureFormat;
    mipmap?: boolean;
    image?: ImageType;
}



/**
 * base class for textures
 */
export class Texture {


    protected _id: WebGLTexture;
    protected _format: TextureFormat;

    constructor(
        protected _gl: WebGLRenderingContext,
        protected _target: number,
        protected _options: TextureCreationOptions
    ) {

        this._id = _gl.createTexture();
        this._format = _options.format;

    }

    get id() {
        return this._id;
    }

    get target() {
        return this._target;
    }

    get format() {
        return this._format;
    }


    release() {
        if(this._id) {
            this._gl.deleteTexture(this._id);
            this._id = null;
        }

    }

}


/**
 * 2D Texture 
 */
export class Texture2D extends Texture {

    private _width: number;
    private _height: number;


    /**
     * Creates a new texture on the gl context
     * @param gl 
     * @param options 
     */
    constructor(gl: WebGLRenderingContext, options: TextureCreationOptions) {
        super(gl, gl.TEXTURE_2D, options);


        this.reallocate(options);

    }

    /**
     * The texture width in pixels
     */
    get width() {
        return this._width;
    }

    /**
     * The texture height in pixels
     */
    get height() {
        return this._height;
    }


    /**
     * Allocate gpu memory, or upload new data
     * @param options 
     */
    reallocate(options: TextureCreationOptions) {

        const gl = this._gl;
        const target = this._target;

        gl.bindTexture(target, this._id);

        // set default texture parameters
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


        // if width, height and format options are defined, we allocate memory 
        if (options.width && options.height && options.format) {

            let format = options.format || this._format;
            let width = options.width || this._width;
            let height = options.height || this._height;

            gl.texImage2D(this._target,
                0,
                format,
                width,
                height,
                0,
                GetBaseFormat(format),
                GetFormatType(format),
                null);

            this._width = width;
            this._height = height;
            this._format = format;

        }
        // if image was passed
        else if (options.image) {

            let image = options.image;

            // set pixel store attributes
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
            gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);

            let format = options.format || TextureFormat.RGBA8;
            // upload the image
            // TODO try and support other image formats
            gl.texImage2D(this._target, 0, format, GetBaseFormat(format), GetFormatType(format), image);


            gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            // save w, h and format
            this._width = image.width;
            this._height = image.height;
            this._format = format;

            if (options.mipmap === true) {
                gl.generateMipmap(this._target);
            }
        }

        // FIXME should be debug only
        else {
           // throw new Error(`Texture2D.reallocate didn't do anything`);
        }
    }

}

/**
 * An array of 2D textures, similar to a 3D texture but 
 * without interpolation between the slices
 */
export class Texture2DArray extends Texture {

    private _width: number;
    private _height: number;
    private _depth: number = 1;


    constructor(gl: WebGLRenderingContext, options: TextureCreationOptions) {
        super(gl, (gl as any).TEXTURE_2D_ARRAY, options);

        RequireWebGL2(gl);

        this.reallocate(options);

    }

    /**
     * The texture width in pixels
     */
    get width() {
        return this._width;
    }

    /**
     * The texture height in pixels
     */
    get height() {
        return this._height;
    }

    /**
     * The texture depth in layers
     */
    get depth() {
        return this._depth;
    }


    /**
     * Allocate gpu memory, or upload new data
     * @param options 
     */
    reallocate(options: TextureCreationOptions) {

        const gl = this._gl as WebGL2RenderingContext;
        const target = this._target;

        gl.bindTexture(target, this._id);

        // set default texture parameters
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


        // if width, height and format options are defined, we allocate memory 
        if (options.width && options.height && options.format) {

            let format = options.format || this._format;
            let width = options.width || this._width;
            let height = options.height || this._height;
            let depth = options.depth || this._depth;

            gl.texImage3D(this._target,
                0,
                format,
                width,
                height,
                depth,
                0,
                GetBaseFormat(format),
                GetFormatType(format),
                null);

            this._width = width;
            this._height = height;
            this._depth = height;
            this._format = format;

        }
        else {
            throw new Error(`Texture2DArray.reallocate didn't do anything`);
        }
    }


}



/**
 * 3D Texture
 * TODO implement Texture3D
 */
export class Texture3D extends Texture {

    private _width: number;
    private _height: number;
    private _depth: number;


    constructor(gl: WebGLRenderingContext, options: TextureCreationOptions) {
        super(gl, (gl as any).TEXTURE_3D, options);

        RequireWebGL2(gl);


    }

}





const FORMAT_BASE: any = {
    /** 1 component */
    R8: GL_CONSTANT.RED,
    R16F: GL_CONSTANT.RED,
    R32F: GL_CONSTANT.RED,
    D16: GL_CONSTANT.DEPTH_COMPONENT,
    D24: GL_CONSTANT.DEPTH_COMPONENT,
    D32: GL_CONSTANT.DEPTH_COMPONENT,
    D24S8: GL_CONSTANT.DEPTH_STENCIL,

    /** 2 component */
    RG8: GL_CONSTANT.RG,
    RG16F: GL_CONSTANT.RG,
    RG32F: GL_CONSTANT.RG,

    /** 3 components */
    RGB8: GL_CONSTANT.RGB,
    RGB16F: GL_CONSTANT.RGB,
    RGB32F: GL_CONSTANT.RGB,

    /** 4 components */
    RGBA8: GL_CONSTANT.RGBA,
    RGBA16F: GL_CONSTANT.RGBA,
    RGBA32F: GL_CONSTANT.RGBA,

}

const FORMAT_TYPE: any = {

    /** 1 component */
    R8: GL_CONSTANT.UNSIGNED_BYTE,
    R16F: GL_CONSTANT.HALF_FLOAT,
    R32F: GL_CONSTANT.FLOAT,
    D16: GL_CONSTANT.UNSIGNED_SHORT,
    D24: GL_CONSTANT.UNSIGNED_INT,
    D32: GL_CONSTANT.FLOAT,
    D24S8: GL_CONSTANT.UNSIGNED_INT_24_8,

    /** 2 component */
    RG8: GL_CONSTANT.UNSIGNED_BYTE,
    RG16F: GL_CONSTANT.HALF_FLOAT,
    RG32F: GL_CONSTANT.FLOAT,

    /** 3 components */
    RGB8: GL_CONSTANT.UNSIGNED_BYTE,
    RGB16F: GL_CONSTANT.HALF_FLOAT,
    RGB32F: GL_CONSTANT.FLOAT,

    /** 4 components */
    RGBA8: GL_CONSTANT.UNSIGNED_BYTE,
    RGBA16F: GL_CONSTANT.HALF_FLOAT,
    RGBA32F: GL_CONSTANT.FLOAT,

}


/**
 * Gets the underlying type for a texture format
 * @private
 * @param format 
 */
function GetFormatType(format: number): number {

    let name = TextureFormat[format];

    return FORMAT_TYPE[name];

}

/**
 * Get the gl base format (component count) from a texture format
 * @param format 
 */
function GetBaseFormat(format: number): number {

    let name = TextureFormat[format];

    return FORMAT_BASE[name];
}