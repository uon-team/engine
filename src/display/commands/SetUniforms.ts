
import { DisplayContext } from '../DisplayContext';
import { SetUniforms} from './Utils';

export class SetUniformsCommand {

    constructor(private source: any) {

    }


    call(context: DisplayContext) {

        // upload source uniforms
        SetUniforms(context.gl, context.states.program, this.source);
    }
}