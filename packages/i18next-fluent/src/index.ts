import { FluentVariable } from '@fluent/bundle';
import { Message } from '@fluent/bundle/esm/ast';
import { i18n, I18nFormatModule, InitOptions } from 'i18next';

import { BundleStore, FluentConfig } from './store';

function getDefaults() {
  return {
    bindI18nStore: true,
    fluentBundleOptions: { useIsolating: false },
  };
}

export class Fluent implements I18nFormatModule {
  type: 'i18nFormat';
  static type = 'i18nFormat';

  handleAsObject: boolean;
  options: FluentConfig;
  store: BundleStore;

  constructor(options?: FluentConfig) {
    this.type = 'i18nFormat';
    this.handleAsObject = false;

    this.options = { ...options, ...getDefaults() };
    this.store = new BundleStore(this.options);
  }

  init(i18next: i18n & { fluent?: Fluent }, options?: FluentConfig & InitOptions): void {
    const i18nextOptions = i18next?.options?.i18nFormat || {};
    this.options = { ...i18nextOptions, ...options, ...this.options, ...getDefaults() };

    this.store = new BundleStore(this.options, i18next);
    if (this.options.bindI18nStore) {
      this.store.bind();
    }
    i18next.fluent = this;
  }

  parse(res: Message, options: Record<string, FluentVariable>, lng: string, ns: string, key: string): string {
    const bundle = this.store.getBundle(lng, ns);
    const isAttr = key.indexOf('.') > -1;

    if (!res) {
      return key;
    }

    const useRes = isAttr ? res.attributes[key.split('.')[1]] : res.value;
    if (!bundle || !useRes) {
      return key;
    }
    return bundle.formatPattern(useRes, options);
  }

  getResource(lng: string, ns: string, key: string): Message | undefined {
    const bundle = this.store.getBundle(lng, ns);
    const useKey = key.indexOf('.') > -1 ? key.split('.')[0] : key;

    if (!bundle) {
      return undefined;
    }
    return bundle.getMessage(useKey);
  }

  addLookupKeys(finalKeys: string[]) {
    // no additional keys needed for select or plural
    // so there is no need to add keys to that finalKeys array
    return finalKeys;
  }
}

export default Fluent;
