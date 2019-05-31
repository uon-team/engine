
import { VertexLayout } from "../Buffer";
import { ShaderProgram } from "../Shader";




export function BindAttributes(gl: WebGLRenderingContext, program: ShaderProgram, layout: VertexLayout) {

    let vsize = layout.stride,
        elements = layout.elements;

    for (let i = 0; i < elements.length; i++) {

        let el = elements[i];

        let vi = program.getVertexInputByName(el.name);
        if(vi == undefined) {
            continue;
        }

        gl.enableVertexAttribArray(vi.location);
        gl.vertexAttribPointer(vi.location, el.count, gl.FLOAT, false, vsize, el.offset);
        
    }

}

export function SetUniforms(gl: WebGLRenderingContext, program: ShaderProgram, values: any) {

    let tex_count = -1;
    let program_uniforms = program.uniforms;


    for (let i = 0; i < program_uniforms.length; ++i) {

        let param: any = program_uniforms[i];
        let name = param.name;
        let val = values[name];

        //console.log(name, val);

        if (val === undefined)
            continue;

        if (typeof val['toFloatArray'] === 'function') {
            val = val.toFloatArray();

        }

        switch (param.type) {
            case gl.FLOAT_MAT4: {
                gl.uniformMatrix4fv(param.location, false, val);
                break;
            }

            case gl.FLOAT_MAT3: {
                gl.uniformMatrix3fv(param.location, false, val);
                break;
            }

            case gl.FLOAT_MAT2: {
                gl.uniformMatrix2fv(param.location, false, val);
                break;
            }

            case gl.FLOAT_VEC4: {
                gl.uniform4fv(param.location, val);
                break;
            }
            case gl.FLOAT_VEC3: {
                gl.uniform3fv(param.location, val);
                break;
            }
            case gl.FLOAT_VEC2: {
                gl.uniform2fv(param.location, val);
                break;
            }

            case gl.FLOAT: {
                gl.uniform1fv(param.location, [val]);
                break;
            }

            case gl.SAMPLER_2D: {

                tex_count++;

                if (!val) {
                    break;
                }

                gl.activeTexture(gl.TEXTURE0 + tex_count);
                gl.bindTexture(val.target, val.id);
                gl.uniform1i(param.location, tex_count);

                break;
            }

            case gl.SAMPLER_CUBE: {
                break;
            }

        }

    }


}