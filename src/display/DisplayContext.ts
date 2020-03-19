import { Application, Type, Injector, InjectionToken, Provider, ModuleRef, GetMetadata, META_ANNOTATIONS } from "@uon/core";
import { ResourceManager } from "./ResourceManager";
import { StateManager } from "./StateManager";
import { CommandLike } from "./Command";



export const GL_CONTEXT = new InjectionToken<WebGLRenderingContext>("WebGLRenderingContext");
export const CANVAS_ELEMENT = new InjectionToken<HTMLCanvasElement>("HTMLCanvasElement");


export interface DisplayContextConfig {

    /**
     * The canvas element on which to initialize a context 
     */
    canvas: HTMLCanvasElement;

    /**
     * Force the creation of a webgl v1 context even if WebGL2 is supported
     */
    forceWebGL1?: boolean;


    providers?: Provider[];
    declarations?: Type<any>[];
    injector?: Injector;
}


export class DisplayContext {

    private _injector: Injector
    private _gl: WebGLRenderingContext | WebGL2RenderingContext;
    private _extensions: any;
    private _canvas: HTMLCanvasElement;
    private _resourceManager: ResourceManager; 
    private _stateManager: StateManager;

    constructor(private _config: DisplayContextConfig) {


        // the canvas element on which we do the rendering
        let canvas = this._canvas = _config.canvas;

        if (!canvas) {
            throw new Error('config.canvas must be set');
        }

        // get a gl context
        this.initContext(_config);


        // init resource manager
        this._resourceManager = new ResourceManager(this._gl);

        // init the state manager
        this._stateManager = new StateManager(this._gl);

        // create the injector for this display context
        this.initInjector(_config);

    }

    /**
     * Access to the WebGLRenderingContext
     */
    get gl() {
        return this._gl;
    }

    /**
     * Access to the canvas element
     */
    get canvas() {
        return this._canvas;
    }


    /**
     * Access to the resource manager
     */
    get resources() {
        return this._resourceManager;
    }

    /**
     * Access to the state manager
     */
    get states() {
        return this._stateManager;
    }


    /**
     * Get a gl extension by name
     * @param name 
     */
    getExtension(name: string) {
        return this._gl.getExtension(name);
    }


    create<T>(type: Type<T>): T {

        return this._injector.instanciate(type) as T;
    }


    /**
     * Initializes the webGl context
     * @param config 
     */
    private initContext(config: DisplayContextConfig) {

        let context_options = {
            alpha: true,
            depth: true,
            stencil: true,
            antialias: true,
            premultipliedAlpha: true,
            preserveDrawingBuffer: false
        };


        let context_type = this._config.forceWebGL1 ? 'webgl' : 'webgl2';
        console.log(context_type);

        // the gl context
        this._gl = <WebGLRenderingContext>this._canvas.getContext(context_type, context_options) ||
             <WebGLRenderingContext>this._canvas.getContext('webgl', context_options);

        if (!this._gl) {
            throw new Error(`Couldn't get webgl context from canvas`);
        }


    }



    /**
     * Creates the injector for this context
     * @param config 
     */
    private initInjector(config: DisplayContextConfig) {

        let providers: Provider[] = [
            {
                token: DisplayContext,
                value: this
            },
            {
                token: CANVAS_ELEMENT,
                value: this._canvas
            },
            {
                token: GL_CONTEXT,
                value: this._gl
            },
            {
                token: ResourceManager,
                value: this._resourceManager
            },
            {
                token: StateManager,
                value: this._stateManager
            }
        ];

        providers = providers.concat(config.providers);


        this._injector = Injector.Create(providers, config.injector);
    }



}