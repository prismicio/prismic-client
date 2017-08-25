// Number of maximum simultaneous connections to the prismic server
const MAX_CONNECTIONS: number = 20;
// Number of requests currently running (capped by MAX_CONNECTIONS)
let running: number = 0;
// Requests in queue
const queue: any[]  = [];

interface RequestCallback {}

interface RequestCallbackSuccess extends RequestCallback {
  result: any;
  xhr: any;
  ttl?: number;
}

interface RequestCallbackFailure extends RequestCallback {
  error: Error;
}

function fetchRequest(
  url: string,
  onSuccess: (_: RequestCallbackSuccess) => void,
  onError: (_: RequestCallbackFailure) => void,
): any {
  return fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  }).then((response) => {
    if (~~(response.status / 100 !== 2)) {
      const e = new Error(`Unexpected status code [${response.status}] on URL ${url}`);
      e.status = response.status;
      throw e;
    } else {
      return response.json().then((json) => {
        return {
          response,
          json,
        };
      });
    }
  }).then((next: any) => {
    const response = next.response;
    const json = next.json;
    const cacheControl = response.headers.get('cache-control');
    const parsedCacheControl: string[] | null = cacheControl ? /max-age=(\d+)/.exec(cacheControl) : null;
    const ttl = parsedCacheControl ? parseInt(parsedCacheControl[1], 10) : undefined;
    onSuccess({ ttl, result: json, xhr: response } as RequestCallbackSuccess);
  }).catch((error: Error) => {
    onError({ error } as RequestCallbackFailure);
  });
}

export interface RequestHandler {
  request(url: String, cb: (error: Error | null, result?: any, xhr?: any) => void): void;
}

function processQueue() {
  if (queue.length === 0 || running >= MAX_CONNECTIONS) {
    return;
  }
  running++;

  const next = queue.shift();

  const onSuccess = ({ result, xhr, ttl }: RequestCallbackSuccess) => {
      running--;
      next.callback(null, result, xhr, ttl);
      processQueue();
  };

  const onError = ({ error }: RequestCallbackFailure) => {
    next.callback(error);
    processQueue();
  };

  fetchRequest(next.url, onSuccess, onError);
}

export class DefaultRequestHandler implements RequestHandler {
  request(url: String, cb: (error: Error | null, result?: any, xhr?: any, ttl?: number) => void): void {
    queue.push({
      url,
      callback: cb,
    });
    processQueue();
  }
}
