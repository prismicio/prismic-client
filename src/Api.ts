import Predicates from './Predicates';
import { RequestHandler, RequestCallback } from './request';
import { Document } from './documents';
import { ApiCache } from './cache';
import ResolvedApi from './ResolvedApi';
import HttpClient from './HttpClient';

export interface ApiOptions {
  accessToken?: string;
  complete?: (err: Error | null, value?: any, xhr?: any) => void;
  requestHandler?: RequestHandler;
  req?: any;
  apiCache?: ApiCache;
  apiDataTTL?: number;
}

export class Api {
  url: string;
  options: ApiOptions;
  apiDataTTL: number;
  httpClient: HttpClient;

  constructor(url: string, options?: ApiOptions) {
    this.options = options || {};
    this.url = url + (this.options.accessToken ? (url.indexOf('?') > -1 ? '&' : '?') + 'access_token=' + this.options.accessToken : '');
    this.apiDataTTL = this.options.apiDataTTL || 5;
    this.httpClient = new HttpClient(this.options.requestHandler, this.options.apiCache);
  }

  /**
   * Fetches data used to construct the api client, from cache if it's
   * present, otherwise from calling the prismic api endpoint (which is
   * then cached).
   */
  get(cb: RequestCallback<ResolvedApi>): Promise<ResolvedApi> {
    return this.httpClient.cachedRequest<ResolvedApi>(this.url, cb, { ttl: this.apiDataTTL });
  }
}
