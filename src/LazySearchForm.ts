import Api from './Api';
import { Fields } from './form';
import { RequestCallback } from './request';
import ResolvedApi from './ResolvedApi';
import ApiSearchResponse from './ApiSearchResponse';
import SearchForm from './SearchForm';

export default class LazySearchForm {
  id: string;
  fields: Fields;
  api: Api;

  constructor(id: string, api: Api) {
    this.id = id;
    this.api = api;
    this.fields = {};
  }

  set(key: string, value: any): LazySearchForm {
    this.fields[key] = value;
    return this;
  }

  ref(ref: string): LazySearchForm {
    return this.set('ref', ref);
  }

  query(query: string | string[]): LazySearchForm {
    return this.set('q', query);
  }

  pageSize(size: number): LazySearchForm {
    return this.set('pageSize', size);
  }

  graphQuery(query: string): LazySearchForm {
    return this.set('graphQuery', query);
  }

  lang(langCode: string): LazySearchForm {
    return this.set('lang', langCode);
  }

  page(p: number): LazySearchForm {
    return this.set('page', p);
  }

  after(documentId: string): LazySearchForm {
    return this.set('after', documentId);
  }

  orderings(orderings?: string[]): LazySearchForm {
    return this.set('orderings', orderings);
  }

  url(): Promise<string> {
    return this.api.get().then((api) => {
      return LazySearchForm.toSearchForm(this, api).url();
    });
  }

  submit(cb: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse> {
    return this.api.get().then((api) => {
      return LazySearchForm.toSearchForm(this, api).submit(cb);
    });
  }

  static toSearchForm(lazyForm: LazySearchForm, api: ResolvedApi): SearchForm {
    const form = api.form(lazyForm.id);
    if (form) {
      return Object.keys(lazyForm.fields).reduce((form, fieldKey) => {
        const fieldValue = lazyForm.fields[fieldKey];
        if (fieldKey === 'q') {
          return form.query(fieldValue);
        } else if (fieldKey === 'pageSize') {
          return form.pageSize(fieldValue);
        } else if (fieldKey === 'graphQuery') {
          return form.graphQuery(fieldValue);
        } else if (fieldKey === 'lang') {
          return form.lang(fieldValue);
        } else if (fieldKey === 'page') {
          return form.page(fieldValue);
        } else if (fieldKey === 'after') {
          return form.after(fieldValue);
        } else if (fieldKey === 'orderings') {
          return form.orderings(fieldValue);
        } else {
          return form.set(fieldKey, fieldValue);
        }
      }, form);
    } else {
      throw new Error(`Unable to access to form ${lazyForm.id}`);
    }
  }
}
