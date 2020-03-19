
import { DisplayContext } from '../DisplayContext';
import { Color } from '@uon/math';
import { GL_CONSTANT } from '../GLConstant';

export class ClearCommand {

    static readonly COLOR = GL_CONSTANT.COLOR_BUFFER_BIT;
    static readonly DEPTH = GL_CONSTANT.DEPTH_BUFFER_BIT;
    static readonly STENCIL = GL_CONSTANT.STENCIL_BUFFER_BIT;

    public stencil: number = 0;
    public depth: number = 1.0;

    constructor(public color: Color = new Color(), 
        public mask: number = GL_CONSTANT.COLOR_BUFFER_BIT | GL_CONSTANT.DEPTH_BUFFER_BIT | GL_CONSTANT.STENCIL_BUFFER_BIT) {

    }

    call(context: DisplayContext) {

        const gl = context.gl;
        const color = this.color;
        gl.clearColor(color.r, color.g, color.b, color.a);
        gl.clearStencil(this.stencil);
        gl.clearDepth(this.depth);
        gl.clear(this.mask);

    }
}