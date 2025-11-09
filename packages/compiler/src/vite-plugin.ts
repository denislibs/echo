import { compile } from './compile';

// Vite plugin interface (to avoid requiring vite types at compile time)
interface VitePlugin {
  name: string;
  enforce?: 'pre' | 'post';
  transform?: (code: string, id: string) => { code: string; map?: string } | null;
  warn?: (message: string) => void;
}

export function EchoCompiler(): VitePlugin {
  return {
    name: 'echo-compiler',
    enforce: 'pre',
    transform(code: string, id: string) {
      // Only process files that match component pattern
      if (!id.endsWith('.component.ts') && !id.endsWith('.component.tsx')) {
        return null;
      }

      // Extract template from component metadata
      // This is a simplified version - in production, you'd parse the decorator
      const templateMatch = code.match(/template:\s*['"`]([^'"`]+)['"`]/);
      if (!templateMatch) {
        return null;
      }

      const template = templateMatch[1];
      const result = compile(template, {
        filename: id,
        dev: false, // Will be determined by Vite's mode
      });

      if (result.warnings.length > 0 && this.warn) {
        this.warn(result.warnings.join('\n'));
      }

      // Replace template with compiled code
      const newCode = code.replace(
        /template:\s*['"`][^'"`]+['"`]/,
        `compiledTemplate: ${JSON.stringify(result.code)}`
      );

      return {
        code: newCode,
        map: result.map,
      };
    },
  };
}

