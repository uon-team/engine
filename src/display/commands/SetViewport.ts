
import {DisplayContext} from '../DisplayContext';

export class SetViewportCommand {
    

    constructor(public x: number, public y: number, public width: number, public height: number) {

    }

    call(context: DisplayContext) {

        const gl = context.gl;
        gl.viewport(this.x, this.y, this.width, this.height);

    }
}