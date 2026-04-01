#!/usr/bin/env bash
#
# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
# SPDX-License-Identifier: EUPL-1.2
set -xeu
set -o pipefail

is_latest_major() {
    local version=$1
    local filtered_versions=()
    local major minor patch versions v_major

    IFS='.' read -r major minor patch <<< "$version"

    IFS=' ' read -ra versions <<< "$2"
    for v in "${versions[@]}"; do
        IFS='.' read -r v_major _ _ <<< "$v"
        if [[ "$v_major" = "$major" ]]; then
            filtered_versions+=("$v")
        fi
    done
    is_latest "$version" "${filtered_versions[*]}" || return 1
}

is_latest() {
    local version versions latest
    version=$1
    IFS=" " read -ra versions <<< "$2"
    versions+=("$version")
    latest=$(printf '%s\n' "${versions[@]}" | sort -V | tail -n1)
    [[ "$version" = "$latest" ]] && return 0
    return 1
}

create_tags() {
    local tag all_tags tags
    tag=${1/#v/}
    all_tags=${2/#v/}
    branch=$3
    default_branch=$4

    # If the pipeline is not running on a git tag
    if [ -z "$tag" ]; then
        # Create a dev tag if we're on the default branch.
        if [ "$branch" = "$default_branch" ]; then
            tags=()
            tags=("dev")
            echo "${tags[*]}"
            return
        fi

        # TODO: The regex pattern below is not very readable. This should be removed when building
        # from the roomserver branch is no longer necessary.
        #
        # Sanitize the input branch to a valid docker tag
        # Remove leading . or - characters (s/^[.-]+//)
        # Replace all characters except alpha numeric _, . or - with _ (s/[^A-Za-z0-9_.-]/_/g)
        # Truncate the string to 128 characters (s/^(.{128}).*/\1/)
        branch=$(echo "$branch" | sed -E 's/^[.-]+//; s/[^A-Za-z0-9_.-]/_/g; s/^(.{128}).*/\1/')
        # Create a tag with the branch name otherwise
        tags=()
        tags=("$branch")
        echo "${tags[*]}"
        return
    fi

    IFS='.' read -r major minor patch <<< "$tag"

    if [[ "$patch" =~ [a-zA-Z].* ]]; then
        tags=()
        tags=("$major.$minor.$patch")
        echo "${tags[*]}"
        return
    fi

    # Always create tags for MAJOR.MINOR.PATCH and MAJOR.MINOR
    tags=("$major.$minor.$patch" "$major.$minor")

    # When this is the latest minor for a major branch create a tag for its major branch
    is_latest_major "$tag" "$all_tags" && tags+=("$major")
    # Add each tag additionally prefixed with 'v'
    tags+=("${tags[@]/#/v}")

    # When this is the latest release, create a "latest" tag
    is_latest "$tag" "$all_tags" && tags+=("latest")

    # Add profiling versions
    tags+=("${tags[@]/%/-profiling}")
    
    echo "${tags[*]}"
}

create_tags "$@"
