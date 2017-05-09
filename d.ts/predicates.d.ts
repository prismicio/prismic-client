export interface IPredicate {
    op: Operator;
    toString(): string;
}
export declare enum Operator {
    at = 0,
    not = 1,
    missing = 2,
    has = 3,
    any = 4,
    in = 5,
    fulltext = 6,
    similar = 7,
    "number.gt" = 8,
    "number.lt" = 9,
    "number.inRange" = 10,
    "date.before" = 11,
    "date.after" = 12,
    "date.between" = 13,
    "date.day-of-month" = 14,
    "date.day-of-month-after" = 15,
    "date.day-of-month-before" = 16,
    "date.day-of-week" = 17,
    "date.day-of-week-after" = 18,
    "date.day-of-week-before" = 19,
    "date.month" = 20,
    "date.month-before" = 21,
    "date.month-after" = 22,
    "date.year" = 23,
    "date.hour" = 24,
    "date.hour-before" = 25,
    "date.hour-after" = 26,
    "geopoint.near" = 27,
}
export declare class AtPredicate implements IPredicate {
    fragment: string;
    value: string;
    op: Operator;
    constructor(fragment: string, value: string);
    toString(): string;
}
export declare class NotPredicate implements IPredicate {
    fragment: string;
    value: string;
    op: Operator;
    constructor(fragment: string, value: string);
    toString(): string;
}
export declare class MissingPredicate implements IPredicate {
    fragment: string;
    op: Operator;
    constructor(fragment: string);
    toString(): string;
}
export declare class HasPredicate implements IPredicate {
    fragment: string;
    op: Operator;
    constructor(fragment: string);
    toString(): string;
}
export declare class AnyPredicate implements IPredicate {
    fragment: string;
    values: string[];
    op: Operator;
    constructor(fragment: string, values: string[]);
    toString(): string;
}
export declare class InPredicate implements IPredicate {
    fragment: string;
    values: string[];
    op: Operator;
    constructor(fragment: string, values: string[]);
    toString(): string;
}
export declare class FulltextPredicate implements IPredicate {
    fragment: string;
    value: string;
    op: Operator;
    constructor(fragment: string, value: string);
    toString(): string;
}
export declare class SimilarPredicate implements IPredicate {
    documentId: string;
    maxResults: number;
    op: Operator;
    constructor(documentId: string, maxResults: number);
    toString(): string;
}
export declare class GtPredicate implements IPredicate {
    fragment: string;
    value: number;
    op: Operator;
    constructor(fragment: string, value: number);
    toString(): string;
}
export declare class LtPredicate implements IPredicate {
    fragment: string;
    value: number;
    op: Operator;
    constructor(fragment: string, value: number);
    toString(): string;
}
export declare class InRangePredicate implements IPredicate {
    fragment: string;
    before: number;
    after: number;
    op: Operator;
    constructor(fragment: string, before: number, after: number);
    toString(): string;
}
export declare class DateBeforePredicate implements IPredicate {
    fragment: string;
    before: Date;
    op: Operator;
    constructor(fragment: string, before: Date);
    toString(): string;
}
export declare class DateAfterPredicate implements IPredicate {
    fragment: string;
    after: Date;
    op: Operator;
    constructor(fragment: string, after: Date);
    toString(): string;
}
export declare class DateBetweenPredicate implements IPredicate {
    fragment: string;
    before: Date;
    after: Date;
    op: Operator;
    constructor(fragment: string, before: Date, after: Date);
    toString(): string;
}
export declare class DayOfMonthPredicate implements IPredicate {
    fragment: string;
    day: number;
    op: Operator;
    constructor(fragment: string, day: number);
    toString(): string;
}
export declare class DayOfMonthAfterPredicate implements IPredicate {
    fragment: string;
    day: number;
    op: Operator;
    constructor(fragment: string, day: number);
    toString(): string;
}
export declare class DayOfMonthBeforePredicate implements IPredicate {
    fragment: string;
    day: number;
    op: Operator;
    constructor(fragment: string, day: number);
    toString(): string;
}
export declare class DayOfWeekPredicate implements IPredicate {
    fragment: string;
    day: number;
    op: Operator;
    constructor(fragment: string, day: number);
    toString(): string;
}
export declare class DayOfWeekAfterPredicate implements IPredicate {
    fragment: string;
    day: number;
    op: Operator;
    constructor(fragment: string, day: number);
    toString(): string;
}
export declare class DayOfWeekBeforePredicate implements IPredicate {
    fragment: string;
    day: number;
    op: Operator;
    constructor(fragment: string, day: number);
    toString(): string;
}
export declare class MonthPredicate implements IPredicate {
    fragment: string;
    month: number | string;
    op: Operator;
    constructor(fragment: string, month: number | string);
    toString(): string;
}
export declare class MonthBeforePredicate implements IPredicate {
    fragment: string;
    month: number | string;
    op: Operator;
    constructor(fragment: string, month: number | string);
    toString(): string;
}
export declare class MonthAfterPredicate implements IPredicate {
    fragment: string;
    month: number | string;
    op: Operator;
    constructor(fragment: string, month: number | string);
    toString(): string;
}
export declare class YearPredicate implements IPredicate {
    fragment: string;
    year: number;
    op: Operator;
    constructor(fragment: string, year: number);
    toString(): string;
}
export declare class HourPredicate implements IPredicate {
    fragment: string;
    hour: number;
    op: Operator;
    constructor(fragment: string, hour: number);
    toString(): string;
}
export declare class HourBeforePredicate implements IPredicate {
    fragment: string;
    hour: number;
    op: Operator;
    constructor(fragment: string, hour: number);
    toString(): string;
}
export declare class HourAfterPredicate implements IPredicate {
    fragment: string;
    hour: number;
    op: Operator;
    constructor(fragment: string, hour: number);
    toString(): string;
}
export declare class NearPredicate implements IPredicate {
    fragment: string;
    latitude: number;
    longitude: number;
    radius: number;
    op: Operator;
    constructor(fragment: string, latitude: number, longitude: number, radius: number);
    toString(): string;
}
export declare const Predicates: {
    at: typeof AtPredicate;
    not: typeof NotPredicate;
    missing: typeof MissingPredicate;
    has: typeof HasPredicate;
    any: typeof AnyPredicate;
    in: typeof InPredicate;
    fulltext: typeof FulltextPredicate;
    similar: typeof SimilarPredicate;
    gt: typeof GtPredicate;
    lt: typeof LtPredicate;
    inRange: typeof InRangePredicate;
    before: typeof DateBeforePredicate;
    after: typeof DateAfterPredicate;
    between: typeof DateBetweenPredicate;
    dayOfMonth: typeof DayOfMonthPredicate;
    dayOfMonthAfter: typeof DayOfMonthAfterPredicate;
    dayOfMonthBefore: typeof DayOfMonthBeforePredicate;
    dayOfWeek: typeof DayOfWeekPredicate;
    dayOfWeekAfter: typeof DayOfWeekAfterPredicate;
    dayOfWeekBefore: typeof DayOfWeekBeforePredicate;
    month: typeof MonthPredicate;
    monthBefore: typeof MonthBeforePredicate;
    monthAfter: typeof MonthAfterPredicate;
    year: typeof YearPredicate;
    hour: typeof HourPredicate;
    hourBefore: typeof HourBeforePredicate;
    hourAfter: typeof HourAfterPredicate;
    near: typeof NearPredicate;
};
