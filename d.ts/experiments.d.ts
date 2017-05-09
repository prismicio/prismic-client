export interface IExperiment {
    variations: IVariation[];
    data: any;
    id(): string;
    googleId(): string;
    name(): string;
}
export interface IVariation {
    data: any;
    id(): string;
    ref(): string;
    label(): string;
}
export interface IExperiments {
    drafts: IExperiment[];
    running: IExperiment[];
    current(): IExperiment | null;
    refFromCookie(cookie: string): string | null;
}
export declare class Variation implements IVariation {
    data: any;
    constructor(data: any);
    id(): string;
    ref(): string;
    label(): string;
}
export declare class Experiment implements IExperiment {
    variations: IVariation[];
    data: any;
    constructor(data: any);
    id(): string;
    googleId(): string;
    name(): string;
}
export declare class Experiments {
    drafts: IExperiment[];
    running: IExperiment[];
    constructor(data: any);
    current(): IExperiment | null;
    refFromCookie(cookie: string): string | null;
}
