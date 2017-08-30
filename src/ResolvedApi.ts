import { RequestHandler, RequestCallback } from './request';
import { ApiCache } from './cache';
import { Experiment, Experiments } from './experiments';
import { SearchForm, Form } from './form';
import Predicates from './Predicates';
import Cookies from './Cookies';
import ApiSearchResponse from './ApiSearchResponse';
import HttpClient from './HttpClient';

export const PREVIEW_COOKIE = 'io.prismic.preview';
export const EXPERIMENT_COOKIE = 'io.prismic.experiment';

export interface Ref {
  ref: string;
  label: string;
  isMasterRef: string;
  scheduledAt: string;
  id: string;
}

export interface QuickRoutes {
  enabled: boolean;
  url: string;
}

export interface ApiData {
  refs: Ref[];
  bookmarks: { [key: string]: string };
  types: { [key: string]: string };
  tags: string[];
  forms: { [key: string]: Form };
  quickRoutes: QuickRoutes;
  experiments: any;
  oauth_initiate: string;
  oauth_token: string;
  version: string;
  licence: string;
}

export interface ResolvedApiOptions {
  req?: any;
}

export default class ResolvedApi {
  data: ApiData;
  masterRef: Ref;
  experiments: Experiments;
  currentExperiment: Experiment | null;
  quickRoutesEnabled: boolean;
  options: ResolvedApiOptions;
  httpClient: HttpClient;

  constructor(data: ApiData, httpClient: HttpClient, options: ResolvedApiOptions) {
    this.data = data;
    this.masterRef = data.refs.filter(ref => ref.isMasterRef)[0];
    this.experiments = new Experiments(data.experiments);
    this.currentExperiment = this.experiments.current();
    this.quickRoutesEnabled = data.quickRoutes.enabled;
    this.httpClient = httpClient;
    this.options = options;
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
   * Returns the ref ID for a given ref's label.
   * Do not use like this: searchForm.ref(api.ref("Future release label")).
   * Instead, set your ref once in a variable, and call it when you need it; this will allow to change the ref you're viewing easily for your entire page.
   */
  ref(label: string): string | null {
    const ref = this.data.refs.filter(ref => ref.label === label)[0];
    return ref ? ref.ref : null;
  }

  /**
   * Query the repository
   */
  query(q: string | string[], optionsOrCallback: object | RequestCallback<ApiSearchResponse>, cb: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse> { // TODO
        const { options, callback } = typeof optionsOrCallback === 'function'
      ? { options: {}, callback: optionsOrCallback }
      : { options: optionsOrCallback || {}, callback: cb };

    const opts: any = options;

    let form = this.everything();
    for (const key in opts) {
      form = form.set(key, opts[key]);
    }
    if (!opts['ref']) {
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
  queryFirst(q: string | string[], optionsOrCallback: object | RequestCallback<Document>, cb: RequestCallback<Document>) {
    const { options, callback } = typeof optionsOrCallback === 'function'
      ? { options: {}, callback: optionsOrCallback }
      : { options: optionsOrCallback || {}, callback: cb };

    const opts: any = options;
    opts.page = 1;
    opts.pageSize = 1;
    return this.query(q, opts, (err: Error, response: any) => {
      if (callback) {
        const result = response && response.results && response.results[0];
        callback(err, result);
      }
    }).then((response: any) => {
      return response && response.results && response.results[0];
    }).catch((e: Error) => {
      console.log(e);
    });
  }

  /**
   * Retrieve the document with the given id
   */
  getByID(id: string, options: any, cb: RequestCallback<Document>) {
    const opts = options || {};
    if (!options.lang) opts.lang = '*';
    return this.queryFirst(Predicates.at('document.id', id), opts, cb);
  }

  /**
   * Retrieve multiple documents from an array of id
   */
  getByIDs(ids: string[], options: any, cb: RequestCallback<ApiSearchResponse>) {
    const opts = options || {};
    if (!options.lang) opts.lang = '*';
    return this.query(Predicates.in('document.id', ids), opts, cb);
  }

  /**
   * Retrieve the document with the given uid
   */
  getByUID(type: string, uid: string, options: any, cb: RequestCallback<Document>) {
    const opts = options || {};
    if (!options.lang) opts.lang = '*';
    return this.queryFirst(Predicates.at(`my.${type}.uid`, uid), opts, cb);
  }

  /**
   * Retrieve the singleton document with the given type
   */
  getSingle(type: string, options: any, cb: RequestCallback<Document>) {
    return this.queryFirst(Predicates.at('document.type', type), options, cb);
  }

  /**
   * Retrieve the document with the given bookmark
   */
  getBookmark(bookmark: string, options: any, cb: RequestCallback<Document>) {
    return new Promise<string>((resolve, reject) => {
      const id = this.data.bookmarks[bookmark];
      if (id) {
        resolve(id);
      } else {
        const err = new Error('Error retrieving bookmarked id');
        if (cb) cb(err, null);
        reject(err);
      }
    }).then(id => this.getByID(id, options, cb));
  }

    /**
   * Retrieve quick routes definitions
   */
  getQuickRoutes(cb: RequestCallback<any>): Promise<any> {
    return this.httpClient.request(this.data.quickRoutes.url, cb);
  }

  /**
   * Return the URL to display a given preview
   */
  previewSession(token: string, linkResolver: (ctx: any) => string, defaultUrl: string, cb: RequestCallback<string>): Promise<string> {
    return new Promise((resolve, reject) => {
      const cb = (err: Error | null, url?: string, xhr?: any) => {
        if (cb) cb(err, url, xhr);
        if (err) {
          reject(err);
        } else {
          resolve(url);
        }
      };
      this.httpClient.request(token, (err: Error, result: any, xhr: any) => {
        if (err) {
          cb(err, defaultUrl, xhr);
          return;
        }
        try {
          const mainDocumentId = result.mainDocument;
          if (!mainDocumentId) {
            cb(null, defaultUrl, xhr);
          } else {
            this.getByID(mainDocumentId, {}, (err, document) => {
              if (err) {
                cb(err);
              }
              try {
                if (!document) {
                  cb(null, defaultUrl, xhr);
                } else {
                  cb(null, linkResolver(document), xhr);
                }
              } catch (e) {
                cb(e);
              }
            });
          }
        } catch (e) {
          cb(e, defaultUrl, xhr);
        }
      });
    });
  }
}
