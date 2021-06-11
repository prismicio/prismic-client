import { FormData, Form } from './form';
import HttpClient from './HttpClient';

export default class TagsForm extends Form {
  httpClient: HttpClient;
  form: FormData;

  constructor(form: FormData, httpClient: HttpClient) {
    super(form, httpClient);
  }
}
