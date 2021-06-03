import HttpClient from './HttpClient';
import { RequestCallback } from './request';

export type Fields = { [key: string]: any };

export interface FormData {
  fields: Fields;
  action: string;
  name: string;
  rel: string;
  form_method: string;
  enctype: string;
}

export abstract class Form {
  httpClient: HttpClient;
  form: FormData;
  data: any;

  constructor(form: FormData, httpClient: HttpClient) {
    this.httpClient = httpClient;
    this.form = form;

    this.data = {};
    for (const field in form.fields) {
      if (form.fields[field]['default']) {
        this.data[field] = [form.fields[field]['default']];
      }
    }
  }

  protected set(field: string, value: any): void {
    const fieldDesc = this.form.fields[field];
    if (!fieldDesc) throw new Error('Unknown field ' + field);
    const checkedValue = value === '' || value === undefined ? null : value;
    let values = this.data[field] || [];
    if (fieldDesc.multiple) {
      values = checkedValue ? values.concat([checkedValue]) : values;
    } else {
      values = checkedValue ? [checkedValue] : values;
    }
    this.data[field] = values;
  }

  url(): string {
    let url = this.form.action;
    if (this.data) {
      let sep = (url.indexOf('?') > -1 ? '&' : '?');
      for (const key in this.data) {
        if  (Object.prototype.hasOwnProperty.call(this.data, key)) {
          const values = this.data[key];
          if (values) {
            for (let i = 0; i < values.length; i++) {
              url += sep + key + '=' + encodeURIComponent(values[i]);
              sep = '&';
            }
          }
        }
      }
    }
    return url;
  }

  /**
   * Submits the query, and calls the callback function.
   */
  submit<T>(cb?: RequestCallback<T>): Promise<T> {
    return this.httpClient.cachedRequest<T>(this.url()).then((response) => {
      cb && cb(null, response);
      return response;
    }).catch((error) => {
      cb && cb(error);
      throw error;
    });
  }
}
