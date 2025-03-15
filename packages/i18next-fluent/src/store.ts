import { FluentBundle, FluentResource } from '@fluent/bundle';
import { FluentIJs, js2ftl } from '@opentalk/fluent_conv';
import { i18n } from 'i18next';

import { getI18ResourceForLangAndNamespace, setBundle } from './utils';
import * as utils from './utils';

function nonBlank(line: string): boolean {
  return !/^\s*$/.test(line);
}

function countIndent(line: string): number {
  const indent = line.match(/^\s*/) || [];
  return indent.length;
}

function ftl(code: string): string {
  const lines = code.split('\n').filter(nonBlank);
  const indents = lines.map(countIndent);
  const common = Math.min(...indents);
  const indent = new RegExp(`^\\s{${common}}`);

  return lines.map((line) => line.replace(indent, '')).join('\n');
}
export interface FluentConfig {
  bindI18nStore?: boolean;
  fluentBundleOptions?: {
    useIsolating?: boolean;
  };
}

export class BundleStore {
  i18next?: i18n;
  options: FluentConfig;
  bundles: utils.Resource<FluentBundle>;
  constructor(options: FluentConfig, i18next?: i18n) {
    this.i18next = i18next;
    this.options = options;
    this.bundles = {};
  }

  createBundle(lng: string, ns: string, json: FluentIJs) {
    // We cannot rely on TS here, as this gets resources loaded at runtime.
    const ftlStr = json !== undefined ? js2ftl(json) : '';
    const bundle = new FluentBundle(lng, this.options.fluentBundleOptions);
    const errors = bundle.addResource(new FluentResource(ftl(ftlStr)));

    if (errors.length != 0) {
      throw new Error(`Failed to add FluentResource to bundle without errors: ${errors.join('\n')}`);
    }

    setBundle(this.bundles, lng, ns, bundle);
  }

  createBundleFromI18next(lng: string, ns: string) {
    // We expect that the i18next Resource at lng, ns is of type FluentIJS
    // As i18next stored data is mostly key value pairs, with value being a string, this is most certainly true,
    // else the js2ftl function in creatBundle will just use the Object.keys iterator to resolve subkeys of a value.
    if (this.i18next?.store.data !== undefined) {
      const t = getI18ResourceForLangAndNamespace(this.i18next?.store.data as utils.Resource<FluentIJs>, lng, ns);
      if (t !== undefined) {
        this.createBundle(lng, ns, t);
      }
    }
  }

  getBundle(lng: string, ns: string): FluentBundle | undefined {
    return utils.getBundle(this.bundles, lng, ns);
  }

  bind() {
    if (this.i18next) {
      this.i18next.store.on('added', (lng, ns) => {
        if (!this.i18next?.isInitialized) return;
        this.createBundleFromI18next(lng, ns);
      });

      this.i18next.on('initialized', () => {
        if (this.i18next) {
          const languages = this.i18next.languages || [];
          const preload = this.i18next.options.preload || [];
          const ns = this.i18next.options.ns;

          languages
            .filter((l) => !preload.includes(l))
            .concat(preload)
            .forEach((lng) => {
              if (typeof ns !== 'string') {
                ns?.forEach((ns) => {
                  this.createBundleFromI18next(lng, ns);
                });
              }
            });
        }
      });
    }
  }
}
