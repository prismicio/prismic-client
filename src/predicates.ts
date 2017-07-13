export const Operator = {
  at: "at",
  not: "not",
  missing: "missing",
  has: "has",
  any: "any",
  in: "in",
  fulltext: "fulltext",
  similar: "similar",
  "number.gt": "number.gt",
  "number.lt": "number.lt",
  "number.inRange": "number.inRange",
  "date.before": "date.before",
  "date.after": "date.after",
  "date.between": "date.between",
  "date.day-of-month": "date.day-of-month",
  "date.day-of-month-after": "date.day-of-month-after",
  "date.day-of-month-before": "date.day-of-month-before",
  "date.day-of-week": "date.day-of-week",
  "date.day-of-week-after": "date.day-of-week-after",
  "date.day-of-week-before": "date.day-of-week-before",
  "date.month": "date.month",
  "date.month-before": "date.month-before",
  "date.month-after": "date.month-after",
  "date.year": "date.year",
  "date.hour": "date.hour",
  "date.hour-before": "date.hour-before",
  "date.hour-after": "date.hour-after",
  "geopoint.near": "geopoint.near"
}

function encode(value: string | string[]): string | null {
  if(typeof value === 'string') {
    return `"${value}"`;
  } else if(value instanceof Array) {
    return `[${value.map(v => encode(v)).join(',')}]`;
  } else {
    return null;
  }
}

export function AtPredicate(fragment: string, value: string | string[]): string {
  return `[:d = ${Operator.at}(${fragment}, ${encode(value)})]`;
}

export function NotPredicate(fragment: string, value: string): string {
  return `[:d = ${Operator.not}(${fragment}, ${encode(value)})]`;
}

export function MissingPredicate(fragment: string): string {
  return `[:d = ${Operator.missing}(${fragment})]`;
}

export function HasPredicate(fragment: string): string {
  return `[:d = ${Operator.has}(${fragment})]`;
}

export function AnyPredicate(fragment: string, values: string[]): string {
  return `[:d = ${Operator.any}(${fragment}, ${encode(values)})]`;
}

export function InPredicate(fragment: string, values: string[]): string {
  return `[:d = ${Operator.in}(${fragment}, ${encode(values)})]`;
}

export function FulltextPredicate(fragment: string, value: string): string {
  return `[:d = ${Operator.fulltext}(${fragment}, ${encode(value)})]`;
}

export function SimilarPredicate(documentId: string, maxResults: number): string {
  return `[:d = ${Operator.similar}("${this.documentId}", ${this.maxResults})]`;
}

export function GtPredicate(fragment: string, value: number): string {
  return `[:d = ${Operator["number.gt"]}(${fragment}, ${value})]`;
}

export function LtPredicate(fragment: string, value: number): string {
  return `[:d = ${Operator["number.lt"]}(${fragment}, ${value})]`;
}

export function InRangePredicate(fragment: string, before: number, after: number): string {
  return `[:d = ${Operator["number.inRange"]}(${fragment}, ${this.before}, ${this.after})]`;
}

export function DateBeforePredicate(fragment: string, before: Date): string {
  return `[:d = ${Operator["date.before"]}(${fragment}, ${this.before.getTime()})]`;
}

export function DateAfterPredicate(fragment: string, after: Date): string {
  return `[:d = ${Operator["date.after"]}(${fragment}, ${this.after.getTime()})]`;
}

export function DateBetweenPredicate(fragment: string, before: Date, after: Date): string {
  return `[:d = ${Operator["date.between"]}(${fragment}, ${this.before.getTime()}, ${this.after.getTime()})]`;
}

export function DayOfMonthPredicate(fragment: string, day: number): string {
  return `[:d = ${Operator["date.day-of-month"]}(${fragment}, ${this.day})]`;
}

export function DayOfMonthAfterPredicate(fragment: string, day: number): string {
  return `[:d = ${Operator["date.day-of-month-after"]}(${fragment}, ${this.day})]`;
}

export function DayOfMonthBeforePredicate(fragment: string, day: number): string {
  return `[:d = ${Operator["date.day-of-month-before"]}(${fragment}, ${this.day})]`;
}

export function DayOfWeekPredicate(fragment: string, day: number): string {
  return `[:d = ${Operator["date.day-of-week"]}(${fragment}, ${this.day})]`;
}

export function DayOfWeekAfterPredicate(fragment: string, day: number): string {
  return `[:d = ${Operator["date.day-of-week-after"]}(${fragment}, ${this.day})]`;
}

export function DayOfWeekBeforePredicate(fragment: string, day: number): string {
  return `[:d = ${Operator["date.day-of-week-before"]}(${fragment}, ${this.day})]`;
}
 
export function MonthPredicate(fragment: string, month: number | string): string {
  if(typeof this.month === 'number') {
    return `[:d = ${Operator["date.month"]}(${fragment}, ${this.month})]`;
  } else {
    return `[:d = ${Operator["date.month"]}(${fragment}, "${this.month}")]`;
  }
}

export function MonthBeforePredicate(fragment: string, month: number | string): string {
  if(typeof this.month === 'number') {
    return `[:d = ${Operator["date.month-before"]}(${fragment}, ${this.month})]`;
  } else {
    return `[:d = ${Operator["date.month-before"]}(${fragment}, "${this.month}")]`;
  }
}

export function MonthAfterPredicate(fragment: string, month: number | string): string {
  if(typeof this.month === 'number') {
    return `[:d = ${Operator["date.month-after"]}(${fragment}, ${this.month})]`;
  } else {
    return `[:d = ${Operator["date.month-after"]}(${fragment}, "${this.month}")]`;
  }
}

export function YearPredicate(fragment: string, year: number): string {
  return `[:d = ${Operator["date.year"]}(${fragment}, ${this.year})]`;
}

export function HourPredicate(fragment: string, hour: number): string {
  return `[:d = ${Operator["date.hour"]}(${fragment}, ${this.hour})]`;
}

export function HourBeforePredicate(fragment: string, hour: number): string {
  return `[:d = ${Operator["date.hour-before"]}(${fragment}, ${this.hour})]`;
}

export function HourAfterPredicate(fragment: string, hour: number): string {
  return `[:d = ${Operator["date.hour-after"]}(${fragment}, ${this.hour})]`;
}

export function NearPredicate(fragment: string, latitude: number, longitude: number, radius: number): string {
  return `[:d = ${Operator["geopoint.near"]}(${fragment}, ${this.latitude}, ${this.longitude}, ${this.radius})]`;
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