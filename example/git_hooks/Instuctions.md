<!--
SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>

SPDX-License-Identifier: EUPL-1.2
-->

# Git Hooks

## Pre-commit

[pre-commit](https://pre-commit.com/) is a tool that maintains and manages git hooks.

This can be used as an alternative to the husky tool, which is installed by default
in the root projects.

### Prerequisites

pre-commit is a python tool, therefore you need to have [pip](https://pypi.org/project/pip/) installed on your system locally.

Moreover, you need to disable husky in order to use hooks, provided by pre-commit.
`git config --unset-all core.hooksPath`

### Configuration and installation

1. Install [pre-commit](https://pre-commit.com/) on your system
2. Copy `example/git_hooks/.pre-commit-config.yaml` to the root level of the project
3. You can comment out hooks, that you don't need or extend with additional ones
4. Install hooks `pre-commit install`
5. Now every time you commit, the checks will be performed

## Mimic CI Pipeline

`./pre-commit` script mimics some pipeline steps. You can just copy it into `.git/hooks/`

### Prerequisites

You need to disable husky in order to use hooks, provided by pre-commit.
`git config --unset-all core.hooksPath`
