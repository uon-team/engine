
import { RenderState, DEFAULT_RENDER_STATE, RENDER_STATE_FUNC_MAP } from './RenderState'
import { ShaderProgram } from './Shader';
import { RenderTarget } from './RenderTarget';

const STATE_KEYS = Object.keys(DEFAULT_RENDER_STATE);

/**
 * Interface to set the state of the gl context
 */
export class StateManager {

    // current states
    private _current: RenderState;

    // current program
    private _program: ShaderProgram;

    // current render target
    private _framebuffer: RenderTarget;


    /**
     * @constructs
     * @param _gl 
     */
    constructor(private _gl: WebGL2RenderingContext) {

        this._current = {};

        this.sync();

    }

    /**
     * Set the shader program
     */
    set program(val: ShaderProgram) {

        if (!val || val == this._program) {
            return;
        }

        this._gl.useProgram(val.id);
        this._program = val;

    }

    /**
     * Get the currently set shader program
     */
    get program() {
        return this._program;
    }

    /**
     * Set the framebuffer on which to render, or null for the primary framebuffer 
     */
    set framebuffer(val: RenderTarget) {

        const gl = this._gl;

        let value = val ? val.id : null;
        this._gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, value);

        this._framebuffer = val;

    }

    /**
     * Get the currently set framebuffer
     */
    get framebuffer() {
        return this._framebuffer;
    }


    /**
     * Apply the diffs between a new render state and the previous one
     * @param rs 
     */
    apply(rs: RenderState) {

        const gl = this._gl;
        const curr = this._current as any;
        const next = rs as any;

        let key: string;
        let val: any;
        for (let i = 0, l = STATE_KEYS.length; i < l; ++i) {
            key = STATE_KEYS[i];

            if (next[key] === undefined || curr[key] === next[key]) {
                continue;
            }

            val = next[key];

            let func = RENDER_STATE_FUNC_MAP[key];

            func(gl, val);

            curr[key] = val;

        }

    }



    /**
     * Sync the currently the GL render states
     */
    sync() {

        const GL = this._gl;
        const curr = this._current;

        curr.cullFace = GL.getParameter(GL.CULL_FACE)
        curr.cullFaceMode = GL.getParameter(GL.CULL_FACE_MODE);
        curr.frontFace = GL.getParameter(GL.FRONT_FACE);

        curr.depthTest = GL.getParameter(GL.DEPTH_TEST);
        curr.stencilTest = GL.getParameter(GL.STENCIL_TEST);

        curr.blend = GL.getParameter(GL.BLEND);
        curr.blendEquation = GL.getParameter(GL.BLEND_EQUATION);
        curr.blendFunc = [
            GL.getParameter(GL.BLEND_SRC_RGB),
            GL.getParameter(GL.BLEND_DST_RGB),
            GL.getParameter(GL.BLEND_SRC_ALPHA),
            GL.getParameter(GL.BLEND_DST_ALPHA)
        ];


    }


}