const Operator = {
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

export default {
  at(fragment: string, value: string | string[]): string {
    return `[${Operator.at}(${fragment}, ${encode(value)})]`;
  },
  
  not(fragment: string, value: string): string {
  return `[${Operator.not}(${fragment}, ${encode(value)})]`;
  },

  missing(fragment: string): string {
    return `[${Operator.missing}(${fragment})]`;
  },

  has(fragment: string): string {
    return `[${Operator.has}(${fragment})]`;
  },

  any(fragment: string, values: string[]): string {
    return `[${Operator.any}(${fragment}, ${encode(values)})]`;
  },

  in(fragment: string, values: string[]): string {
    return `[${Operator.in}(${fragment}, ${encode(values)})]`;
  },

  fulltext(fragment: string, value: string): string {
    return `[${Operator.fulltext}(${fragment}, ${encode(value)})]`;
  },

  similar(documentId: string, maxResults: number): string {
    return `[${Operator.similar}("${this.documentId}", ${this.maxResults})]`;
  },

  gt(fragment: string, value: number): string {
    return `[${Operator["number.gt"]}(${fragment}, ${value})]`;
  },

  lt(fragment: string, value: number): string {
    return `[${Operator["number.lt"]}(${fragment}, ${value})]`;
  },

  inRange(fragment: string, before: number, after: number): string {
    return `[${Operator["number.inRange"]}(${fragment}, ${this.before}, ${this.after})]`;
  },

  dateBefore(fragment: string, before: Date): string {
    return `[${Operator["date.before"]}(${fragment}, ${this.before.getTime()})]`;
  },

  dateAfter(fragment: string, after: Date): string {
    return `[${Operator["date.after"]}(${fragment}, ${this.after.getTime()})]`;
  },

  dateBetween(fragment: string, before: Date, after: Date): string {
    return `[${Operator["date.between"]}(${fragment}, ${this.before.getTime()}, ${this.after.getTime()})]`;
  },

  dayOfMonth(fragment: string, day: number): string {
    return `[${Operator["date.day-of-month"]}(${fragment}, ${this.day})]`;
  },

  dayOfMonthAfter(fragment: string, day: number): string {
    return `[${Operator["date.day-of-month-after"]}(${fragment}, ${this.day})]`;
  },

  dayOfMonthBefore(fragment: string, day: number): string {
    return `[${Operator["date.day-of-month-before"]}(${fragment}, ${this.day})]`;
  },

  dayOfWeek(fragment: string, day: number): string {
    return `[${Operator["date.day-of-week"]}(${fragment}, ${this.day})]`;
  },

  dayOfWeekAfter(fragment: string, day: number): string {
    return `[${Operator["date.day-of-week-after"]}(${fragment}, ${this.day})]`;
  },

  dayOfWeekBefore(fragment: string, day: number): string {
    return `[${Operator["date.day-of-week-before"]}(${fragment}, ${this.day})]`;
  },
 
  month(fragment: string, month: number | string): string {
    if(typeof this.month === 'number') {
      return `[${Operator["date.month"]}(${fragment}, ${this.month})]`;
    } else {
      return `[${Operator["date.month"]}(${fragment}, "${this.month}")]`;
    }
  },

  monthBefore(fragment: string, month: number | string): string {
    if(typeof this.month === 'number') {
      return `[${Operator["date.month-before"]}(${fragment}, ${this.month})]`;
    } else {
      return `[${Operator["date.month-before"]}(${fragment}, "${this.month}")]`;
    }
  },

  monthAfter(fragment: string, month: number | string): string {
    if(typeof this.month === 'number') {
      return `[${Operator["date.month-after"]}(${fragment}, ${this.month})]`;
    } else {
      return `[${Operator["date.month-after"]}(${fragment}, "${this.month}")]`;
    }
  },

  year(fragment: string, year: number): string {
    return `[${Operator["date.year"]}(${fragment}, ${this.year})]`;
  },

  hour(fragment: string, hour: number): string {
    return `[${Operator["date.hour"]}(${fragment}, ${this.hour})]`;
  },

  hourBefore(fragment: string, hour: number): string {
    return `[${Operator["date.hour-before"]}(${fragment}, ${this.hour})]`;
  },

  hourAfter(fragment: string, hour: number): string {
    return `[${Operator["date.hour-after"]}(${fragment}, ${this.hour})]`;
  },

  near(fragment: string, latitude: number, longitude: number, radius: number): string {
    return `[${Operator["geopoint.near"]}(${fragment}, ${this.latitude}, ${this.longitude}, ${this.radius})]`;
  }
}
