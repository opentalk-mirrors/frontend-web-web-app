import { BundleStore } from '../src/store';

describe('BundleStore', () => {
  let store: BundleStore;
  beforeEach(() => {
    store = new BundleStore({});
  });

  it('basic bundle', () => {
    store.createBundle('lng', 'ns', { foo: 'test' });
    const bundle = store.getBundle('lng', 'ns');
    const msg = bundle?.getMessage('foo');
    expect(msg?.value && bundle?.formatPattern(msg.value)).toEqual('test');
  });

  it('invalid basic bundle', () => {
    expect(() => store.createBundle('lng', 'ns', { foo: 2 as unknown as string })).toThrow();

    expect(() => store.createBundle('lng', 'ns', { foo: { value: 2 as unknown as string, bar: 'test' } })).toThrow();
  });
});
