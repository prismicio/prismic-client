import { ApiCache, DefaultApiCache } from './cache';
import { RequestHandler, DefaultRequestHandler, RequestCallback } from './request';

export interface HttpClientOptions {
  ttl?: number;
  cacheKey?: string;
}

export default class HttpClient {

  private cache: ApiCache;
  private requestHandler: RequestHandler;

  constructor(requestHandler?: RequestHandler, cache?: ApiCache, proxyAgent?: any) {
    this.requestHandler = requestHandler || new DefaultRequestHandler({ proxyAgent });
    this.cache = cache || new DefaultApiCache();
  }

  request<T>(url: string, callback: RequestCallback<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestHandler.request(url, (err, result, xhr) => {
        if (err) {
          reject(err);
          callback(err, null, xhr);
        } else {
          resolve(result);
          callback(null, result, xhr);
        }
      });
    });
  }

  /**
   * Fetch a URL corresponding to a query, and parse the response as a Response object
   */
  cachedRequest<T>(url: string, options?: HttpClientOptions): Promise<T> {
    const opts = options || {};
    const run = (cb: RequestCallback<T>) => {
      const cacheKey = (options && options.cacheKey) || url;
      this.cache.get(cacheKey, (err: Error, value: any) => {
        if (err || value) {
          cb(err, value);
          return;
        }
        this.requestHandler.request(url, (err: Error, result: any, xhr: any, ttl?: number) => {
          if (err) {
            cb(err, null, xhr);
            return;
          }

          if (ttl) { // TODO
            this.cache.set(cacheKey, result, ttl, (err: Error) => {
              cb(err, result);
            });
          } else {
            cb(null, result);
          }
        });
      });
    };

    return new Promise((resolve, reject) => {
      run((err, value, xhr) => {
        if (err) reject(err);
        if (value) resolve(value);
      });
    });
  }
}
