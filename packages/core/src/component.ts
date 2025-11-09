// Signal type is not used directly in this file
import { compile } from '@arc.js/compiler';

export interface ComponentOptions {
  selector: string;
  template: string;
}

const componentMetadata = new WeakMap<any, ComponentOptions>();

export function Component(options: ComponentOptions) {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    componentMetadata.set(constructor, options);
    
    // Compile template at class definition time
    const compiled = compile(options.template, {
      filename: `${options.selector}.ts`,
      dev: false, // Will be determined at build time
    });

    // Store compiled code in metadata
    const metadata = componentMetadata.get(constructor);
    if (metadata) {
      (metadata as any).compiledCode = compiled.code;
    }

    return constructor;
  };
}

export function getComponentMetadata(component: any): ComponentOptions | undefined {
  return componentMetadata.get(component);
}

