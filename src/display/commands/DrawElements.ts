import { Type, FindMetadataOfType, META_ANNOTATIONS } from '@uon/core';
import { DisplayContext } from '../DisplayContext';
import { BindAttributes } from './Utils';
import { VertexBuffer, IndexBuffer } from '../Buffer';
import { IsWebGL2 } from '../GLConstant';

export class DrawElementsCommand {

    private indexCount: number;
    private _vao: WebGLVertexArrayObject;

    constructor(public vertices: VertexBuffer, public indices: IndexBuffer, public topology: number) {

        this.indexCount = indices.count;

    }

    compile(context: DisplayContext) {

        if (this._vao) {
            return;
        }

        const gl = context.gl;
        const vbuffer = this.vertices;
        const ibuffer = this.indices;

        if (IsWebGL2(gl)) {

            const gl2: WebGL2RenderingContext = gl as WebGL2RenderingContext;
            this._vao = gl2.createVertexArray();

            // bind VAO for recording
            gl2.bindVertexArray(this._vao);

            // bind vbuffer
            gl2.bindBuffer(vbuffer.target, vbuffer.id);

            // set attribute pointers
            const vl_elements = vbuffer.layout.elements;
            for (let i = 0; i < vl_elements.length; ++i) {
                let el = vl_elements[i];
                let loc = el.location !== undefined ? el.location : i;
                gl2.enableVertexAttribArray(loc);
                gl2.vertexAttribPointer(loc, el.count, gl.FLOAT, false, vbuffer.layout.stride, el.offset);

            }


            // bind ibuffer
            gl2.bindBuffer(ibuffer.target, ibuffer.id);

            // unbind vao
            gl2.bindVertexArray(null);

        }



    }

    destroy(context: DisplayContext) {

        const gl = context.gl as WebGL2RenderingContext;

        if (this._vao) {
            gl.deleteVertexArray(this._vao);
            this._vao = null;
        }

    }

    call(context: DisplayContext) {


        const vbuffer = this.vertices;
        const ibuffer = this.indices;

        if (this._vao) {
            const gl = context.gl as WebGL2RenderingContext;
            gl.bindVertexArray(this._vao);
            gl.drawElements(this.topology, this.indexCount, gl.UNSIGNED_SHORT, 0);
            gl.bindVertexArray(null);
        }
        else {

            const current_program = context.states.program;
            const gl = context.gl;

            // bind vbuffer
            gl.bindBuffer(this.vertices.target, this.vertices.id);
            BindAttributes(gl, current_program, this.vertices.layout);

            // bind ibuffer
            gl.bindBuffer(ibuffer.target, ibuffer.id);

            // draw
            gl.drawElements(this.topology, this.indexCount, gl.UNSIGNED_SHORT, 0);

        }



    }
}