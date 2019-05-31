import { Type, StringUtils, META_ANNOTATIONS, FindMetadataOfType } from '@uon/core';
import { GL_CONSTANT, IsWebGL2 } from './GLConstant';
import { Material } from './Material';
import { ShaderDeclaration, ShaderBase, ShaderProgram, UniformInfo, UniformBlockInfo, ShaderDataType, VertexInput, VertexOutput, FragmentOutput, VertexShader, FragmentShader } from './Shader';


const SHADER_DEFAULT_HEADER_V1: string[] = [
    'precision mediump float;',
]


const SHADER_DEFAULT_HEADER_V2: string[] = [
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

    constructor(private _gl: WebGLRenderingContext) {


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
            img.crossOrigin = '';
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
        let texts = IsWebGL2(this._gl) ? GenES300Shaders(declarations) : GenES100Shaders(declarations);


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


function GenES300Shaders(decls: ShaderDeclaration[]) {

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


    let vs = [SHADER_DEFAULT_HEADER_V2.join('\n')];
    vs.push(uni.map(u => GetUniformStr(u)).join('\n'));
    vs.push(vin.map(u => GetVertexInputStr(u)).join('\n'));
    vs.push(vout.map(u => GetVertexOutputStr(u)).join('\n'));
    vs.push(vs_defs.join('\n'));

    vs.push(`void main(void) { `);
    vs.push(vs_parts.join('\n\t'));
    vs.push(`}`);
    //console.log(vs.join('\n'));


    let fs = [SHADER_DEFAULT_HEADER_V2.join('\n')];
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


function GenES100Shaders(decls: ShaderDeclaration[]) {

    let vin: VertexInput[] = [];
    let vout: VertexOutput[] = [];
    let fout: FragmentOutput[] = [];
    let uni: (UniformInfo | UniformBlockInfo)[] = [];

    let vs_defs: string[] = [];
    let fs_defs: string[] = [];

    let vs_parts: string[] = [];
    let fs_parts: string[] = [];


    let replaces: string[][] = [];

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

    fout.forEach((fo) => {

        if(fo.legacy) {
            replaces.push([fo.name, fo.legacy]);
        }

    });

    fs_parts = fs_parts.map((fs) => {

        let res = fs;
        replaces.forEach((r) => {
            res = res.replace(new RegExp(r[0], 'g'), r[1]);
        });

        return res;
    });


    let vs = [SHADER_DEFAULT_HEADER_V1.join('\n')];
    vs.push(uni.map(u => GetUniformStr(u)).join('\n'));
    vs.push(vin.map(u => GetVertexInputStr(u, 'attribute')).join('\n'));
    vs.push(vout.map(u => GetVertexOutputStr(u, 'varying')).join('\n'));
    vs.push(vs_defs.join('\n'));

    vs.push(`void main(void) { `);
    vs.push(vs_parts.join('\n\t'));
    vs.push(`}`);
    //console.log(vs.join('\n'));


    let fs = [SHADER_DEFAULT_HEADER_V1.join('\n')];
    fs.push(uni.map(u => GetUniformStr(u)).join('\n'));
    fs.push(vout.map(u => GetFragmentInputStr(u, 'varying')).join('\n'));
    //fs.push(fout.map(u => GetFragmentOutputStr(u)).join('\n'));

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

function GetVertexInputStr(u: VertexInput, keyword: string = 'in') {

    let res = keyword == 'in' ? `layout(location = ${u.location}) ` : '';
    return res + `${keyword} ${ShaderDataType[u.type]} ${u.name};`;
}

function GetVertexOutputStr(u: VertexOutput, keyword: string = 'in') {

    return `${keyword} ${ShaderDataType[u.type]} ${u.name};`;
}

function GetFragmentInputStr(u: VertexOutput, keyword: string = 'in') {

    return `${keyword} ${ShaderDataType[u.type]} ${u.name};`;
}


function GetFragmentOutputStr(u: FragmentOutput) {

    return `out ${ShaderDataType[u.type]} ${u.name};`;
}