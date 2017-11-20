import Predicates from './Predicates';
import { RequestHandler, RequestCallback } from './request';
import { Document } from './documents';
import { ApiCache } from './cache';
import ResolvedApi, { ApiData } from './ResolvedApi';
import HttpClient from './HttpClient';

export interface ApiOptions {
  accessToken?: string;
  requestHandler?: RequestHandler;
  req?: any;
  apiCache?: ApiCache;
  apiDataTTL?: number;
  proxyAgent?: any;
}

export default class Api {
  url: string;
  options: ApiOptions;
  apiDataTTL: number;
  httpClient: HttpClient;

  constructor(url: string, options?: ApiOptions) {
    this.options = options || {};
    this.url = url;
    if (this.options.accessToken) {
      const accessTokenParam = `access_token=${this.options.accessToken}`;
      this.url += (url.indexOf('?') > -1 ? '&' : '?') + accessTokenParam;
    }
    this.apiDataTTL = this.options.apiDataTTL || 5;
    this.httpClient = new HttpClient(
      this.options.requestHandler,
      this.options.apiCache,
      this.options.proxyAgent,
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
