import type { CompileOptions, CompileResult } from './types';
import { parseTemplate } from './template-parser';
import { generateCode } from './code-generator';

export function compile(
  source: string,
  options: CompileOptions = {}
): CompileResult {
  const { filename = 'component.ts', dev = false } = options;

  try {
    // Parse template
    const templateAst = parseTemplate(source);

    // Generate optimized JavaScript code
    const code = generateCode(templateAst, {
      filename,
      dev,
    });

    return {
      code,
      warnings: [],
    };
  } catch (error) {
    return {
      code: '',
      warnings: [error instanceof Error ? error.message : 'Unknown compilation error'],
    };
  }
}

