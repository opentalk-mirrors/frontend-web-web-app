// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2

// Jest uses it to mock out all SVG's
// Can be modified based upon further needs
const SvgrMock = (props) => {
  return (
    <svg {...props}>
      <span>Mock SVG</span>
    </svg>
  );
};

export default SvgrMock;
