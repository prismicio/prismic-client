import { ApiCache } from './cache';
import { RequestHandler, RequestCallback } from './request';
export interface HttpClientOptions {
    ttl?: number;
    cacheKey?: string;
}
export default class HttpClient {
    private cache;
    private requestHandler;
    constructor(requestHandler?: RequestHandler, cache?: ApiCache, proxyAgent?: any);
    request<T>(url: string, callback?: RequestCallback<T>): void;
    /**
     * Fetch a URL corresponding to a query, and parse the response as a Response object
     */
    cachedRequest<T>(url: string, maybeOptions?: HttpClientOptions): Promise<T>;
}
