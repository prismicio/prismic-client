import { Document } from "./documents";
import { RequestHandler, RequestCallback } from './request';
import { ApiCache } from './cache';
import { Experiment, Experiments } from './experiments';
import { SearchForm, Form } from './form';
import Predicates from './Predicates';
import Cookies from './Cookies';
import ApiSearchResponse from './ApiSearchResponse';
import HttpClient from './HttpClient';
import { Client } from './client';

export const PREVIEW_COOKIE = 'io.prismic.preview';
export const EXPERIMENT_COOKIE = 'io.prismic.experiment';

export interface Ref {
  ref: string;
  label: string;
  isMasterRef: string;
  scheduledAt: string;
  id: string;
}

export interface ApiData {
  refs: Ref[];
  bookmarks: { [key: string]: string };
  types: { [key: string]: string };
  tags: string[];
  forms: { [key: string]: Form };
  experiments: any;
  oauth_initiate: string;
  oauth_token: string;
  version: string;
  licence: string;
}

export interface PreviewResponse {
  mainDocument?: string;
}

export interface QueryOptions {
  [key: string]: string | number | string[];
}

export interface ResolvedApiOptions {
  req?: any;
}

export default class ResolvedApi implements Client {
  data: ApiData;
  masterRef: Ref;
  experiments: Experiments;
  options: ResolvedApiOptions;
  httpClient: HttpClient;
  bookmarks: { [key: string]: string };
  refs: Ref[];
  tags: string[];
  types: { [key: string]: string };

  constructor(data: ApiData, httpClient: HttpClient, options: ResolvedApiOptions) {
    this.data = data;
    this.masterRef = data.refs.filter(ref => ref.isMasterRef)[0];
    this.experiments = new Experiments(data.experiments);
    this.bookmarks = data.bookmarks;
    this.httpClient = httpClient;
    this.options = options;
    this.refs = data.refs;
    this.tags = data.tags;
    this.types = data.types;
  }

  /**
   * Returns a useable form from its id, as described in the RESTful description of the API.
   * For instance: api.form("everything") works on every repository (as "everything" exists by default)
   * You can then chain the calls: api.form("everything").query('[[:d = at(document.id, "UkL0gMuvzYUANCpf")]]').ref(ref).submit()
   */
  form(formId: string): SearchForm | null {
    const form = this.data.forms[formId];
    if (form) {
      return new SearchForm(form, this.httpClient);
    }
    return null;
  }

  everything(): SearchForm {
    const f = this.form('everything');
    if (!f) throw new Error('Missing everything form');
    return f;
  }

  /**
   * The ID of the master ref on this prismic.io API.
   * Do not use like this: searchForm.ref(api.master()).
   * Instead, set your ref once in a variable, and call it when you need it; this will allow to change the ref you're viewing easily for your entire page.
   */
  master(): string {
    return this.masterRef.ref;
  }

  /**
   * Returns the ref ID for a given ref's label.
   * Do not use like this: searchForm.ref(api.ref("Future release label")).
   * Instead, set your ref once in a variable, and call it when you need it; this will allow to change the ref you're viewing easily for your entire page.
   */
  ref(label: string): string | null {
    const ref = this.data.refs.filter(ref => ref.label === label)[0];
    return ref ? ref.ref : null;
  }

  currentExperiment(): Experiment | null {
    return this.experiments.current();
  }

  /**
   * Query the repository
   */
  query(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<ApiSearchResponse>, cb: RequestCallback<ApiSearchResponse> = () => {}): Promise<ApiSearchResponse> {
    const { options, callback } = typeof optionsOrCallback === 'function'
        ? { options: {} as QueryOptions, callback: optionsOrCallback }
    : { options: optionsOrCallback || {}, callback: cb };

    let form = this.everything();
    for (const key in options) {
      form = form.set(key, options[key]);
    }
    if (!options.ref) {
      // Look in cookies if we have a ref (preview or experiment)
      let cookieString = '';
      if (this.options.req) { // NodeJS
        cookieString = this.options.req.headers['cookie'] || '';
      } else if (typeof window !== 'undefined' && window.document) { // Browser
        cookieString = window.document.cookie || '';
      }
      const cookies = Cookies.parse(cookieString);
      const previewRef = cookies[PREVIEW_COOKIE];
      const experimentRef = this.experiments.refFromCookie(cookies[EXPERIMENT_COOKIE]);
      form = form.ref(previewRef || experimentRef || this.masterRef.ref);
    }
    if (q) {
      form.query(q);
    }
    return form.submit(callback);
  }

  /**
   * Retrieve the document returned by the given query
   * @param {string|array|Predicate} the query
   * @param {object} additional parameters. In NodeJS, pass the request as 'req'.
   * @param {function} callback(err, doc)
   */
  queryFirst(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<Document>, cb?: RequestCallback<Document>): Promise<Document> {
    const { options, callback } = typeof optionsOrCallback === 'function'
        ? { options: {} as QueryOptions, callback: optionsOrCallback }
        : { options: optionsOrCallback || {}, callback: cb || (() => {}) };

    options.page = 1;
    options.pageSize = 1;

    return this.query(q, options).then((response) => {
      const document = response && response.results && response.results[0];
      callback(null, document);
      return document;
    }).catch((error) => {
      callback(error);
      throw error;
    });
  }

  /**
   * Retrieve the document with the given id
   */
  getByID(id: string, maybeOptions?: QueryOptions, cb?: RequestCallback<Document>): Promise<Document> {
    const options = maybeOptions || {};
    if (!options.lang) options.lang = '*';
    return this.queryFirst(Predicates.at('document.id', id), options, cb);
  }

  /**
   * Retrieve multiple documents from an array of id
   */
  getByIDs(ids: string[], maybeOptions?: QueryOptions, cb?: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse> {
    const options = maybeOptions || {};
    if (!options.lang) options.lang = '*';
    return this.query(Predicates.in('document.id', ids), options, cb);
  }

  /**
   * Retrieve the document with the given uid
   */
  getByUID(type: string, uid: string, maybeOptions?: QueryOptions, cb?: RequestCallback<Document>): Promise<Document> {
    const options = maybeOptions || {};
    if (!options.lang) options.lang = '*';
    return this.queryFirst(Predicates.at(`my.${type}.uid`, uid), options, cb);
  }

  /**
   * Retrieve the singleton document with the given type
   */
  getSingle(type: string, maybeOptions?: QueryOptions, cb?: RequestCallback<Document>): Promise<Document> {
    const options = maybeOptions || {};
    return this.queryFirst(Predicates.at('document.type', type), options, cb);
  }

  /**
   * Retrieve the document with the given bookmark
   */
  getBookmark(bookmark: string, maybeOptions?: QueryOptions, cb?: RequestCallback<Document>): Promise<Document> {
    const id = this.data.bookmarks[bookmark];
    if (id) {
      return this.getByID(id, maybeOptions, cb);
    } else {
      return Promise.reject('Error retrieving bookmarked id');
    }
  }

  previewSession(token: string, linkResolver: (doc: any) => string, defaultUrl: string, cb?: RequestCallback<string>): Promise<string> {
    return new Promise((resolve, reject) => {
      this.httpClient.request<PreviewResponse>(token, (e, result) => {
        if (e) {
          cb && cb(e);
          reject(e);
        } else if (result) {
          if (!result.mainDocument) {
            cb && cb(null, defaultUrl);
            resolve(defaultUrl);
          } else {
            return this.getByID(result.mainDocument, { ref: token }).then((document) => {
              if (!document) {
                cb && cb(null, defaultUrl);
                resolve(defaultUrl);
              } else {
                const url = linkResolver(document);
                cb && cb(null, url);
                resolve(url);
              }
            }).catch(reject);
          }
        }
      });
    });
  }
}
