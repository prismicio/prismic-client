export declare class Variation {
    data: any;
    constructor(data: any);
    id(): string;
    ref(): string;
    label(): string;
}
export declare class Experiment {
    variations: Variation[];
    data: any;
    constructor(data: any);
    id(): string;
    googleId(): string;
    name(): string;
}
export declare class Experiments {
    drafts: Experiment[];
    running: Experiment[];
    constructor(data: any);
    current(): Experiment | null;
    refFromCookie(cookie: string): string | null;
}
