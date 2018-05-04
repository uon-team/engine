import { Type, FindMetadataOfType, META_ANNOTATIONS } from '@uon/core';
import { DisplayContext } from '../DisplayContext';
import { Color } from '../../Color';
import { VertexBuffer, VertexLayout } from '../Buffer';
import { BindAttributes } from './Utils';

export class DrawArraysCommand {

    private vertexCount: number;

    constructor(public vertices: VertexBuffer, public topology: number) {

        this.vertexCount = vertices.count;
 
    }

    call(context: DisplayContext) {

        const gl = context.gl;
        const buffer = this.vertices;

        const current_program = context.states.program;

        gl.bindBuffer(buffer.target, buffer.id);

        BindAttributes(gl, current_program, buffer.layout);

        gl.drawArrays(this.topology, 0, this.vertexCount);


    }
}