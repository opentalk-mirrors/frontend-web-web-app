// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import camelcaseKeys from 'camelcase-keys';
import { DelimiterCase, Opaque, CamelCase } from 'type-fest';

type Function = () => void;

/**
Convert object properties to delimiter case recursively.
This can be useful when, for example, converting some API types from a different style.

FIXME: Taken from type-fest (MIT OR CC0-1.0) but added their Opaque as an exception
See: https://github.com/sindresorhus/type-fest/issues/364
@see DelimiterCase
@see DelimiterCasedProperties
@example
```
interface User {
	userId: number;
	userName: string;
}
interface UserWithFriends {
	userInfo: User;
	userFriends: User[];
}
const result: DelimiterCasedPropertiesDeep<UserWithFriends, '-'> = {
	'user-info': {
	'user-id': 1,
		'user-name': 'Tom',
	},
	'user-friends': [
		{
			'user-id': 2,
			'user-name': 'Jerry',
		},
		{
			'user-id': 3,
			'user-name': 'Spike',
		},
	],
};
```
@category Change case
@category Template literal
@category Object
*/
type DelimiterCasedPropertiesDeep<Value, Delimiter extends string> = Value extends
  | Function
  | Date
  | RegExp
  | Opaque<unknown>
  ? Value
  : Value extends Array<infer U>
    ? Array<DelimiterCasedPropertiesDeep<U, Delimiter>>
    : Value extends Set<infer U>
      ? Set<DelimiterCasedPropertiesDeep<U, Delimiter>>
      : {
          [K in keyof Value as DelimiterCase<K, Delimiter>]: DelimiterCasedPropertiesDeep<Value[K], Delimiter>;
        };

export type SnakeCasedPropertiesDeep<Value> = DelimiterCasedPropertiesDeep<Value, '_'>;

export type CamelCasedPropertiesDeep<Value> = Value extends Function | Opaque<unknown>
  ? Value
  : Value extends Array<infer U>
    ? Array<CamelCasedPropertiesDeep<U>>
    : Value extends Set<infer U>
      ? Set<CamelCasedPropertiesDeep<U>>
      : {
          [K in keyof Value as CamelCase<K>]: CamelCasedPropertiesDeep<Value[K]>;
        };

/*
FIXME: the CamelCaseKeys type from camelcase-keys has problems with opaque types. Thus we overwrite the result type Replace when fixed.
See: https://github.com/sindresorhus/camelcase-keys/issues/87
*/
export function camelcaseKeysDeep<T extends readonly [] | Record<string, unknown>>(
  input: T
): CamelCasedPropertiesDeep<T> {
  return camelcaseKeys(input, { deep: true }) as unknown as CamelCasedPropertiesDeep<T>;
}

export type CamelCased<T> = CamelCasedPropertiesDeep<T>;
export type ApiResponse<T> = SnakeCasedPropertiesDeep<T>;
