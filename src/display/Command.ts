import { CreateMetadataCtor, GetOrDefineMetadata, META_ANNOTATIONS, META_PROPERTIES } from '@uon/core';
import { DisplayContext } from './DisplayContext';

export interface CommandLike {
    call: (context: DisplayContext) => void;
    compile?: (context: DisplayContext) => void;
    destroy?: (context: DisplayContext) => void;
}

export interface Command {

}



export function Command<T extends Command>(e?: T) {

    const meta_ctor = CreateMetadataCtor((meta: T) => meta);
    if (this instanceof Command) {
        meta_ctor.apply(this, arguments);
        return this;
    }

    return function CommandDecorator<TD extends CommandLike>(target: TD) {


        // get annotations array for this type
        let annotations = GetOrDefineMetadata(META_ANNOTATIONS, target, []);


        // create the metadata
        let meta_instance = new (<any>Command)(e);


        // push the metadata
        annotations.push(meta_instance);


        return target;
    }
}


export class CommandBuffer {

    private _commands: CommandLike[] = [];
    private _compiled: boolean;

    constructor(private context: DisplayContext) {

    }

    add(cmd: CommandLike) {

        this._commands.push(cmd);

        if(typeof cmd.compile === 'function') {
            cmd.compile(this.context);
        }

    }

    remove(cmd: CommandLike) {

        let index = this._commands.indexOf(cmd);

        if(index > -1) {

            // destruct cmd
            if(typeof cmd.destroy === 'function') {
                cmd.destroy(this.context);
            }

            this._commands.splice(index, 1);
        }
    }

    submit() {

        const cmds = this._commands;
        const context = this.context;

        for (let i = 0, l = cmds.length; i < l; ++i) {
            cmds[i].call(context);
        }
    }
}