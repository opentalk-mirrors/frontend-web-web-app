#!/bin/bash

# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

#generate from the icons/source folder or whatever the location of the SVG's is

# Vite has problems importing svg's as react components. 
# vite-plugin-svgr, which is used for that, requires `?react` suffix for filenames

for f in *.svg; do

    componentName=$(echo "${f%.*}" | perl -pe 's/(^|-)./uc($&)/ge;s/-//g')

cat > "${componentName}Icon.tsx" << EOF
// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
import { SvgIconProps } from '@mui/material';

import AccessibleSvgIcon from './helpers/AccessibleSvgIcon';
import ${componentName} from './source/${f}?react';

const ${componentName}Icon = (props: SvgIconProps) => <AccessibleSvgIcon {...props} component={${componentName}} />;

export default ${componentName}Icon;
EOF

    mv ${componentName}Icon.tsx ../${componentName}Icon.tsx
done
