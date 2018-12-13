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

  request<T>(url: string, callback?: RequestCallback<T>): void {
    this.requestHandler.request<T>(url, (err, result, xhr, ttl) => {
      if (err) {
        callback && callback(err, null, xhr, ttl);
      } else if (result) {
        callback && callback(null, result, xhr, ttl);
      }
    });
  }

  /**
   * Fetch a URL corresponding to a query, and parse the response as a Response object
   */
  cachedRequest<T>(url: string, maybeOptions?: HttpClientOptions): Promise<T> {
    const options = maybeOptions || {};
    const run = (cb: RequestCallback<T>) => {
      const cacheKey = options.cacheKey || url;
      this.cache.get<T>(cacheKey, (cacheGetError, cacheGetValue) => {
        if (cacheGetError || cacheGetValue) {
          cb(cacheGetError, cacheGetValue);
        } else {
          this.request<T>(url, (fetchError, fetchValue, xhr, ttlReq) => {
            if (fetchError) {
              cb(fetchError, null);
            } else {
              const ttl = ttlReq || options.ttl;
              if (ttl) {
                this.cache.set(cacheKey, fetchValue, ttl, cb);
              }
              cb(null, fetchValue);
            }
          });
        }
      });
    };

    return new Promise((resolve, reject) => {
      run((err, value) => {
        if (err) reject(err);
        if (value) resolve(value);
      });
    });
  }
}
