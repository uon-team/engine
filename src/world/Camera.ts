
import { Vector3, Quaternion, Matrix4, Frustum, ToDegrees, ToRadians } from '@uon/math';


const TEMP_QUAT = new Quaternion();
const TEMP_VEC3 = new Vector3();
const TEMP_MATRIX4 = new Matrix4();
const TEMP_MATRIX4_2 = new Matrix4();


export enum DirtyMatrix {
    World = 1 << 0,
    View = 1 << 1,
    Projection = 1 << 2,
    All = World | View | Projection
}


/**
 * Base class for cameras
 */
export class Camera {

    protected _translation: Vector3;
    protected _orientation: Quaternion;
    protected _up: Vector3;

    protected _world: Matrix4;
    protected _view: Matrix4;
    protected _projection: Matrix4;
    protected _viewproj: Matrix4;
    protected _frustum: Frustum;

    protected dirtyFlag: DirtyMatrix = DirtyMatrix.All;

    /**
     * Constructs a new camera
     */
    constructor() {

        this._translation = new Vector3();
        this._orientation = new Quaternion(0, 0, 0, 1);
        this._up = Vector3.UnitY.clone();

        this._world = new Matrix4();
        this._view = new Matrix4();
        this._projection = new Matrix4();
        this._viewproj = new Matrix4();
        this._frustum = new Frustum();

    }

    set dirty(val: boolean) {
        this.dirtyFlag |= val ? DirtyMatrix.World | DirtyMatrix.View : 0;
        //this._projDirty = val;
    }

    get world() {

        if ((this.dirtyFlag & DirtyMatrix.World) != 0) {

            this._world.compose(this._translation, this._orientation, Vector3.One);
            this.dirtyFlag &= ~DirtyMatrix.World;
        }

        return this._world;
    }

    get view() {

        if ((this.dirtyFlag & (DirtyMatrix.World | DirtyMatrix.View)) != 0) {

            this._view.inverse(this.world);
            this.dirtyFlag &= ~DirtyMatrix.View;
        }

        return this._view;
    }

    get projection() {

        if ((this.dirtyFlag & DirtyMatrix.Projection) != 0) {
            this.updateProjection();
            this.dirtyFlag &= ~DirtyMatrix.Projection;
        }

        return this._projection;
    }

    get viewProjection() {

        if (this.dirtyFlag > 0) {
            this._viewproj.copy(this.view).multiply(this.projection);
        }

        return this._viewproj;

    }

    /**
     * Getter for the translation vector
     */
    get translation() {
        return this._translation;
    }

    /**
     * Setter for the translation vector
     * @param vec3
     */
    set translation(vec3: Vector3) {

        this._translation.copy(vec3);
        this.dirtyFlag |= DirtyMatrix.World | DirtyMatrix.View;
    }

    /**
     * Getter for the orientation quaternion
     */
    get orientation() {
        return this._orientation;
    }

    /**
     * Setter for the orientation quaternion
     * @param quat
     */
    set orientation(quat: Quaternion) {
        this._orientation.copy(quat);
        this.dirtyFlag |= DirtyMatrix.World | DirtyMatrix.View;
    }

    /**
     * Translate the camera along an axis
     * @param axis
     * @param distance
     */
    translate(axis: Vector3, distance: number) {

        TEMP_VEC3.copy(axis).applyQuaternion(this._orientation);

        this._translation.add(TEMP_VEC3.multiplyScalar(distance));

        this.dirtyFlag |= DirtyMatrix.World | DirtyMatrix.View;
    }

    /**
     * Rotate the camera with axis and angle
     * @param axis
     * @param angle
     */
    rotate(axis: Vector3, angle: number) {

        TEMP_QUAT.fromAxisAngle(axis, angle);
        this._orientation.multiply(TEMP_QUAT);

        this.dirtyFlag |= DirtyMatrix.World | DirtyMatrix.View;
    }

    /**
     * Orients the camera to be facing a world position
     * @param point
     */
    lookAt(point: Vector3) {

        var m = TEMP_MATRIX4.identity();
        m.lookAt(this._translation, point, this._up);

        this._orientation.setFromRotationMatrix(m);

        this.dirtyFlag |= DirtyMatrix.World | DirtyMatrix.View;
    }

    /**
     * Must implement in sub class
     */
    protected updateProjection() {
        throw 'Not Implemented';
    }


};




export class PerspectiveCamera extends Camera {


    private _fov: number;
    private _aspect: number;
    private _near: number;
    private _far: number;
    private _zoom: number;

    /**
     * Creates a new perspective camera
     * @param {Number} fov
     * @param {Number} aspect
     * @param {Number} near
     * @param {Number} far
     */
    constructor(fov?: number, aspect?: number, near?: number, far?: number) {
        super();

        this._fov = fov !== undefined ? fov : 50;
        this._aspect = aspect !== undefined ? aspect : 1;
        this._near = near !== undefined ? near : 1e-6;
        this._far = far !== undefined ? far : 1e27;
        this._zoom = 1;

    }

    get fov() {
        return this._fov;
    }

    set fov(val) {
        this._fov = val;
        this.dirtyFlag |= DirtyMatrix.Projection;
    }

    get aspect() {
        return this._aspect;
    }

    set aspect(val) {
        this._aspect = val;

        this.dirtyFlag |= DirtyMatrix.Projection;
    }

    get zoom() {
        return this._zoom;
    }

    set zoom(val) {
        this._zoom = val;
        this.dirtyFlag |= DirtyMatrix.Projection;
    }

    get near() {
        return this._near;
    }

    set near(val) {
        this._near = val;
        this.dirtyFlag |= DirtyMatrix.Projection;
    }

    get far() {
        return this._far;
    }

    set far(val) {
        this._far = val;
        this.dirtyFlag |= DirtyMatrix.Projection;
    }


    /**
     * Update the projection matrix
     */
    protected updateProjection() {

        var fov = ToDegrees(2 * Math.atan(Math.tan(ToRadians(this._fov) * 0.5) / this._zoom));

        this._projection.makePerspective(fov, this._aspect, this._near, this._far);
    }

};




