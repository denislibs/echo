export interface CompileOptions {
  filename?: string;
  dev?: boolean;
  sourcemap?: boolean;
}

export interface CompileResult {
  code: string;
  map?: string;
  warnings: string[];
}

