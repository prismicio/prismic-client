import PrismicPredicates  from './predicates';
import { Experiments as PrismicExperiment } from './experiments';

import {
  ApiOptions,
  Api as PrismicApi,
  ExperimentCookie,
  PreviewCookie,
} from './api';

namespace Prismic {

  export const experimentCookie = ExperimentCookie;
  export const previewCookie = PreviewCookie;
  export const Predicates = PrismicPredicates;
  export const Experiments = PrismicExperiment;
  export const Api = PrismicApi;

  export function getApi(url: string, options: ApiOptions | null): Promise<PrismicApi> {
    const safeOptions = options || {} as ApiOptions;
    const api = new PrismicApi(url, safeOptions);
    return new Promise((resolve, reject) => {
      const cb = (err: Error | null, api?: any) => {
        if (safeOptions.complete) safeOptions.complete(err, api);
        if (err) {
          reject(err);
        } else {
          resolve(api);
        }
      };
      api.get((err: Error, data: any) => {
        if (!err && data) {
          api.data = data;
          api.refs = data.refs;
          api.tags = data.tags;
          api.types = data.types;
          api.forms = data.forms;
          api.bookmarks = data.bookmarks;
          api.experiments = new Experiments(data.experiments);
        }

        cb(err, api);
      });

      return api;
    });
  }

  export function api(url: string, options: ApiOptions | null): Promise<PrismicApi> {
    return getApi(url, options);
  }
}

export = Prismic;
