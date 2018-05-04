import { Type, FindMetadataOfType, META_ANNOTATIONS } from '@uon/core';
import { DisplayContext } from '../DisplayContext';
import { Color } from '../../Color';
import { BindAttributes } from './Utils';
import { VertexBuffer, IndexBuffer } from '../Buffer';

export class DrawElementsCommand {

    private indexCount: number;
    private _vao: WebGLVertexArrayObject;

    constructor(public vertices: VertexBuffer, public indices: IndexBuffer, public topology: number) {

        this.indexCount = indices.count;

    }

    compile(context: DisplayContext) {

        if(this._vao) {
            return;
        }

        const gl = context.gl;
        const vbuffer = this.vertices;
        const ibuffer = this.indices;

        this._vao = gl.createVertexArray();

        // bind VAO for recording
        gl.bindVertexArray(this._vao);

        // bind vbuffer
        gl.bindBuffer(vbuffer.target, vbuffer.id);

        // set attribute pointers
        const vl_elements = vbuffer.layout.elements;
        for(let i = 0; i < vl_elements.length; ++i) {
            let el = vl_elements[i];
            let loc = el.location !== undefined ? el.location : i;
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, el.count, gl.FLOAT, false, vbuffer.layout.stride, el.offset);

        }


        // bind ibuffer
        gl.bindBuffer(ibuffer.target, ibuffer.id);

        // unbind vao
        gl.bindVertexArray(null);

    }

    destroy(context: DisplayContext) {

        const gl = context.gl;

        if(this._vao) {
            gl.deleteVertexArray(this._vao);
            this._vao = null;
        }
       
    }

    call(context: DisplayContext) {

        const gl = context.gl;
        const vbuffer = this.vertices;
        const ibuffer = this.indices;

        gl.bindVertexArray(this._vao);
        gl.drawElements(this.topology, this.indexCount, gl.UNSIGNED_SHORT, 0);


        gl.bindVertexArray(null);

    }
}