import { Type, StringUtils, META_ANNOTATIONS, FindMetadataOfType } from '@uon/core';
import { GL_CONSTANT } from './GLConstant';
import { Material } from './Material';
import { ShaderDeclaration, ShaderBase, ShaderProgram, UniformInfo, UniformBlockInfo, ShaderDataType, VertexInput, VertexOutput, FragmentOutput, VertexShader, FragmentShader } from './Shader';

const SHADER_DEFAULT_HEADER: string[] = [
    '#version 300 es',
    'precision highp float;',
    'precision highp int;',
    'layout(std140) uniform;'
]

export class ResourceManager {

    private _shadersByHash: { [k: string]: ShaderBase } = {};
    private _programsByHash: { [k: string]: ShaderProgram } = {};

    private _materials = new Map<Material, ShaderProgram>();
    private _images: { [k: string]: HTMLImageElement } = {};

    constructor(private _gl: WebGL2RenderingContext) {


    }


    /**
     * Load an image
     * @param path 
     */
    loadImage(path: string): Promise<HTMLImageElement> {


        return new Promise((resolve, reject) => {

            if (this._images[path]) {
                return resolve(this._images[path]);
            }


            let img = document.createElement('img');

            img.addEventListener('load', () => {

                this._images[path] = img;
                resolve(img);

            }, false);

            img.src = path;

        });

    }


    /**
     * Generate and compile a material
     * @param material 
     */
    loadMaterial(material: Material): ShaderProgram {

        // we only need one material of the same type
        if (this._materials.has(material)) {
            return this._materials.get(material);
        }

        // generate shader code
        let declarations: ShaderDeclaration[] = [];
        GetShaderDeclarations(material.imports, declarations);


        // get shader text
        let texts = GenShadersFromDeclarations(declarations);


        let vs_hash = StringUtils.hash(texts.vs);
        let fs_hash = StringUtils.hash(texts.fs);

        let vs = new VertexShader(this._gl, texts.vs);
        let fs = new FragmentShader(this._gl, texts.fs);


        let program = new ShaderProgram(this._gl, vs, fs);


        return program;
    }


}



/**
 * Recursively get shader declarations
 * @private
 * @param list 
 * @param out 
 */
function GetShaderDeclarations(list: Type<any>[], out: ShaderDeclaration[]) {

    for (let i = 0; i < list.length; ++i) {

        let item = list[i];
        let sd = FindMetadataOfType(META_ANNOTATIONS, item, ShaderDeclaration);

        if (sd) {

            if (sd.deps) {
                GetShaderDeclarations(sd.deps, out);
            }

            if (out.indexOf(sd) == -1) {
                out.push(sd);
            }

        }

    }
}

function GenShadersFromDeclarations(decls: ShaderDeclaration[]) {

    let vin: VertexInput[] = [];
    let vout: VertexOutput[] = [];
    let fout: FragmentOutput[] = [];
    let uni: (UniformInfo | UniformBlockInfo)[] = [];

    let vs_defs: string[] = [];
    let fs_defs: string[] = [];

    let vs_parts: string[] = [];
    let fs_parts: string[] = [];


    for (let i = 0; i < decls.length; ++i) {
        let decl = decls[i];


        if (decl.vin) {
            vin = vin.concat(decl.vin);
        }
        if (decl.vout) {
            vout = vout.concat(decl.vout);
        }
        if (decl.fout) {
            fout = fout.concat(decl.fout);
        }

        if (decl.uniform) {
            uni = uni.concat(decl.uniform);
        }

        if (decl.vsDefs) {
            vs_defs.push(decl.vsDefs);
        }

        if (decl.fsDefs) {
            fs_defs.push(decl.fsDefs);
        }

        if (decl.vs) {
            vs_parts.push(decl.vs);
        }

        if (decl.fs) {
            fs_parts.push(decl.fs);
        }
    }


    let vs = [SHADER_DEFAULT_HEADER.join('\n')];
    vs.push(uni.map(u => GetUniformStr(u)).join('\n'));
    vs.push(vin.map(u => GetVertexInputStr(u)).join('\n'));
    vs.push(vout.map(u => GetVertexOutputStr(u)).join('\n'));
    vs.push(vs_defs.join('\n'));

    vs.push(`void main(void) { `);
    vs.push(vs_parts.join('\n\t'));
    vs.push(`}`);
    //console.log(vs.join('\n'));


    let fs = [SHADER_DEFAULT_HEADER.join('\n')];
    fs.push(uni.map(u => GetUniformStr(u)).join('\n'));
    fs.push(vout.map(u => GetFragmentInputStr(u)).join('\n'));
    fs.push(fout.map(u => GetFragmentOutputStr(u)).join('\n'));

    fs.push(fs_defs.join('\n'));

    fs.push(`void main(void) { `);
    fs.push(fs_parts.join('\n\t'));
    fs.push(`}`);

    //console.log(fs.join('\n'));

    return {
        vs: vs.join('\n'),
        fs: fs.join('\n')
    };


}

function GetUniformStr(u: UniformInfo | UniformBlockInfo) {

    return `uniform ${ShaderDataType[(u as UniformInfo).type]} ${u.name};`;
}

function GetVertexInputStr(u: VertexInput) {

    return `layout(location = ${u.location}) in ${ShaderDataType[u.type]} ${u.name};`;
}

function GetVertexOutputStr(u: VertexOutput) {

    return `out ${ShaderDataType[u.type]} ${u.name};`;
}

function GetFragmentInputStr(u: VertexOutput) {

    return `in ${ShaderDataType[u.type]} ${u.name};`;
}


function GetFragmentOutputStr(u: FragmentOutput) {

    return `out ${ShaderDataType[u.type]} ${u.name};`;
}