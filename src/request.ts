export interface RequestError extends Error {
  status: number;
}

function createError(status: number, message: string): RequestError {
  return {
    name: "prismic-request-error",
    message,
    status
  }
}

// Number of maximum simultaneous connections to the prismic server
let MAX_CONNECTIONS: number = 20;
// Number of requests currently running (capped by MAX_CONNECTIONS)
let running: number = 0;
// Requests in queue
let queue: any[]  = [];

interface RequestCallback {}

interface RequestCallbackSuccess extends RequestCallback {
  result: any;
  xhr: any;
  ttl ?: number;
}

interface RequestCallbackFailure extends RequestCallback {
  error: Error
}


function fetchRequest(
  url: string,
  onSuccess: (_: RequestCallbackSuccess) => void,
  onError: (_: RequestCallbackFailure) => void
): any {
  return fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  }).then(function (response) {
    if (~~(response.status / 100 != 2)) {
      throw createError(response.status, "Unexpected status code [" + response.status + "] on URL " + url);
    } else {
      return response.json().then(function(json) {
        return {
          response: response,
          json: json
        };
      });
    }
  }).then(function(next: any) {
    var response = next.response;
    var json = next.json;
    var cacheControl = response.headers.get('cache-control');
    const parsedCacheControl: string[] | null = cacheControl ? /max-age=(\d+)/.exec(cacheControl) : null;
    const ttl = parsedCacheControl ? parseInt(parsedCacheControl[1], 10) : undefined;
    onSuccess({result: json, xhr: response, ttl} as RequestCallbackSuccess);
  }).catch(function (error: Error) {
    onError({error} as RequestCallbackFailure);
  });
}

export interface RequestHandler {
  request(url: String, cb: (error: Error | null, result?: any, xhr?: any) => void): void
}

function processQueue() {
  if (queue.length === 0 || running >= MAX_CONNECTIONS) {
    return;
  }
  running++;

  const next = queue.shift();

  fetchRequest(next.url,
    function({result, xhr, ttl}: RequestCallbackSuccess) {
      running--;
      next.callback(null, result, xhr, ttl);
      processQueue();
    },
    function({error}: RequestCallbackFailure) {
      next.callback(error);
      processQueue();
    }
  );
}

export class DefaultRequestHandler implements RequestHandler {
  request(url: String, cb: (error: Error | null, result?: any, xhr?: any, ttl?: number) => void): void {
    queue.push({
      'url': url,
      'callback': cb
    });
    processQueue();
  }
}
