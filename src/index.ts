import Predicates from './Predicates';
import { DefaultRequestHandler } from './request';

import {
  ApiOptions,
  Api,
} from './Api';

import { EXPERIMENT_COOKIE, PREVIEW_COOKIE } from './ResolvedApi';

function getApi(url: string, options?: ApiOptions) {
  return new Api(url, options).get();
}

module.exports = {
  Predicates,
  Api,
  getApi,
  api: getApi,
  experimentCookie: EXPERIMENT_COOKIE,
  previewCookie: PREVIEW_COOKIE,
};
