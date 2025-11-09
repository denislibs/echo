export interface RouteConfig {
  path: string;
  component: any;
  children?: RouteConfig[];
}

export interface RouteParams {
  [key: string]: string;
}

export interface QueryParams {
  [key: string]: string | string[];
}

