export interface OnInit {
  ngOnInit(): void;
}

export interface OnDestroy {
  ngOnDestroy(): void;
}

const lifecycleHooks = new WeakMap<any, Set<string>>();

export function OnInit(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  if (!lifecycleHooks.has(target.constructor)) {
    lifecycleHooks.set(target.constructor, new Set());
  }
  lifecycleHooks.get(target.constructor)!.add('ngOnInit');
  return descriptor;
}

export function OnDestroy(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  if (!lifecycleHooks.has(target.constructor)) {
    lifecycleHooks.set(target.constructor, new Set());
  }
  lifecycleHooks.get(target.constructor)!.add('ngOnDestroy');
  return descriptor;
}

export function getLifecycleHooks(component: any): Set<string> | undefined {
  return lifecycleHooks.get(component);
}

