import { ReactiveNode, markDirty, scheduleUpdate } from './reactive-node';

export interface Signal<T> {
  (): T;
  readonly value: T;
}

export interface WritableSignal<T> extends Signal<T> {
  set(value: T): void;
  update(updater: (value: T) => T): void;
}

class SignalImpl<T> {
  private node: ReactiveNode;
  private _value: T;

  constructor(initialValue: T) {
    this._value = initialValue;
    this.node = new ReactiveNode();
  }

  call(): T {
    this.node.track();
    return this._value;
  }

  get value(): T {
    return this._value;
  }

  set(value: T): void {
    if (this._value !== value) {
      this._value = value;
      markDirty(this.node);
      scheduleUpdate();
    }
  }

  update(updater: (value: T) => T): void {
    this.set(updater(this._value));
  }
}

export function signal<T>(initialValue: T): WritableSignal<T> {
  const signalImpl = new SignalImpl(initialValue);
  
  // Create a callable function that implements the Signal interface
  const callable = function (): T {
    return signalImpl.call();
  } as WritableSignal<T>;
  
  // Attach properties to make it a full WritableSignal
  Object.defineProperty(callable, 'value', {
    get: () => signalImpl.value,
    enumerable: true,
    configurable: true,
  });
  
  callable.set = (value: T) => signalImpl.set(value);
  callable.update = (updater: (value: T) => T) => signalImpl.update(updater);
  
  return callable;
}

