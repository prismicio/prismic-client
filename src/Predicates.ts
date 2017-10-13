const OPERATOR = {
  at: 'at',
  not: 'not',
  missing: 'missing',
  has: 'has',
  any: 'any',
  in: 'in',
  fulltext: 'fulltext',
  similar: 'similar',
  'number.gt': 'number.gt',
  'number.lt': 'number.lt',
  'number.inRange': 'number.inRange',
  'date.before': 'date.before',
  'date.after': 'date.after',
  'date.between': 'date.between',
  'date.day-of-month': 'date.day-of-month',
  'date.day-of-month-after': 'date.day-of-month-after',
  'date.day-of-month-before': 'date.day-of-month-before',
  'date.day-of-week': 'date.day-of-week',
  'date.day-of-week-after': 'date.day-of-week-after',
  'date.day-of-week-before': 'date.day-of-week-before',
  'date.month': 'date.month',
  'date.month-before': 'date.month-before',
  'date.month-after': 'date.month-after',
  'date.year': 'date.year',
  'date.hour': 'date.hour',
  'date.hour-before': 'date.hour-before',
  'date.hour-after': 'date.hour-after',
  'geopoint.near': 'geopoint.near',
};

function encode(value: string | string[]): string | null {
  if (typeof value === 'string') {
    return `"${value}"`;
  } else if (value instanceof Array) {
    return `[${value.map(v => encode(v)).join(',')}]`;
  } else if (typeof value === 'number') {
    return value;
  } else {
    return null;
  }
}

const geopoint = {
  near(fragment: string, latitude: number, longitude: number, radius: number): string {
    return `[${OPERATOR['geopoint.near']}(${fragment}, ${latitude}, ${longitude}, ${radius})]`;
  },
};

const date = {

  before(fragment: string, before: Date): string {
    return `[${OPERATOR['date.before']}(${fragment}, ${before.getTime()})]`;
  },

  after(fragment: string, after: Date): string {
    return `[${OPERATOR['date.after']}(${fragment}, ${after.getTime()})]`;
  },

  between(fragment: string, before: Date, after: Date): string {
    return `[${OPERATOR['date.between']}(${fragment}, ${before.getTime()}, ${after.getTime()})]`;
  },

  dayOfMonth(fragment: string, day: number): string {
    return `[${OPERATOR['date.day-of-month']}(${fragment}, ${day})]`;
  },

  dayOfMonthAfter(fragment: string, day: number): string {
    return `[${OPERATOR['date.day-of-month-after']}(${fragment}, ${day})]`;
  },

  dayOfMonthBefore(fragment: string, day: number): string {
    return `[${OPERATOR['date.day-of-month-before']}(${fragment}, ${day})]`;
  },

  dayOfWeek(fragment: string, day: number): string {
    return `[${OPERATOR['date.day-of-week']}(${fragment}, ${day})]`;
  },

  dayOfWeekAfter(fragment: string, day: number): string {
    return `[${OPERATOR['date.day-of-week-after']}(${fragment}, ${day})]`;
  },

  dayOfWeekBefore(fragment: string, day: number): string {
    return `[${OPERATOR['date.day-of-week-before']}(${fragment}, ${day})]`;
  },

  month(fragment: string, month: number | string): string {
    if (typeof month === 'number') {
      return `[${OPERATOR['date.month']}(${fragment}, ${month})]`;
    } else {
      return `[${OPERATOR['date.month']}(${fragment}, "${month}")]`;
    }
  },

  monthBefore(fragment: string, month: number | string): string {
    if (typeof month === 'number') {
      return `[${OPERATOR['date.month-before']}(${fragment}, ${month})]`;
    } else {
      return `[${OPERATOR['date.month-before']}(${fragment}, "${month}")]`;
    }
  },

  monthAfter(fragment: string, month: number | string): string {
    if (typeof month === 'number') {
      return `[${OPERATOR['date.month-after']}(${fragment}, ${month})]`;
    } else {
      return `[${OPERATOR['date.month-after']}(${fragment}, "${month}")]`;
    }
  },

  year(fragment: string, year: number): string {
    return `[${OPERATOR['date.year']}(${fragment}, ${year})]`;
  },

  hour(fragment: string, hour: number): string {
    return `[${OPERATOR['date.hour']}(${fragment}, ${hour})]`;
  },

  hourBefore(fragment: string, hour: number): string {
    return `[${OPERATOR['date.hour-before']}(${fragment}, ${hour})]`;
  },

  hourAfter(fragment: string, hour: number): string {
    return `[${OPERATOR['date.hour-after']}(${fragment}, ${hour})]`;
  },
};

const number = {
  gt(fragment: string, value: number): string {
    return `[${OPERATOR['number.gt']}(${fragment}, ${value})]`;
  },

  lt(fragment: string, value: number): string {
    return `[${OPERATOR['number.lt']}(${fragment}, ${value})]`;
  },

  inRange(fragment: string, before: number, after: number): string {
    return `[${OPERATOR['number.inRange']}(${fragment}, ${before}, ${after})]`;
  },
};

export default {
  at(fragment: string, value: string | string[]): string {
    return `[${OPERATOR.at}(${fragment}, ${encode(value)})]`;
  },
  
  not(fragment: string, value: string): string {
    return `[${OPERATOR.not}(${fragment}, ${encode(value)})]`;
  },

  missing(fragment: string): string {
    return `[${OPERATOR.missing}(${fragment})]`;
  },

  has(fragment: string): string {
    return `[${OPERATOR.has}(${fragment})]`;
  },

  any(fragment: string, values: string[]): string {
    return `[${OPERATOR.any}(${fragment}, ${encode(values)})]`;
  },

  in(fragment: string, values: string[]): string {
    return `[${OPERATOR.in}(${fragment}, ${encode(values)})]`;
  },

  fulltext(fragment: string, value: string): string {
    return `[${OPERATOR.fulltext}(${fragment}, ${encode(value)})]`;
  },

  similar(documentId: string, maxResults: number): string {
    return `[${OPERATOR.similar}("${documentId}", ${maxResults})]`;
  },

  date,

  dateBefore: date.before,

  dateAfter: date.after,

  dateBetween: date.between,

  dayOfMonth: date.dayOfMonth,

  dayOfMonthAfter: date.dayOfMonthAfter,

  dayOfMonthBefore: date.dayOfMonthBefore,

  dayOfWeek: date.dayOfWeek,

  dayOfWeekAfter: date.dayOfWeekAfter,

  dayOfWeekBefore: date.dayOfWeekBefore,

  month: date.month,

  monthBefore: date.monthBefore,

  monthAfter: date.monthAfter,

  year: date.year,

  hour: date.hour,

  hourBefore: date.hourBefore,

  hourAfter: date.hourAfter,

  number,

  gt: number.gt,

  lt: number.lt,

  inRange: number.inRange,

  near: geopoint.near,

  geopoint,
};
