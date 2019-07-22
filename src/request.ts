interface Task {
  url: string;
  callback: RequestCallback<any>;
}

interface NodeRequestInit extends RequestInit {
  agent?: any;
}

function fetchRequest<T>(url: string, options: RequestHandlerOption, callback: RequestCallback<T>): void {

  const fetchOptions = {
    headers: {
      Accept: 'application/json',
    },
  } as NodeRequestInit;

  if (options && options.proxyAgent) {
    fetchOptions.agent = options.proxyAgent;
  }

  fetch(url, fetchOptions).then((xhr) => {
    if (~~(xhr.status / 100 !== 2)) {
        /**
         * @description
         * drain the xhr before throwing an error to prevent memory leaks
         * @link https://github.com/bitinn/node-fetch/issues/83
         */
      return xhr.text().then(() => {
        const e: any = new Error(`Unexpected status code [${xhr.status}] on URL ${url}`);
        e.status = xhr.status;
        throw e;
      });
    }

    return xhr.json().then((result) => {
      const cacheControl = xhr.headers.get('cache-control');
      const parsedCacheControl = cacheControl ? /max-age=(\d+)/.exec(cacheControl) : null;
      const ttl = parsedCacheControl ? parseInt(parsedCacheControl[1], 10) : undefined;

      callback(null, result, xhr, ttl);
    });
  }).catch(callback);
}

export type RequestCallback<T> = (error: Error | null, result?: T | null, xhr?: any, ttl?: number) => void;

export interface RequestHandlerOption {
  proxyAgent?: any;
}

export interface RequestHandler {
  request<T>(url: string, cb: RequestCallback<T>): void;
}

export class DefaultRequestHandler implements RequestHandler {

  options: RequestHandlerOption;

  constructor(options?: RequestHandlerOption) {
    this.options = options || {};
  }

  request<T>(url: string, callback: RequestCallback<T>): void {

    fetchRequest(url, this.options, callback);
  }
}
