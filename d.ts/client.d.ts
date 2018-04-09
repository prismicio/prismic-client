import ResolvedApi, { QueryOptions } from './ResolvedApi';
import { Document } from "./documents";
import ApiSearchResponse from './ApiSearchResponse';
import { LazySearchForm } from './form';
import { RequestCallback } from './request';
import Api, { ApiOptions } from './Api';
export interface Client {
    query<T = any>(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<ApiSearchResponse<T>>, cb?: RequestCallback<ApiSearchResponse<T>>): Promise<ApiSearchResponse<T>>;
    queryFirst<T = any>(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<Document<T>>, cb: RequestCallback<Document<T>>): Promise<Document<T>>;
    getByID<T = any>(id: string, options: QueryOptions, cb: RequestCallback<Document<T>>): Promise<Document<T>>;
    getByIDs<T = any>(ids: string[], options: QueryOptions, cb: RequestCallback<ApiSearchResponse<T>>): Promise<ApiSearchResponse<T>>;
    getByUID<T = any>(type: string, uid: string, options: QueryOptions, cb: RequestCallback<Document<T>>): Promise<Document<T>>;
    getSingle<T = any>(type: string, options: QueryOptions, cb: RequestCallback<Document<T>>): Promise<Document<T>>;
    getBookmark<T = any>(bookmark: string, options: QueryOptions, cb: RequestCallback<Document<T>>): Promise<Document<T>>;
    previewSession<T = any>(token: string, linkResolver: (doc: any) => string, defaultUrl: string, cb?: RequestCallback<string>): Promise<string>;
}
export declare class DefaultClient implements Client {
    api: Api;
    resolvedApi: ResolvedApi;
    constructor(url: string, options?: ApiOptions);
    getApi(): Promise<ResolvedApi>;
    everything(): LazySearchForm;
    form(formId: string): LazySearchForm;
    query<T>(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<ApiSearchResponse<T>>, cb?: RequestCallback<ApiSearchResponse<T>>): Promise<ApiSearchResponse<T>>;
    queryFirst<T>(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<Document<T>>, cb?: RequestCallback<Document<T>>): Promise<Document<T>>;
    getByID<T>(id: string, options: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>>;
    getByIDs<T>(ids: string[], options: QueryOptions, cb?: RequestCallback<ApiSearchResponse<T>>): Promise<ApiSearchResponse<T>>;
    getByUID<T>(type: string, uid: string, options: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>>;
    getSingle<T>(type: string, options: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>>;
    getBookmark<T>(bookmark: string, options: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>>;
    previewSession(token: string, linkResolver: (doc: any) => string, defaultUrl: string, cb?: RequestCallback<string>): Promise<string>;
    static getApi(url: string, options?: ApiOptions): Promise<ResolvedApi>;
}
