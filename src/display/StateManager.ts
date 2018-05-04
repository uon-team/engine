
import { RenderState, DEFAULT_RENDER_STATE, RENDER_STATE_FUNC_MAP } from './RenderState'
import { ShaderProgram } from './Shader';
import { RenderTarget } from './RenderTarget';





export class StateManager {

    private _current: RenderState;
    private _stateKeys: string[];
    private _toggles: string[] = [];



    // current program
    private _program: ShaderProgram;

    // current render target
    private _framebuffer: RenderTarget;



    constructor(private _gl: WebGL2RenderingContext) {

        this._current = {};

        this._stateKeys = Object.keys(DEFAULT_RENDER_STATE);


        this.sync();

    }

    set program(val: ShaderProgram) {

        if (!val || val == this._program) {
            return;
        }

        this._gl.useProgram(val.id);
        this._program = val;

    }

    get program() {
        return this._program;
    }

    set framebuffer(val: RenderTarget) {

        const gl = this._gl;

        let value = val ? val.id : null;
        this._gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, value);

        this._framebuffer = val;

    }

    get framebuffer() {
        return this._framebuffer;
    }


    apply(rs: RenderState) {

        const gl = this._gl;
        const curr = this._current as any;
        const next = rs as any;

        let key: string;
        let val: any;
        for (let i = 0, l = this._stateKeys.length; i < l; ++i) {
            key = this._stateKeys[i];

            if (next[key] === undefined || curr[key] === next[key]) {
                continue;
            }

            val = next[key];

            let func = RENDER_STATE_FUNC_MAP[key];

            func(gl, val);

            curr[key] = val;

        }

    }



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