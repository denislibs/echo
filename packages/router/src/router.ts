import type { RouteConfig, RouteParams, QueryParams } from './types';

export class Router {
  private routes: RouteConfig[] = [];
  private currentRoute: RouteConfig | null = null;
  private currentParams: RouteParams = {};
  private currentQuery: QueryParams = {};
  private listeners: Set<() => void> = new Set();

  constructor(routes: RouteConfig[] = []) {
    this.routes = routes;
    this.setupPopStateListener();
  }

  addRoute(route: RouteConfig): void {
    this.routes.push(route);
  }

  navigate(path: string): void {
    const url = new URL(path, window.location.origin);
    window.history.pushState({}, '', url);
    this.updateRoute();
  }

  private setupPopStateListener(): void {
    window.addEventListener('popstate', () => {
      this.updateRoute();
    });
  }

  private updateRoute(): void {
    const path = window.location.pathname;
    const query = this.parseQuery(window.location.search);

    const route = this.findRoute(path);
    if (route) {
      this.currentRoute = route;
      this.currentParams = this.extractParams(route.path, path);
      this.currentQuery = query;
      this.notifyListeners();
    }
  }

  private findRoute(path: string): RouteConfig | null {
    for (const route of this.routes) {
      const match = this.matchRoute(route.path, path);
      if (match) {
        return route;
      }
    }
    return null;
  }

  private matchRoute(routePath: string, actualPath: string): boolean {
    const routeParts = routePath.split('/').filter(Boolean);
    const actualParts = actualPath.split('/').filter(Boolean);

    if (routeParts.length !== actualParts.length) {
      return false;
    }

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const actualPart = actualParts[i];

      if (routePart.startsWith(':')) {
        // Parameter match
        continue;
      }

      if (routePart !== actualPart) {
        return false;
      }
    }

    return true;
  }

  private extractParams(routePath: string, actualPath: string): RouteParams {
    const params: RouteParams = {};
    const routeParts = routePath.split('/').filter(Boolean);
    const actualParts = actualPath.split('/').filter(Boolean);

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      if (routePart.startsWith(':')) {
        const paramName = routePart.slice(1);
        params[paramName] = actualParts[i] || '';
      }
    }

    return params;
  }

  private parseQuery(search: string): QueryParams {
    const params: QueryParams = {};
    const urlParams = new URLSearchParams(search);

    for (const [key, value] of urlParams.entries()) {
      if (params[key]) {
        const existing = params[key];
        if (Array.isArray(existing)) {
          existing.push(value);
        } else {
          params[key] = [existing as string, value];
        }
      } else {
        params[key] = value;
      }
    }

    return params;
  }

  getCurrentRoute(): RouteConfig | null {
    return this.currentRoute;
  }

  getParams(): RouteParams {
    return { ...this.currentParams };
  }

  getQuery(): QueryParams {
    return { ...this.currentQuery };
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  init(): void {
    this.updateRoute();
  }
}

