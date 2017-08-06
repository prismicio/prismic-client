export interface ICookie {
    [key: string]: string;
    value: string;
}
declare const _default: {
    parse: (str: string, options?: any) => ICookie;
};
export default _default;
