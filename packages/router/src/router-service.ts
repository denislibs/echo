import { Router } from './router';
import type { RouteConfig } from './types';

export class RouterService {
  private static instance: RouterService | null = null;
  private router: Router;

  private constructor(routes: RouteConfig[] = []) {
    this.router = new Router(routes);
  }

  static getInstance(routes?: RouteConfig[]): RouterService {
    if (!RouterService.instance) {
      RouterService.instance = new RouterService(routes);
    }
    return RouterService.instance;
  }

  navigate(path: string): void {
    this.router.navigate(path);
  }

  getRouter(): Router {
    return this.router;
  }
}

