import ResolvedApi, { EXPERIMENT_COOKIE as experimentCookie, PREVIEW_COOKIE as previewCookie } from './ResolvedApi';
import Predicates from './Predicates';
import { Experiments } from './Experiments';
import Api, { ApiOptions } from './Api';
import { DefaultClient } from './client';
export { experimentCookie, previewCookie, Predicates, Experiments, Api };
export declare function client(url: string, options?: ApiOptions): DefaultClient;
export declare function getApi(url: string, options?: ApiOptions): Promise<ResolvedApi>;
export declare function api(url: string, options?: ApiOptions): Promise<ResolvedApi>;
