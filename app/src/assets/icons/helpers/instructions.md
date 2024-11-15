<!--
SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>

SPDX-License-Identifier: EUPL-1.2
-->

# What is this and what is it not

These 2 helpers `createIconComponents.sh` and `createIconIndex.sh` are 2 small utils to help generate and maintain SVG-icons as specified by [MUI](https://mui.com/components/icons/#svgicon).

Using this both utils you will generate icons from `assets/icons/source` into `assets/icons` in which an `index.ts` **must** exist to provide the icons as both, a module and a named export.

These utilities do not generate icons from other formats.

## Prerequisites

- SVG assets with a meaningful naming. The naming of the `*.svg` will define the name of the component.

- SVGs names should be in kebab case (`my-asset.svg`) that will be converted into pascal case (`MyAssetIcon.tsx`). Do not use snake case (will_not_work) Since "Icon" will always be apended to the component's name, you don't have to add it to the SVG's name.

- An empty `index.ts` has to exist in `assets/icons`.

# Usage

## 1. Create components

`createIconComponents.sh` generates `.tsx` components from your SVGs in `assets/icons/source`.

**Run `cd ${projectPath}/src/assets/icons/source`**.

From there **run `../helpers/createIconComponents.sh`.**

This will create a bunch of components in `assets/icons`.

## 2. Create index

`createIconIndex.sh` updates your `assets/icons/index.ts`. That means, in order to execute the script, an empty `index.ts` has to exist. The script adds _imports_ for all `IconComponents.tsx` in `assets/icons` and the exports them as modules. If the `index.ts` was not empty for some reason, you might end with duplicate entries.

**Run `cd ${projectPath}/src/assets/icons`** to go to where the `index.ts` lives.

From there **run `./helpers/createIconIndex.sh`.**

## 3. Formatting

As a good measure, **run `pnpm fmt`** afterwards.
