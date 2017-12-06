import { RequestHandler, RequestCallback } from './request';
import { ApiCache } from './cache';
import ResolvedApi from './ResolvedApi';
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
    constructor(url: string, options?: ApiOptions);
    /**
     * Fetches data used to construct the api client, from cache if it's
     * present, otherwise from calling the prismic api endpoint (which is
     * then cached).
     */
    get(cb?: RequestCallback<ResolvedApi>): Promise<ResolvedApi>;
}
