export interface Cookie {
    [key: string]: string;
    value: string;
}
declare function parse(str: string, options?: any): Cookie;
declare const _default: {
    parse: typeof parse;
};
export default _default;
