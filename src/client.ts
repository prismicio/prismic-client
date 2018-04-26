import ResolvedApi, { QueryOptions, EXPERIMENT_COOKIE, PREVIEW_COOKIE } from './ResolvedApi';
import { Document } from "./documents";
import ApiSearchResponse from './ApiSearchResponse';
import { SearchForm, LazySearchForm } from './form';
import { Experiment } from './experiments';
import { RequestHandler, RequestCallback } from './request';
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

export class DefaultClient implements Client {

  api: Api;
  resolvedApi: ResolvedApi;

  constructor(url: string, options?: ApiOptions) {
    this.api = new Api(url, options);
  }

  getApi(): Promise<ResolvedApi> {
    return this.api.get();
  }

  everything(): LazySearchForm {
    return this.form('everything');
  }

  form(formId: string): LazySearchForm {
    return new LazySearchForm(formId, this.api);
  }

  query<T = any>(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<ApiSearchResponse<T>>, cb?: RequestCallback<ApiSearchResponse<T>>): Promise<ApiSearchResponse<T>> {
    return this.getApi().then(api => api.query(q, optionsOrCallback, cb));
  }

  queryFirst<T = any>(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<Document<T>>, cb?: RequestCallback<Document<T>>): Promise<Document<T>> {
    return this.getApi().then(api => api.queryFirst(q, optionsOrCallback, cb));
  }

  getByID<T = any>(id: string, options: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>> {
    return this.getApi().then(api => api.getByID(id, options, cb));
  }

  getByIDs<T = any>(ids: string[], options: QueryOptions, cb?: RequestCallback<ApiSearchResponse<T>>): Promise<ApiSearchResponse<T>> {
    return this.getApi().then(api => api.getByIDs(ids, options, cb));
  }

  getByUID<T = any>(type: string, uid: string, options: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>> {
    return this.getApi().then(api => api.getByUID(type, uid, options, cb));
  }

  getSingle<T = any>(type: string, options: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>> {
    return this.getApi().then(api => api.getSingle(type, options, cb));
  }

  getBookmark<T = any>(bookmark: string, options: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>> {
    return this.getApi().then(api => api.getBookmark(bookmark, options, cb));
  }

  previewSession(token: string, linkResolver: (doc: any) => string, defaultUrl: string, cb?: RequestCallback<string>): Promise<string> {
    return this.getApi().then(api => api.previewSession(token, linkResolver, defaultUrl, cb));
  }

  static getApi(url: string, options?: ApiOptions): Promise<ResolvedApi> {
    const api = new Api(url, options);
    return api.get();
  }
}
