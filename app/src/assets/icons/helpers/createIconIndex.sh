#!/bin/bash

# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

#generate from the icons folder, where the index.ts

cat > _index_tmp.ts << EOF
// SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
//
// SPDX-License-Identifier: EUPL-1.2
EOF
for f in *.tsx
do
    MODULE=${f%.*}
    echo "import ${MODULE} from './${MODULE}';"  >> _index_tmp.ts
done

echo -e "\nexport {" >> _index_tmp.ts

for f in *.tsx
do
    MODULE=${f%.*}
    echo "  ${MODULE},"  >> _index_tmp.ts
done
echo "};" >> _index_tmp.ts

mv _index_tmp.ts index.ts
