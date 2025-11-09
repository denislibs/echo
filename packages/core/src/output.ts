export interface OutputRef<T = void> {
  emit(value: T): void;
  subscribe(callback: (value: T) => void): () => void;
  readonly __isOutput: true;
}

class OutputRefImpl<T> implements OutputRef<T> {
  private listeners: Set<(value: T) => void> = new Set();
  readonly __isOutput = true as const;

  emit(value: T): void {
    for (const listener of this.listeners) {
      listener(value);
    }
  }

  subscribe(callback: (value: T) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export function output<T = void>(): OutputRef<T> {
  return new OutputRefImpl<T>();
}

// Metadata for tracking outputs (for compiler/debugging)
const outputMetadata = new WeakMap<any, Map<string, any>>();

export function getOutputMetadata(component: any): Map<string, any> | undefined {
  return outputMetadata.get(component);
}

