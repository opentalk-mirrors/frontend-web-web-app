// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

module.exports = {
  env: {
	node: true,
	browser: true,
  },
  plugins: [
    'jsx-a11y',
    'react',
  ],
  extends: [
    'plugin:jsx-a11y/recommended',
    'plugin:react/jsx-runtime',
  ],
  overrides: [
    {
      "files": ["*.ts", "*.tsx"],
      "rules": {
        "no-var": "off",
        "react/react-in-jsx-scope": "off",
        "react/jsx-curly-brace-presence": ["error", "never"],
      }
    }
  ]
};
