import { CreateMetadataCtor, GetOrDefineMetadata, META_ANNOTATIONS, META_PROPERTIES } from '@uon/core';
import { DisplayContext } from './DisplayContext';

export interface CommandLike {
    call: (context: DisplayContext) => void;
    compile?: (context: DisplayContext) => void;
    destroy?: (context: DisplayContext) => void;
}

export interface CommandBufferOptimizeOptions {
    
    /**
     * Wheter to sort draw calls by materials
     */
    sortByMaterial?: boolean;


}

/**
 * Use the command buffer to submit graphic command to the display context
 */
export class CommandBuffer {

    private _commands: CommandLike[] = [];
    private _compiled: boolean;

    constructor(private context: DisplayContext) {

    }

    /**
     * Push a command onto the command buffer and compile it if necessary
     * @param cmd 
     */
    add(cmd: CommandLike) {

        this._commands.push(cmd);

        if(typeof cmd.compile === 'function') {
            cmd.compile(this.context);
        }

    }

    /**
     * Removes a command from the command buffer and destroy it if necessary
     * @param cmd 
     */
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

    /**
     * Submit the command buffer to the context
     */
    submit() {

        const cmds = this._commands;
        const context = this.context;

        for (let i = 0, l = cmds.length; i < l; ++i) {
            cmds[i].call(context);
        }
    }

    /**
     * TODO implement
     */
    optimize(options: CommandBufferOptimizeOptions) {

    }

    /**
     * Destroy the command buffer and all of the commands
     */
    destroy() {

        const cmds = this._commands;
        const context = this.context;

        for (let i = 0, l = cmds.length; i < l; ++i) {
            let cmd = cmds[i];

            if(typeof cmd.destroy === 'function') {
                cmd.destroy(this.context);
            }
        }

        this._commands.length = 0;

    }
}