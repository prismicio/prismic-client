import { Document } from "@root/documents";
import { IApiOptions, IApi, Form, SearchForm } from "./api";
import * as Predicates from '@root/predicates';
import { Experiments } from '@root/experiments';
declare var _default: {
    experimentCookie: string;
    previewCookie: string;
    Document: typeof Document;
    SearchForm: typeof SearchForm;
    Form: typeof Form;
    Experiments: typeof Experiments;
    Predicates: typeof Predicates;
    api: (url: string, options: IApiOptions) => Promise<IApi>;
};
export default _default;
