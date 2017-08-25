class HttpClient {

  /**
   * Fetch a URL corresponding to a query, and parse the response as a Response object
   */
  request(url: string, callback: (err: Error | null, results: any | null, xhr?: any) => void): Promise<any> {
    const cacheKey = url + (this.options.accessToken ? ('#' + this.options.accessToken) : '');
    const run = (cb: (err: Error | null, results: ApiSearchResponse | null, xhr?: any) => void) => {
      this.options.apiCache.get(cacheKey, (err: Error, value: any) => {
        if (err || value) {
          cb(err, value as ApiSearchResponse);
          return;
        }
        this.options.requestHandler.request(url, (err: Error, documents: any, xhr: any, ttl?: number) => {
          if (err) {
            cb(err, null, xhr);
            return;
          }

          if (ttl) {
            this.options.apiCache.set(cacheKey, documents, ttl, (err: Error) => {
              cb(err, documents as ApiSearchResponse);
            });
          } else {
            cb(null, documents as ApiSearchResponse);
          }
        });
      });
    };

    return new Promise((resolve, reject) => {
      run((err, value, xhr) => {
        if (callback) callback(err, value, xhr);
        if (err) reject(err);
        if (value) resolve(value);
      });
    });
  }
}
