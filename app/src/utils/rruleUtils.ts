// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { Frequency, Options, RRule } from '@heinlein-video/rrule';
import ENGLISH, { Language } from '@heinlein-video/rrule/dist/esm/nlp/i18n';
import { DateFormatter, GetText } from '@heinlein-video/rrule/dist/esm/nlp/totext';
import { RecurrencePattern } from '@opentalk/rest-api-rtk-query';
import i18next from 'i18next';

const BI_WEEKLY_INTERVAL = 2;

/**
 * Returns the FREQ for the rrule depending on the interval
 *
 * @param {Frequency} frequency
 * @param {number} interval
 * @return {string}
 */
const getRecurrencePatternForFrequency = (frequency: string, interval?: number): RecurrencePattern => {
  let frequencyString = '';

  frequencyString += `RRULE:FREQ=${frequency}`;

  if (interval !== undefined) {
    frequencyString += `;INTERVAL=${interval}`;
  }

  return frequencyString as RecurrencePattern;
};

export interface FrequencyOption {
  label: string;
  value: RecurrencePattern;
}

export const CommonFrequencies = {
  /**
   * Used only to give value to the Select component
   */
  NONE: 'None' as RecurrencePattern,
  DAILY: getRecurrencePatternForFrequency(Frequency[Frequency.DAILY]),
  WEEKLY: getRecurrencePatternForFrequency(Frequency[Frequency.WEEKLY]),
  MONTHLY: getRecurrencePatternForFrequency(Frequency[Frequency.MONTHLY]),
  BIWEEKLY: getRecurrencePatternForFrequency(Frequency[Frequency.WEEKLY], BI_WEEKLY_INTERVAL),
};

interface LanguageStrings {
  every: string;
  until: string;
  day: string;
  days: string;
  week: string;
  weeks: string;
  on: string;
  in: string;
  'on the': string;
  for: string;
  and: string;
  or: string;
  at: string;
  last: string;
  st: string;
  nd: string;
  rd: string;
  th: string;
  '(~ approximate)': string;
  time: string;
  times: string;
  minutes: string;
  hours: string;
  weekday: string;
  weekdays: string;
  month: string;
  months: string;
  year: string;
  years: string;
}

const strings: LanguageStrings = {
  every: 'alle',
  until: 'bis',
  day: 'Tag',
  days: 'Tage',
  week: 'Woche',
  weeks: 'Wochen',
  on: 'am',
  in: 'in',
  'on the': 'am',
  for: 'für',
  and: 'und',
  or: 'oder',
  at: 'bei',
  last: 'zuletzt',
  st: '.',
  nd: '.',
  rd: '.',
  th: '.',
  '(~ approximate)': '(~ ungefähr)',
  time: 'Zeit',
  times: 'Zeiten',
  minutes: 'Minuten',
  hours: 'Stunden',
  weekday: 'Wochentag',
  weekdays: 'Wochentage',
  month: 'Monat',
  months: 'Monate',
  year: 'Jahr',
  years: 'Jahre',
};

const getText: GetText = (id) =>
  Object.prototype.hasOwnProperty.call(strings, id as PropertyKey) ? strings[id as keyof LanguageStrings] : String(id);

const GERMAN: Language = {
  dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  monthNames: [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ],
  tokens: {},
};
const dateFormat: DateFormatter = (year, month, day) => `${day}/${month}/${year}`;

export const getRRuleLanguage = () => {
  const language = i18next.language;

  if (language && language.toLowerCase().includes('en')) {
    return ENGLISH;
  }

  return GERMAN;
};

/**
 * Returns translated RRule string. Defaults to German
 */
export const getRRuleText = (rule: RRule) => {
  const language = i18next.language;

  let ruleToText;
  if (language && language.toLowerCase().includes('en')) {
    ruleToText = rule.toText();
  } else {
    // Currently we only support German as the default fallback. Can extend in the future
    ruleToText = rule.toText(getText, GERMAN, dateFormat);
  }

  return capitalizeFirstLetter(ruleToText);
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Converts js day index to RRule (Sunday === 6, Monday === 0);
 * @param index javascript day
 */
export const getRRuleDayOfWeekIndex = (index: number) => {
  return index === 0 ? 6 : index - 1;
};

export type RRuleObject = Partial<Options> & Pick<Options, 'freq'>;
export type PartialRRuleOptions = Partial<Omit<Options, 'freq'>>;
