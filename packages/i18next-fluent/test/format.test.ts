import i18next from 'i18next';

import Fluent from '../src';

const testJSON = {
  emails:
    '{ $unreadEmails ->\n [0] You have no unread emails.\n [one] You have one unread email.\n *[other] You have { $unreadEmails } unread emails.\n}',
  '-brand-name': '{\n $case -> *[nominative] Firefox\n  [accusative] Firefoxa\n}',
  '-another-term': 'another term',
  'app-title': '{ -brand-name }',
  'restart-app': 'Zrestartuj { -brand-name(case: "accusative") }.',
  login: {
    comment:
      'Note: { $title } is a placeholder for the title of the web page\ncaptured in the screenshot. The default, for pages without titles, is\ncreating-page-title-default.',
    value: 'Predefined value',
    placeholder: 'example@email.com',
    'aria-label': 'Login input value',
    title: 'Type your login email',
  },
  logout: 'Logout',
  hello: 'Hello { $name }.',
};

describe('fluent format', () => {
  describe('basic parse', () => {
    let fluent: Fluent;

    beforeAll(() => {
      fluent = new Fluent({
        bindI18nStore: false,
      });

      fluent.store.createBundle('en', 'translations', testJSON);
    });

    it('should parse', () => {
      const res0 = fluent.getResource('en', 'translations', 'emails');
      const parsedRes0 = res0 ? fluent.parse(res0, { unreadEmails: 10 }, 'en', 'translations', 'emails') : '';
      expect(parsedRes0).toEqual('You have 10 unread emails.');

      const res1 = fluent.getResource('en', 'translations', 'logout');
      const parsedRes1 = res1 ? fluent.parse(res1, {}, 'en', 'translations', 'logout') : '';
      expect(parsedRes1).toEqual('Logout');

      const res2 = fluent.getResource('en', 'translations', 'hello');
      const parsedRes2 = res2 ? fluent.parse(res2, { name: 'Jan' }, 'en', 'translations', 'hello') : '';
      expect(parsedRes2).toEqual('Hello Jan.');

      const res3 = fluent.getResource('en', 'translations', 'restart-app');
      const parsedRes3 = res3 ? fluent.parse(res3, {}, 'en', 'translations', 'restart-app') : '';
      expect(parsedRes3).toEqual('Zrestartuj Firefoxa.');

      const res4 = fluent.getResource('en', 'translations', 'login.placeholder');
      const parsedRes4 = res4 ? fluent.parse(res4, {}, 'en', 'translations', 'login.placeholder') : '';
      expect(parsedRes4).toEqual('example@email.com');
    });
  });

  describe('with i18next', () => {
    beforeAll(() => {
      i18next.use(Fluent).init({
        lng: 'en',
        fallbackLng: 'en',
        resources: {
          en: {
            translation: testJSON,
          },
        },
      });
    });

    it('should parse', () => {
      expect(i18next.t('emails', { unreadEmails: 10 })).toEqual('You have 10 unread emails.');
      expect(i18next.t('emails', { unreadEmails: 0 })).toEqual('You have no unread emails.');
      expect(i18next.t('logout')).toEqual('Logout');
      expect(i18next.t('hello', { name: 'Jan' })).toEqual('Hello Jan.');
      expect(i18next.t('restart-app')).toEqual('Zrestartuj Firefoxa.');
      expect(i18next.t('login.placeholder')).toEqual('example@email.com');
    });
  });
});
