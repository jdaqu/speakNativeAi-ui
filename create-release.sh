#!/bin/bash

# Script to create a new release for SpeakNative AI Desktop App
# Usage: ./scripts/create-release.sh v1.0.0

set -e

# Check if version is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 v1.0.0"
    exit 1
fi

VERSION=$1

# Validate version format (should start with 'v')
if [[ ! $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: Version must be in format v1.0.0"
    exit 1
fi

echo "Creating release $VERSION..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Check if working directory is clean (ignore submodule changes)
if ! git diff-index --quiet HEAD -- ':!landing-speak-native' ':!backend' ':!frontend'; then
    echo "Error: Working directory is not clean. Please commit or stash changes first."
    exit 1
fi

# Check if tag already exists
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo "Error: Tag $VERSION already exists"
    exit 1
fi

# Create and push the tag
echo "Creating tag $VERSION..."
git tag -a "$VERSION" -m "Release $VERSION"
git push origin "$VERSION"

echo "✅ Tag $VERSION created and pushed!"
echo "🚀 GitHub Actions will now build and create the release automatically."
echo "📱 Check the Actions tab in your GitHub repository to monitor the build progress."
echo "🔗 Once complete, the release will be available at: https://github.com/jdaqu/speakNativeAi-ui/releases"
