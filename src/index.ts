import Predicates from './predicates';
import { DefaultRequestHandler } from './request';
import { Experiments } from './experiments';

import {
  ApiOptions,
  Api,
  ExperimentCookie,
  PreviewCookie,
} from "./api";

function getApi(url: string, options: ApiOptions | null): Promise<Api> {
  const safeOptions = options || {} as ApiOptions;
  var api = new Api(url, safeOptions);
  //Use cached api data if available
  return new Promise(function(resolve, reject) {
    var cb = function(err: Error | null, api?: any) {
      if (safeOptions.complete) safeOptions.complete(err, api);
      if (err) {
        reject(err);
      } else {
        resolve(api);
      }
    };
    api.get(function (err: Error, data: any) {
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

module.exports = {
  experimentCookie: ExperimentCookie,
  previewCookie: PreviewCookie,
  Predicates,
  Experiments,
  api: getApi,
  Api,
  getApi
};
