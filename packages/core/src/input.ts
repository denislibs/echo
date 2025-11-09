import { signal, type Signal, type WritableSignal } from '@echo/reactivity';

export interface InputSignal<T> extends Signal<T> {
  readonly __isInput: true;
}

export interface RequiredInputSignal<T> extends Signal<T> {
  readonly __isInput: true;
  readonly __isRequired: true;
}

function createInputSignal<T>(initialValue: T): InputSignal<T> {
  const sig = signal(initialValue) as WritableSignal<T>;
  return Object.assign(sig, { __isInput: true as const }) as InputSignal<T>;
}

function createRequiredInputSignal<T>(): RequiredInputSignal<T> {
  // For required inputs, we'll use undefined as placeholder
  // The actual value will be set by the framework
  const sig = signal(undefined as T) as WritableSignal<T>;
  return Object.assign(sig, { 
    __isInput: true as const,
    __isRequired: true as const 
  }) as RequiredInputSignal<T>;
}

export function input<T = unknown>(): InputSignal<T | undefined>;
export function input<T>(initialValue: T): InputSignal<T>;
export function input<T>(initialValue?: T): InputSignal<T> {
  return createInputSignal(initialValue as T);
}

input.required = function <T = unknown>(): RequiredInputSignal<T> {
  return createRequiredInputSignal<T>();
};

// Metadata for tracking inputs (for compiler/debugging)
const inputMetadata = new WeakMap<any, Map<string, any>>();

export function getInputMetadata(component: any): Map<string, any> | undefined {
  return inputMetadata.get(component);
}

