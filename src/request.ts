// Number of maximum simultaneous connections to the prismic server
const MAX_CONNECTIONS: number = 20;
// Number of requests currently running (capped by MAX_CONNECTIONS)
let running: number = 0;

interface Task {
  url: string;
  callback: RequestCallback<any>;
}

// Requests in queue
const queue: Task[] = [];

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
    } else {
      return xhr.json().then((result) => {
        const cacheControl = xhr.headers.get('cache-control');
        const parsedCacheControl = cacheControl ? /max-age=(\d+)/.exec(cacheControl) : null;
        const ttl = parsedCacheControl ? parseInt(parsedCacheControl[1], 10) : undefined;
        callback(null, result, xhr, ttl);
      });
    }
  }).catch(callback);
}

function processQueue(options: RequestHandlerOption): void {
  if (queue.length > 0 && running < MAX_CONNECTIONS) {
    running++;

    const req = queue.shift();

    if (req) {

      fetchRequest(req.url, options, (error, result, xhr, ttl) => {
        running--;
        req.callback(error, result, xhr, ttl);
        processQueue(options);
      });
    }
  }
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
    queue.push({ url, callback });
    processQueue(this.options);
  }
}
