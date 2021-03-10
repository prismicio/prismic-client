import { RequestHandler, RequestCallback } from './request';
import { ApiCache } from './cache';
import ResolvedApi, { ApiData } from './ResolvedApi';
import HttpClient from './HttpClient';

export interface ApiOptions {
  accessToken?: string;
  routes?: any;
  requestHandler?: RequestHandler;
  req?: any;
  apiCache?: ApiCache;
  apiDataTTL?: number;
  proxyAgent?: any;
  timeoutInMs?: number;
}

function separator(url: string): string {
  return url.indexOf('?') > -1 ? '&' : '?';
}
export default class Api {
  url: string;
  options: ApiOptions;
  apiDataTTL: number;
  httpClient: HttpClient;

  constructor(url: string, options?: ApiOptions) {
    this.options = options || {};
    this.url = url;
    const queryStrings = [
      this.options.accessToken && `access_token=${this.options.accessToken}`,
      this.options.routes && `routes=${encodeURIComponent(JSON.stringify(this.options.routes))}`
    ]
    .filter(Boolean)

    if(queryStrings.length > 0) {
      this.url += separator(url) + queryStrings.join('&')
    }
    
    this.apiDataTTL = this.options.apiDataTTL || 5;
    this.httpClient = new HttpClient(
      this.options.requestHandler,
      this.options.apiCache,
      this.options.proxyAgent,
      this.options.timeoutInMs,
    );
  }

  /**
   * Fetches data used to construct the api client, from cache if it's
   * present, otherwise from calling the prismic api endpoint (which is
   * then cached).
   */
  get(cb?: RequestCallback<ResolvedApi>): Promise<ResolvedApi> {
    return this.httpClient.cachedRequest<ApiData>(this.url, { ttl: this.apiDataTTL }).then((data) => {
      const resolvedApi = new ResolvedApi(data, this.httpClient, this.options);
      cb && cb(null, resolvedApi);
      return resolvedApi;
    }).catch((error) => {
      cb && cb(error);
      throw error;
    });
  }
}
