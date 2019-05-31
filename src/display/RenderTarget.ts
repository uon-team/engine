import { TextureFormat, Texture2D, Texture2DArray, TextureCreationOptions } from "./Texture";




export interface RenderTargetCreationOptions {

    // width of the texture(s) to create
    width: number;

    // height of the texture(s) to create
    height: number;

    // the color format
    format?: TextureFormat;

    // the depth texture format for a depth attachment
    // will only create a depth attachment if specified
    depthFormat?: TextureFormat;
}

/**
 * Base class for render targets
 */
export class RenderTarget {

    protected _fbo: WebGLFramebuffer;

    constructor(
        protected _gl: WebGLRenderingContext,
        protected _target: number
    ) {

        this._fbo = _gl.createFramebuffer();
    }


    get id() {
        return this._fbo;
    }

    get target() {
        return this._target;
    }

    release() {

        this._gl.deleteFramebuffer(this._fbo);
        this._fbo = null;
    }

}


/**
 * A 2D render target with a single color and/or depth attachment
 */
export class RenderTarget2D extends RenderTarget {

    private _color: Texture2D;
    private _depth: Texture2D;


    constructor(gl: WebGLRenderingContext, options: RenderTargetCreationOptions) {
        super(gl, (gl as any).DRAW_FRAMEBUFFER || gl.FRAMEBUFFER);

        gl.bindFramebuffer(this._target, this._fbo);

        if (options.format) {


            let color_options: TextureCreationOptions = {

                width: options.width,
                height: options.height,
                format: options.format
            };

            // create the color texture
            this._color = new Texture2D(gl, color_options);

            // attach
            gl.framebufferTexture2D(this._target, gl.COLOR_ATTACHMENT0, this._color.target, this._color.id, 0);


        }


        // Create the depth attachment
        let depth_format = options.depthFormat;
        if (depth_format) {

            let depth_options: TextureCreationOptions = {

                width: options.width,
                height: options.height,
                format: depth_format
            };

            // create the depth texture
            this._depth = new Texture2D(gl, depth_options);

            // attach to fbo
            gl.framebufferTexture2D(this._target,
                depth_format == TextureFormat.D24S8 ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT,
                gl.TEXTURE_2D,
                this._depth.id,
                0);

        }


        let status = gl.checkFramebufferStatus(this._target);
        if (status != gl.FRAMEBUFFER_COMPLETE) {
            throw new Error(`Error creating framebuffer: ${status.toString(16)}`);
        }


        gl.bindFramebuffer(this._target, null);


    }


    /**
     * Access to the color textxure
     */
    get color() {

        return this._color;
    }


    /**
     * Access to the depth texture
     */
    get depth() {
        return this._depth;
    }


    /**
     * Delete the FBO and associated textures
     */
    release() {

        super.release();

        if (this._color) {
            this._color.release();
            this._color = null;
        }

        if (this._depth) {
            this._depth.release();
            this._depth = null;
        }

    }

}



/**
 * A render target with multiple attachements
 */
export class MultipleRenderTarget2D extends RenderTarget {

    private _textures: Texture2D[];
    private _depth: Texture2D;

    constructor(gl: WebGLRenderingContext, textures: Texture2D[], depthFormat?: TextureFormat) {
        super(gl, (gl as any).DRAW_FRAMEBUFFER || gl.FRAMEBUFFER);


        if(textures.length < 2) {
            throw new Error(`Expected textures.length >= 2, got ${textures.length}`);
        }

        this._textures = textures.slice(0);
        let width = Number.MAX_VALUE;
        let height = Number.MAX_VALUE;

        gl.bindFramebuffer(this._target, this._fbo);

        // TODO require all textures to be the same size?

        for(let i = 0; i < textures.length; ++i) {

            let tex = textures[i];
            width = Math.min(tex.width, width);
            height = Math.min(tex.height, height);

            // attach
            gl.framebufferTexture2D(this._target, gl.COLOR_ATTACHMENT0 + i, tex.target, tex.id, 0);
        }


        if (depthFormat) {

            let depth_options: TextureCreationOptions = {

                width: width,
                height: height,
                format: depthFormat
            };

            // create the depth texture
            this._depth = new Texture2D(gl, depth_options);

            // attach to fbo
            gl.framebufferTexture2D(this._target,
                depthFormat == TextureFormat.D24S8 ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT,
                gl.TEXTURE_2D,
                this._depth.id,
                0);

        }


        gl.bindFramebuffer(this._target, null);

    }

    /**
     * Access to a color textxure by index
     */
    getTexture(index: number) {
        return this._textures[index];
    }


    /**
     * Access to the color texture array
     */
    get textures() {
        return this._textures;
    }

    /**
     * Access to the depth texture
     */
    get depth() {
        return this._depth;
    }

    /**
     * Delete the FBO and associated textures
     */
    release() {

        super.release();

        if (this._depth) {
            this._depth.release();
            this._depth = null;
        }

        this._textures.length  = 0;

    }

}