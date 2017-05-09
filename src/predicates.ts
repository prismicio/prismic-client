export interface IPredicate {
  op: Operator;
  toString(): string;
}

export enum Operator {
  at,
  not,
  missing,
  has,
  any,
  in,
  fulltext,
  similar,
  "number.gt",
  "number.lt",
  "number.inRange",
  "date.before",
  "date.after",
  "date.between",
  "date.day-of-month",
  "date.day-of-month-after",
  "date.day-of-month-before",
  "date.day-of-week",
  "date.day-of-week-after",
  "date.day-of-week-before",
  "date.month",
  "date.month-before",
  "date.month-after",
  "date.year",
  "date.hour",
  "date.hour-before",
  "date.hour-after",
  "geopoint.near"
}

export class AtPredicate implements IPredicate {
  fragment: string;
  value: string;
  op: Operator = Operator.at;

  constructor(fragment: string, value: string) {
    this.fragment = fragment;
    this.value = value;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, "${this.value}")]`;
  }
}

export class NotPredicate implements IPredicate {
  fragment: string;
  value: string;
  op: Operator = Operator.not;

  constructor(fragment: string, value: string) {
    this.fragment = fragment;
    this.value = value;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, "${this.value}")]`;
  }
}

export class MissingPredicate implements IPredicate {
  fragment: string;
  op: Operator = Operator.missing;

  constructor(fragment: string) {
    this.fragment = fragment;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment})]`;
  }
}

export class HasPredicate implements IPredicate {
  fragment: string;
  op: Operator = Operator.has;

  constructor(fragment: string) {
    this.fragment = fragment;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment})]`;
  }
}

export class AnyPredicate implements IPredicate {
  fragment: string;
  values: string[];
  op: Operator = Operator.any;

  constructor(fragment: string, values: string[]) {
    this.fragment = fragment;
    this.values = values;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, [${this.values.join(',')}])]`;
  }
}

export class InPredicate implements IPredicate {
  fragment: string;
  values: string[];
  op: Operator = Operator.in;

  constructor(fragment: string, values: string[]) {
    this.fragment = fragment;
    this.values = values;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, [${this.values.join(',')}])]`;
  }
}

export class FulltextPredicate implements IPredicate {
  fragment: string;
  value: string;
  op: Operator = Operator.fulltext;

  constructor(fragment: string, value: string) {
    this.fragment = fragment;
    this.value = value;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, "${this.value}")]`;
  }
}

export class SimilarPredicate implements IPredicate {
  documentId: string;
  maxResults: number;
  op: Operator = Operator.similar;

  constructor(documentId: string, maxResults: number) {
    this.documentId = documentId;
    this.maxResults = maxResults;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}("${this.documentId}", ${this.maxResults})]`;
  }
}

export class GtPredicate implements IPredicate {
  fragment: string;
  value: number;
  op: Operator = Operator["number.gt"];

  constructor(fragment: string, value: number) {
    this.fragment = fragment;
    this.value = value;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.value})]`;
  }
}

export class LtPredicate implements IPredicate {
  fragment: string;
  value: number;
  op: Operator = Operator["number.lt"];

  constructor(fragment: string, value: number) {
    this.fragment = fragment;
    this.value = value;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.value})]`;
  }
}

export class InRangePredicate implements IPredicate {
  fragment: string;
  before: number;
  after: number;
  op: Operator = Operator["number.inRange"];

  constructor(fragment: string, before: number, after: number) {
    this.fragment = fragment;
    this.before = before;
    this.after = after;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.before}, ${this.after})]`;
  }
}

export class DateBeforePredicate implements IPredicate {
  fragment: string;
  before: Date;
  op: Operator = Operator["date.before"];

  constructor(fragment: string, before: Date) {
    this.fragment = fragment;
    this.before = before;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.before.getTime()})]`;
  }
}

export class DateAfterPredicate implements IPredicate {
  fragment: string;
  after: Date;
  op: Operator = Operator["date.after"];

  constructor(fragment: string, after: Date) {
    this.fragment = fragment;
    this.after = after;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.after.getTime()})]`;
  }
}

export class DateBetweenPredicate implements IPredicate {
  fragment: string;
  before: Date;
  after: Date;
  op: Operator = Operator["date.between"];

  constructor(fragment: string, before: Date, after: Date) {
    this.fragment = fragment;
    this.before = before;
    this.after = after;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.before.getTime()}, ${this.after.getTime()})]`;
  }
}

export class DayOfMonthPredicate implements IPredicate {
  fragment: string;
  day: number;
  op: Operator = Operator["date.day-of-month"];

  constructor(fragment: string, day: number) {
    this.fragment = fragment;
    this.day = day;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.day})]`;
  }
}

export class DayOfMonthAfterPredicate implements IPredicate {
  fragment: string;
  day: number;
  op: Operator = Operator["date.day-of-month-after"];

  constructor(fragment: string, day: number) {
    this.fragment = fragment;
    this.day = day;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.day})]`;
  }
}

export class DayOfMonthBeforePredicate implements IPredicate {
  fragment: string;
  day: number;
  op: Operator = Operator["date.day-of-month-before"];

  constructor(fragment: string, day: number) {
    this.fragment = fragment;
    this.day = day;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.day})]`;
  }
}

export class DayOfWeekPredicate implements IPredicate {
  fragment: string;
  day: number;
  op: Operator = Operator["date.day-of-week"];

  constructor(fragment: string, day: number) {
    this.fragment = fragment;
    this.day = day;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.day})]`;
  }
}

export class DayOfWeekAfterPredicate implements IPredicate {
  fragment: string;
  day: number;
  op: Operator = Operator["date.day-of-week-after"];

  constructor(fragment: string, day: number) {
    this.fragment = fragment;
    this.day = day;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.day})]`;
  }
}

export class DayOfWeekBeforePredicate implements IPredicate {
  fragment: string;
  day: number;
  op: Operator = Operator["date.day-of-week-before"];

  constructor(fragment: string, day: number) {
    this.fragment = fragment;
    this.day = day;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.day})]`;
  }
}
 
export class MonthPredicate implements IPredicate {
  fragment: string;
  month: number | string;
  op: Operator = Operator["date.month"];

  constructor(fragment: string, month: number | string) {
    this.fragment = fragment;
    this.month = month;
  }

  toString(): string {
    if(typeof this.month === 'number') {
      return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.month})]`;
    } else {
      return `[:d = ${Operator[this.op]}(${this.fragment}, "${this.month}")]`;
    }
  }
}

export class MonthBeforePredicate implements IPredicate {
  fragment: string;
  month: number | string;
  op: Operator = Operator["date.month-before"];

  constructor(fragment: string, month: number | string) {
    this.fragment = fragment;
    this.month = month;
  }

  toString(): string {
    if(typeof this.month === 'number') {
      return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.month})]`;
    } else {
      return `[:d = ${Operator[this.op]}(${this.fragment}, "${this.month}")]`;
    }
  }
}

export class MonthAfterPredicate implements IPredicate {
  fragment: string;
  month: number | string;
  op: Operator = Operator["date.month-after"];

  constructor(fragment: string, month: number | string) {
    this.fragment = fragment;
    this.month = month;
  }

  toString(): string {
    if(typeof this.month === 'number') {
      return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.month})]`;
    } else {
      return `[:d = ${Operator[this.op]}(${this.fragment}, "${this.month}")]`;
    }
  }
}

export class YearPredicate implements IPredicate {
  fragment: string;
  year: number;
  op: Operator = Operator["date.year"];

  constructor(fragment: string, year: number) {
    this.fragment = fragment;
    this.year = year;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.year})]`;
  }
}

export class HourPredicate implements IPredicate {
  fragment: string;
  hour: number;
  op: Operator = Operator["date.hour"];

  constructor(fragment: string, hour: number) {
    this.fragment = fragment;
    this.hour = hour;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.hour})]`;
  }
}

export class HourBeforePredicate implements IPredicate {
  fragment: string;
  hour: number;
  op: Operator = Operator["date.hour-before"];

  constructor(fragment: string, hour: number) {
    this.fragment = fragment;
    this.hour = hour;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.hour})]`;
  }
}

export class HourAfterPredicate implements IPredicate {
  fragment: string;
  hour: number;
  op: Operator = Operator["date.hour-after"];

  constructor(fragment: string, hour: number) {
    this.fragment = fragment;
    this.hour = hour;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.hour})]`;
  }
}

export class NearPredicate implements IPredicate {
  fragment: string;
  latitude: number;
  longitude: number;
  radius: number;
  op: Operator = Operator["geopoint.near"];

  constructor(fragment: string, latitude: number, longitude: number, radius: number) {
    this.fragment = fragment;
    this.latitude = latitude;
    this.longitude = longitude;
    this.radius = radius;
  }

  toString(): string {
    return `[:d = ${Operator[this.op]}(${this.fragment}, ${this.latitude}, ${this.longitude}, ${this.radius})]`;
  }
}

export const Predicates = {
  at: AtPredicate,
  not: NotPredicate,
  missing: MissingPredicate,
  has: HasPredicate,
  any: AnyPredicate,
  in: InPredicate,
  fulltext: FulltextPredicate,
  similar: SimilarPredicate,
  gt: GtPredicate,
  lt: LtPredicate,
  inRange: InRangePredicate,
  before: DateBeforePredicate,
  after: DateAfterPredicate,
  between: DateBetweenPredicate,
  dayOfMonth: DayOfMonthPredicate,
  dayOfMonthAfter: DayOfMonthAfterPredicate,
  dayOfMonthBefore:DayOfMonthBeforePredicate,
  dayOfWeek: DayOfWeekPredicate,
  dayOfWeekAfter: DayOfWeekAfterPredicate,
  dayOfWeekBefore: DayOfWeekBeforePredicate,
  month: MonthPredicate,
  monthBefore: MonthBeforePredicate,
  monthAfter: MonthAfterPredicate,
  year: YearPredicate,
  hour: HourPredicate,
  hourBefore: HourBeforePredicate,
  hourAfter: HourAfterPredicate,
  near: NearPredicate
};