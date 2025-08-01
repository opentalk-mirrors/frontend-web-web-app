import { ftl2js, js2ftl } from '../src';
import { example } from './fixtures';

describe('convert with callback', () => {
  it('converts ftl to js', () => {
    const res = ftl2js(example.ftl, (err, res) => {
      expect(err).toBeNull();
      expect(res).toEqual(example.js);
    });
    expect(res).toBeUndefined();
  });

  it('converts ftl to js with wrong args calls cb with Error', () => {
    const wrongInput = 4;
    const res = ftl2js(wrongInput as unknown as string, (err, res) => {
      expect(res).toBeNull();
      expect(err).toBeInstanceOf(Error);
    });
    expect(res).toBeUndefined();
  });

  it('converts js to ftl', () => {
    const res = js2ftl(example.js, (err, res) => {
      expect(err).toBeNull();

      // Compensate for newline at the end of example.ftl
      expect(res).toEqual(example.ftl + '\n');
    });
    expect(res).toEqual(example.ftl + '\n');
  });
});

describe('convert without callback', () => {
  it('converts ftl to js', () => {
    const res = ftl2js(example.ftl);
    expect(res).toEqual(example.js);
  });

  it('converts ftl to js with wrong args throws', () => {
    const wrongInput = 4;
    expect(() => ftl2js(wrongInput as unknown as string)).toThrow(Error);
  });

  it('it converts js to ftl', () => {
    const res = js2ftl(example.js);
    // Compensate for newline at the end of example.ftl
    expect(res).toEqual(example.ftl + '\n');
  });
});
