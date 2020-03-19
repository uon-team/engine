# UON ENGINE
A simple WebGL2 (and WebGL1!) game engine framework


## Usage

```shell
npm i @uon/engine
```


## Display

A collection of object-oriented WebGL2 wrappers, shader/material system and command system.


### Commands

Rendering in @uon/engine works with command buffers and commands.

Commands are responsible for keeping the command data and issuing state changes to the GL context.


```typescript
// create a display context
const context  = new DisplayContext({ canvas: canvas_el_ref });

// create a command buffer
const cmd_buffer = new CommandBuffer(context);

// create a clear command
const clear_cmd = new ClearCommand();
clear_cmd.color.g = 1.0; // set clear color to bright green
cmd_buffer.add(clear_cmd); // add the command to the buffer

// submit the command buffer to the pipeline
cmd_buffer.submit(); 

```

We provide basic commands to get you started:

 - ClearCommand
 - SetViewportCommand
 - DrawArraysCommand
 - DrawElementsCommand
 - SetMaterialCommand
 - SetUniformsCommand

 #### Implementing you own commands

 You can easily implement your own command by implementing the following interface:

 ```typescript
export interface CommandLike {
    /**
     * Submit state changes to gl
     */
    call: (context: DisplayContext) => void;

    /**
     * Prepare the command, this is called only once on
     * CommandBuffer.add()
     */
    compile?: (context: DisplayContext) => void;

    /**
     * Do clean up, called on CommandBuffer.remove()
     */
    destroy?: (context: DisplayContext) => void;
}
 ```


### Shaders & Materials

@uon/engine provides mechanisms to generate shaders using typescript decorators. You can define shader parts with @ShaderDeclaration
and then combine them with @Material.


#### Declaring shader parts

```typescript
import { ShaderDeclaration, ShaderDataType } from '@uon/engine';

@ShaderDeclaration({
    vin: [
        {
            name: "POSITION",
            type: ShaderDataType.vec3,
            location: 0
        },
        {
            name: "NORMAL",
            type: ShaderDataType.vec3,
            location: 1
        },
        {
            name: "TEXCOORD",
            type: ShaderDataType.vec2,
            location: 2
        }
    ]
})
export class DefaultShaderInputs { }


@ShaderDeclaration({
    deps: [DefaultShaderInputs],
    uniform: [
        { name: 'u_World', type: ShaderDataType.mat4 },
        { name: 'u_ViewProjection', type: ShaderDataType.mat4 }
    ],
    vout: [
        { name: 'v_Texcoord', type: ShaderDataType.vec2 },
    ],
    vs: `
    vec4 wp = u_World * vec4(POSITION, 1.0);
    gl_Position =  u_ViewProjection * wp;
    v_Texcoord = TEXCOORD;
    `
})
export class ShaderDefaultTransform { }


@ShaderDeclaration({
    deps: [ShaderDefaultTransform],
    uniform: [
        { name: 'u_Texture1', type: ShaderDataType.sampler2D }
    ],
    fout: [
        { name: 'o_Color', type: ShaderDataType.vec4 }
    ],

    fs: 'o_Color = texture(u_Texture1, v_Texcoord);'
})
export class ShaderTextureSample { }

```


#### Creating materials from shader declarations

```typescript
import { Material, Uniform, Texture2D } from '@uon/engine';

@Material({
    imports: [ShaderTextureSample]
})
export class TextureMaterial {

    @Uniform() u_Texture1: Texture2D;
}
```

Note that we did not set u_World and U_ViewProjection as uniforms in the material. Instead we recommend that you manage these uniforms separate from materials and use a SetUniformsCommand.





## World 

An implementation of Entity-Component-System.

The World class provides the interface to manage entities, their components and the systems used to update them.

### Example:
```typescript
import { World, Transform3D, TransformSystem3D } from '@uon/engine';


let world = new World([TransformSystem3D]);

let entity = world.createEntity();
let transform = world.addComponent(entity, Transform3D);
transform.translation.set(0, 10, 0);
transform.dirty = true;

world.update();

```



## To be continued...
