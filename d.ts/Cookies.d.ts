export interface Cookie {
    [key: string]: string;
    value: string;
}
declare const _default: {
    parse: (str: string, options?: any) => Cookie;
};
export default _default;
