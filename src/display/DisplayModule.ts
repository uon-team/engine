import { Type, Application, Module, ModuleRef, Provider, APP_INITIALIZER } from '@uon/core';
import { DisplayContext } from './DisplayContext';
import { ResourceManager } from './ResourceManager';


@Module({
    providers: [
        {
            token: APP_INITIALIZER,
            factory: () => {
                console.log('Display module loaded');
            },
            deps: [],
            multi: true

        }
    ]
})
export class DisplayModule {

    constructor(private _app: Application) {

    }

    /**
    * Creates a display context from a moduleRef and a canvas element
    * @param moduleRef 
    * @param canvas 
    */
    /*static Spawn(moduleRef: ModuleRef<any>, canvas: HTMLCanvasElement) {

        //let providers: Provider[] = [];
        //Application.RecursivelyGetModuleProviders(moduleRef.type, providers);

        let declarations: Type<any>[] = [];
        Application.RecursivelyGetModuleDeclarations(moduleRef.type, declarations);


        let context = new DisplayContext({
            canvas: canvas,
            providers: [ResourceManager],
            declarations: declarations,
            injector: moduleRef.injector
        });


        return context;
    }*/

}