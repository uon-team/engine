/*! *******************************************************************************
Copyright (C) Gabriel Roy <g@uon.io>. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

********************************************************************************* */
/*! @uon/engine */

export { Color } from './src/Color';
export { Timer } from './src/Timer';

// display
export { GL_CONSTANT } from './src/display/GLConstant';
export { ShaderDeclaration, ShaderDeclarationDecorator, VertexShader, FragmentShader, ShaderProgram, ShaderDataType } from './src/display/Shader';
export { Material, MaterialDecorator, Uniform, UniformDecorator } from './src/display/Material';
export { CommandLike, CommandBuffer } from './src/display/Command';
export { VertexBuffer, VertexLayout, IndexBuffer, UniformBuffer, BufferUsage, Buffer } from './src/display/Buffer';
export { Texture2D, Texture2DArray, TextureFormat } from './src/display/Texture';
export { RenderTarget2D } from './src/display/RenderTarget';
export { RenderState, RenderStateDecorator, DEFAULT_RENDER_STATE } from './src/display/RenderState';
export { DisplayContext } from './src/display/DisplayContext';
export { ResourceManager } from './src/display/ResourceManager';
export { DisplayModule } from './src/display/DisplayModule';

export { ClearCommand } from './src/display/commands/Clear';
export { SetViewportCommand } from './src/display/commands/SetViewport';
export { DrawArraysCommand } from './src/display/commands/DrawArrays';
export { DrawElementsCommand } from './src/display/commands/DrawElements';
export { SetMaterialCommand } from './src/display/commands/SetMaterial';
export { SetUniformsCommand } from './src/display/commands/SetUniforms';

// world
export { World } from './src/world/World';
export { System, SystemLike } from './src/world/System';
export { Component } from './src/world/Component';
export { Camera, PerspectiveCamera } from './src/world/Camera';

export { Transform3D, TransformSystem3D } from './src/world/systems/TransformSystem3D';
export { Bounds3D, BoundsSystem3D } from './src/world/systems/BoundsSystem3D';
