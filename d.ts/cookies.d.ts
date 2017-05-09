export interface ICookie {
    [key: string]: string;
    value: string;
}
declare var _default: {
    parse: (str: string, options?: any) => ICookie;
};
export default _default;
