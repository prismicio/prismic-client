import { RequestHandler } from './request';
import { ApiCache } from './cache';
import { ResolvedApi } from './ResolvedApi';
export interface ApiOptions {
    accessToken?: string;
    complete?: (err: Error | null, value?: any, xhr?: any) => void;
    requestHandler?: RequestHandler;
    req?: any;
    apiCache?: ApiCache;
    apiDataTTL?: number;
}
export declare class Api {
    url: string;
    options: ApiOptions;
    apiCache: ApiCache;
    requestHandler: RequestHandler;
<<<<<<< HEAD
    apiCacheKey: string;
    apiDataTTL: number;
    constructor(url: string, options?: ApiOptions);
=======
    experiments: Experiments;
    bookmarks: {
        [key: string]: string;
    };
    refs: Ref[];
    types: object;
    tags: string[];
    data: any;
    forms: Form[];
    oauthInitiate: string;
    oauthToken: string;
    quickRoutes: any;
    constructor(url: string, options: ApiOptions);
>>>>>>> master
    /**
     * Fetches data used to construct the api client, from cache if it's
     * present, otherwise from calling the prismic api endpoint (which is
     * then cached).
     */
    get(callback: (err: Error | null, value?: any, xhr?: any, ttl?: number) => void): Promise<ResolvedApi>;
}
