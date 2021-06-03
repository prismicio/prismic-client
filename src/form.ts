export type Fields = { [key: string]: any };

export interface FormData {
  fields: Fields;
  action: string;
  name: string;
  rel: string;
  form_method: string;
  enctype: string;
}
