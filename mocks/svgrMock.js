// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
// Jest uses it to mock out all SVG's
// Can be modified based upon further needs
import { omit } from 'lodash';

const SvgrMock = (props) => {
  const svgNativeProps = omit(props, 'titleId');
  return <svg {...svgNativeProps} />;
};

export default SvgrMock;
