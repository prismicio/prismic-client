import Predicates from './predicates';
import { RequestHandler, DefaultRequestHandler } from './request';
import { Document } from './documents';
import { ApiCache, DefaultApiCache } from './cache';
import { ResolvedApi } from './ResolvedApi';

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
  apiCache: ApiCache;
  requestHandler: RequestHandler;
  apiCacheKey: string;
  apiDataTTL: number;

  constructor(url: string, options?: ApiOptions) {
    this.options = options || {};
    this.url = url + (this.options.accessToken ? (url.indexOf('?') > -1 ? '&' : '?') + 'access_token=' + this.options.accessToken : '');
    this.apiCache = this.options.apiCache || new DefaultApiCache();
    this.requestHandler = this.options.requestHandler || new DefaultRequestHandler();
    this.apiCacheKey = this.url + (this.options.accessToken ? ('#' + this.options.accessToken) : '');
    this.apiDataTTL = this.options.apiDataTTL || 5;
  }

  /**
   * Fetches data used to construct the api client, from cache if it's
   * present, otherwise from calling the prismic api endpoint (which is
   * then cached).
   */
  get(callback: (err: Error | null, value?: any, xhr?: any, ttl?: number) => void): Promise<ResolvedApi> {
    const cacheKey = this.apiCacheKey;

    return new Promise((resolve, reject) => {
      const cb = (err: Error | null, value?: any, xhr?: any, ttl?: number) => {
        if (callback) callback(err, value, xhr, ttl);
        if (value) resolve(value);
        if (err) reject(err);
      };
      this.apiCache.get(cacheKey, (err: Error | null, value?: any) => {
        if (err || value) {
          cb(err, value);
          return;
        }

        this.requestHandler.request(this.url, (err: Error | null, value?: any, xhr?: any, ttl?: number) => {
          if (err) {
            cb(err, null, xhr, ttl);
            return;
          }

          ttl = ttl || this.apiDataTTL;

          this.apiCache.set(cacheKey, value, ttl, (err: Error) => {
            cb(err, value, xhr, ttl);
          });
        });
      });
    });
  }

  // /**
  //  * Retrieve quick routes definitions
  //  */
  // getQuickRoutes(callback: (err: Error, data: any, xhr: any) => void): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.requestHandler.request(this.data.quickRoutes.url, (err: Error, data: any, xhr: any) => {
  //       if (callback) callback(err, data, xhr);
  //       if (err) reject(err);
  //       if (data) resolve(data);
  //     });
  //   });
  // }

  // /**
  //  * Return the URL to display a given preview
  //  */
  // previewSession(token: string, linkResolver: (ctx: any) => string, defaultUrl: string, callback: (err: Error | null, url?: any, xhr?: any) => void): Promise<string> {
  //   var api = this;
  //   return new Promise(function(resolve, reject) {
  //     var cb = function(err: Error | null, url?: string, xhr?: any) {
  //       if (callback) callback(err, url, xhr);
  //       if (err) {
  //         reject(err);
  //       } else {
  //         resolve(url);
  //       }
  //     };
  //     api.requestHandler.request(token, function(err: Error, result: any, xhr: any) {
  //       if (err) {
  //         cb(err, defaultUrl, xhr);
  //         return;
  //       }
  //       try {
  //         var mainDocumentId = result.mainDocument;
  //         if (!mainDocumentId) {
  //           cb(null, defaultUrl, xhr);
  //         } else {
  //           api.everything().query(Predicates.at("document.id", mainDocumentId)).ref(token).lang('*').submit(function(err: Error, response: ApiResponse) {
  //             if (err) {
  //               cb(err);
  //             }
  //             try {
  //               if (response.results.length === 0) {
  //                 cb(null, defaultUrl, xhr);
  //               } else {
  //                 cb(null, linkResolver(response.results[0]), xhr);
  //               }
  //             } catch (e) {
  //               cb(e);
  //             }
  //           });
  //         }
  //       } catch (e) {
  //         cb(e, defaultUrl, xhr);
  //       }
  //     });
  //   });
  // }
}
