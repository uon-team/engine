
import { DisplayContext } from '../DisplayContext';
import { Color } from '../../Color';
import { GL_CONSTANT } from '../GLConstant';

export class ClearCommand {


    constructor(public color: Color = new Color(), 
        public mask: number = GL_CONSTANT.COLOR_BUFFER_BIT | GL_CONSTANT.DEPTH_BUFFER_BIT | GL_CONSTANT.STENCIL_BUFFER_BIT) {

    }

    call(context: DisplayContext) {

        const gl = context.gl;
        const color = this.color;
        gl.clearColor(color.r, color.g, color.b, color.a);
        gl.clear(this.mask);

    }
}