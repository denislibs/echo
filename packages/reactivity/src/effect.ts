import { ReactiveNode } from './reactive-node';

export interface EffectRef {
  destroy(): void;
}

class EffectImpl implements EffectRef {
  private node: ReactiveNode;
  private effectFn: () => void | (() => void);
  private cleanup: (() => void) | null = null;
  private active = true;

  constructor(effectFn: () => void | (() => void)) {
    this.effectFn = effectFn;
    this.node = new ReactiveNode();
    this.run();
  }

  private run(): void {
    if (!this.active) return;

    // Cleanup previous effect
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }

    // Track dependencies
    this.node.track();
    try {
      const result = this.effectFn();
      if (typeof result === 'function') {
        this.cleanup = result;
      }
    } catch (error) {
      console.error('Error in effect:', error);
    }
  }

  destroy(): void {
    this.active = false;
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
  }
}

export function effect(effectFn: () => void | (() => void)): EffectRef {
  return new EffectImpl(effectFn);
}

