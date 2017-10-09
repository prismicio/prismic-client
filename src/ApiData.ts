export interface QuickRoutes {
  url: string;
  lastUpdate: number;
  enabled: boolean;
}

export interface ApiData {
  refs: Ref[];
  bookmarks: { [key: string]: string };
  types: { [key: string]: string };
  tags: string[];
  forms: { [key: string]: Form };
  quickRoutes: QuickRoutes;
  experiments: any;
  oauth_initiate: string;
  oauth_token: string;
  version: string;
  licence: string;
}
