import { Document } from "./documents";
import ResolvedApi, { QueryOptions } from './ResolvedApi';
import ApiSearchResponse from './ApiSearchResponse';
import { LazySearchForm } from './form';
import { RequestCallback } from './request';
import Api, { ApiOptions } from './Api';
export interface Client {
    query(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<ApiSearchResponse>, cb?: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse>;
    queryFirst(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<Document>, cb: RequestCallback<Document>): Promise<Document>;
    getByID(id: string, options: QueryOptions, cb: RequestCallback<Document>): Promise<Document>;
    getByIDs(ids: string[], options: QueryOptions, cb: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse>;
    getByUID(type: string, uid: string, options: QueryOptions, cb: RequestCallback<Document>): Promise<Document>;
    getSingle(type: string, options: QueryOptions, cb: RequestCallback<Document>): Promise<Document>;
    getBookmark(bookmark: string, options: QueryOptions, cb: RequestCallback<Document>): Promise<Document>;
    previewSession(token: string, linkResolver: (doc: any) => string, defaultUrl: string, cb?: RequestCallback<string>): Promise<string>;
}
export declare class DefaultClient implements Client {
    api: Api;
    resolvedApi: ResolvedApi;
    constructor(url: string, options?: ApiOptions);
    getApi(): Promise<ResolvedApi>;
    everything(): LazySearchForm;
    form(formId: string): LazySearchForm;
    query(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<ApiSearchResponse>, cb?: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse>;
    queryFirst(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<Document>, cb?: RequestCallback<Document>): Promise<Document>;
    getByID(id: string, options: QueryOptions, cb?: RequestCallback<Document>): Promise<Document>;
    getByIDs(ids: string[], options: QueryOptions, cb?: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse>;
    getByUID(type: string, uid: string, options: QueryOptions, cb?: RequestCallback<Document>): Promise<Document>;
    getSingle(type: string, options: QueryOptions, cb?: RequestCallback<Document>): Promise<Document>;
    getBookmark(bookmark: string, options: QueryOptions, cb?: RequestCallback<Document>): Promise<Document>;
    previewSession(token: string, linkResolver: (doc: any) => string, defaultUrl: string, cb?: RequestCallback<string>): Promise<string>;
    static getApi(url: string, options?: ApiOptions): Promise<ResolvedApi>;
}
