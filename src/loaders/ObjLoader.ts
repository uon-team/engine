

import { Vector3, Vector2 } from '@uon/math';
import { VertexLayout, VertexBuffer } from '../display/Buffer';

export interface MeshData {
    vertices: number[];
    normals: number[];
    uvs: number[];
    indices: number[][];
}

const VERTEX_LAYOUT = new VertexLayout([
    {
        name: "POSITION",
        count: 3
    },
    {
        name: "NORMAL",
        count: 3
    },
    {
        name: "TEXCOORD",
        count: 2
    },
    {
        name: "TANGENT",
        count: 3
    },
    {
        name: "BITANGENT",
        count: 3
    }
]);

export class ObjLoader {


    private _vertices: Float32Array;
    private _uvs: Float32Array;
    private _normals: Float32Array;
    private _faces: Uint16Array;

    private _interlaced: Float32Array;


    constructor(private url: string) {

    }

    /**
     * Loads the model from url passed in ctor
     */
    async load() {

        const res = await fetch(this.url);

        if (!res.ok) {
            throw new Error();
        }

        const content = await res.text();
        this.parse(content);
    }


    /**
     * Creates a vertex buffer from parsed obj file content
     * @param gl 
     */
    createVertexBuffer(gl: WebGLRenderingContext) {

        if (!this._interlaced) {
            return null;
        }
        let vbuffer = new VertexBuffer(gl);
        vbuffer.update(this._interlaced, VERTEX_LAYOUT);

        return vbuffer;
    }



    /**
     * Parses an OBJ file content
     * @param str 
     */
    private parse(str: string) {

        const verts: Vector3[] = [];
        const normals: Vector3[] = [];
        const uvs: Vector2[] = [];
        const faces: number[][] = [];


        const flattened: number[] = [];

        const flat_verts: Vector3[] = [];
        const flat_normals: Vector3[] = [];
        const flat_uvs: Vector2[] = [];
        const flat_tan: Vector3[] = [];
        const flat_bitan: Vector3[] = [];

        const WHITESPACE_RE = /\s+/;

        const add_vertex = (indices: number[]) => {

            //console.log(vertex);
            let pi = indices[0] - 1;
            let ti = indices[1] - 1;
            let ni = indices[2] - 1;

            let v = verts[pi];
            let n = normals[ni];
            let t = uvs[ti];
            flat_verts.push(v)
            flat_normals.push(n)
            flat_uvs.push(t);

            // faces.push(indices)

        }

        // array of lines separated by the newline
        const lines = str.split("\n");

        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i].trim();
            if (!line || line.startsWith("#")) {
                continue;
            }
            const elements = line.split(WHITESPACE_RE);
            let d = elements.shift();

            if (d == 'v') {
                verts.push(new Vector3(elements.map(e => parseFloat(e))));
            }
            else if (d == 'vn') {
                normals.push(new Vector3(elements.map(e => parseFloat(e))));
            }
            else if (d == 'vt') {
                let coords = elements.map(e => parseFloat(e));
                uvs.push(new Vector2(coords));

            }
            else if (d == 'f') {

                let quad = false;

                for (let j = 0, jl = elements.length; j < jl; ++j) {


                    if (j === 3 && !quad) {
                        // add v2/t2/vn2 in again before continuing to 3
                        j = 2;
                        quad = true;
                    }

                    let vertex = elements[j].split("/").map(n => parseInt(n));

                    add_vertex(vertex);


                    if (j === 3 && quad) {
                        // add v0/t0/vn0 onto the second triangle
                        let vertex = elements[0].split("/").map(n => parseInt(n));
                        add_vertex(vertex);
                    }

                }
            }

        }

        const temp_v3 = new Vector3();

        // compute tangent and bi-tangent
        for (let i = 0; i < flat_verts.length; i += 3) {
            const i0 = i + 0;
            const i1 = i + 1;
            const i2 = i + 2;

            let v1 = flat_verts[i0];
            let v2 = flat_verts[i1];
            let v3 = flat_verts[i2];

            let n1 = flat_normals[i0];
            let n2 = flat_normals[i1];
            let n3 = flat_normals[i2];

            let w1 = flat_uvs[i0];
            let w2 = flat_uvs[i1];
            let w3 = flat_uvs[i2];

            let x1 = v2.x - v1.x;
            let x2 = v3.x - v1.x;
            let y1 = v2.y - v1.y;
            let y2 = v3.y - v1.y;
            let z1 = v2.z - v1.z;
            let z2 = v3.z - v1.z;

            let s1 = w2.x - w1.x;
            let s2 = w3.x - w1.x;
            let t1 = w2.y - w1.y;
            let t2 = w3.y - w1.y;


            let r = 1.0 / (s1 * t2 - s2 * t1);


            let sdir = new Vector3((t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r,
                (t2 * z1 - t1 * z2) * r);
            let tdir = new Vector3((s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r,
                (s1 * z2 - s2 * z1) * r);

            let tan1 = sdir.clone().subtract(temp_v3.copy(n1).multiplyScalar(n1.dot(sdir))).normalize();
            let tan2 = sdir.clone().subtract(temp_v3.copy(n2).multiplyScalar(n2.dot(sdir))).normalize();
            let tan3 = sdir.clone().subtract(temp_v3.copy(n3).multiplyScalar(n3.dot(sdir))).normalize();

            // Calculate handedness
            let h1 = (temp_v3.copy(n1).cross(tan1).dot(tdir)) < 0.0 ? -1.0 : 1.0;
            let h2 = (temp_v3.copy(n2).cross(tan2).dot(tdir)) < 0.0 ? -1.0 : 1.0;
            let h3 = (temp_v3.copy(n3).cross(tan3).dot(tdir)) < 0.0 ? -1.0 : 1.0;

            flat_tan.push(tan1, tan2, tan3);

            let btan1 = n1.clone().cross(tan1).multiplyScalar(h1);
            let btan2 = n2.clone().cross(tan2).multiplyScalar(h2);
            let btan3 = n3.clone().cross(tan3).multiplyScalar(h3);

            flat_bitan.push(btan1, btan2, btan3);

        }

        for (let i = 0; i < flat_verts.length; ++i) {

            flattened.push(...flat_verts[i].toFloatArray())
            flattened.push(...flat_normals[i].toFloatArray())
            flattened.push(...flat_uvs[i].toFloatArray())
            flattened.push(...flat_tan[i].toFloatArray())
            flattened.push(...flat_bitan[i].toFloatArray());
        }

        this._interlaced = new Float32Array(flattened);

    }
}

