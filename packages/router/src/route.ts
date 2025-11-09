import type { RouteConfig } from './types';

const routeMetadata = new WeakMap<any, RouteConfig>();

export function Route(config: RouteConfig) {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    routeMetadata.set(constructor, config);
    return constructor;
  };
}

export function getRouteMetadata(component: any): RouteConfig | undefined {
  return routeMetadata.get(component);
}

