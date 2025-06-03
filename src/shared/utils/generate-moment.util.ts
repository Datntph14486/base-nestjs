import * as moment from 'moment-timezone';

export function momentTz(timezone?: string, date?: string | Date): moment.Moment {
  if (timezone) {
    if (date) return moment(date).tz(timezone);
    return moment().tz(timezone);
  }
  return moment();
}

export function momentNm(name?: string, format?: string): moment.Moment {
  return moment(name, format);
}
