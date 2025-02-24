// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { formatBytes } from './numberUtils';

describe('formatBytes', () => {
  const fileSizeInBytes = 2048;

  describe('default formatting', () => {
    test('should format to KB', () => {
      const resultKB = formatBytes(fileSizeInBytes);
      expect(resultKB).toBe('2.05 KB');
    });

    test('should format to MB', () => {
      const resultMB = formatBytes(fileSizeInBytes * 1000);
      expect(resultMB).toBe('2.05 MB');
    });

    test('should limit untis to MB', () => {
      const resultMiB = formatBytes(fileSizeInBytes * 1000 * 1000);
      expect(resultMiB).toBe('2048.00 MB');
    });

    test('should throw an error for invalid decimals', () => {
      expect(() => formatBytes(fileSizeInBytes, { decimals: -1 })).toThrowError('Invalid decimals -1');
    });
  });

  describe('conversion to binary units', () => {
    test('should format to KiB', () => {
      const resultKiB = formatBytes(fileSizeInBytes, { useBinaryUnits: true });
      expect(resultKiB).toBe('2.00 KiB');
    });

    test('should format to MiB', () => {
      const resultMiB = formatBytes(fileSizeInBytes * 1024, { useBinaryUnits: true });
      expect(resultMiB).toBe('2.00 MiB');
    });
  });

  test('should handle very large bytes (Number.MAX_SAFE_INTEGER)', () => {
    const result = formatBytes(Number.MAX_SAFE_INTEGER);
    expect(result).toBe('9007199254.74 MB');
  });

  test('should handle zero bytes', () => {
    const result = formatBytes(0);
    expect(result).toBe('0 Bytes');
  });

  test('should handle one byte', () => {
    const result = formatBytes(1);
    expect(result).toBe('1 Byte');
  });
});
