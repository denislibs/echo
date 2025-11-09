import { ReactiveNode, markDirty, scheduleUpdate } from './reactive-node';
import type { Signal } from './signal';

export interface ComputedSignal<T> extends Signal<T> {
  readonly value: T;
}

class ComputedImpl<T> {
  private node: ReactiveNode;
  private computation: () => T;
  private _value: T | undefined;
  private dirty = true;
  private computing = false;

  constructor(computation: () => T) {
    this.computation = computation;
    this.node = new ReactiveNode();
  }

  call(): T {
    this.node.track();
    if (this.dirty) {
      this.recompute();
    }
    return this._value!;
  }

  get value(): T {
    if (this.dirty) {
      this.recompute();
    }
    return this._value!;
  }

  private recompute(): void {
    if (this.computing) {
      throw new Error('Circular dependency detected in computed signal');
    }
    this.computing = true;
    this.dirty = false;
    try {
      this._value = this.computation();
    } finally {
      this.computing = false;
    }
  }

  markDirty(): void {
    if (!this.dirty) {
      this.dirty = true;
      markDirty(this.node);
      scheduleUpdate();
    }
  }
}

export function computed<T>(computation: () => T): ComputedSignal<T> {
  const computedImpl = new ComputedImpl(computation);
  
  // Create a callable function that implements the ComputedSignal interface
  const callable = function (): T {
    return computedImpl.call();
  } as ComputedSignal<T>;
  
  // Attach properties to make it a full ComputedSignal
  Object.defineProperty(callable, 'value', {
    get: () => computedImpl.value,
    enumerable: true,
    configurable: true,
  });
  
  return callable;
}

