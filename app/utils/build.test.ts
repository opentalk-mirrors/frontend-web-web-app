// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { cleanPackageVersion } from './build';

describe('build utils', () => {
  it.each([
    ['^1.51.1'],
    ['~1.51.1'],
    ['1.51.1'],
    ['>=1.51.1'],
    ['v1.51.1'],
    ['1.51.1-alpha'],
    ['1.51.1+build.123'],
    ['1.51.1-alpha+build.123'],
  ])('extract package version', (input) => {
    expect(cleanPackageVersion(input)).toEqual('1.51.1');
  });
});
