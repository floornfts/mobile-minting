#!/bin/bash

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
    echo "Usage: $0 <git-url> [branch-name]"
    exit 1
fi

# if the URL is of the format https://github.com/pbkompasz/mobile-minting/tree/ingestor-highlight then pull both the branch name and the repo name
if [[ $1 == *"tree"* ]]; then
    BRANCH_NAME=$(echo $1 | cut -d'/' -f7)
    REPO_NAME=$(echo $1 | cut -d'/' -f5)

    # remove the tree part from the URL
    GIT_URL=$(echo $1 | cut -d'/' -f1-5)
    GIT_URL="$GIT_URL"
else
    GIT_URL=$1
    BRANCH_NAME=${2:-main}
fi

echo "GIT_URL: $GIT_URL"
echo "BRANCH_NAME: $BRANCH_NAME"

ORG_NAME=$(basename $(dirname $GIT_URL) .git)

echo "ORG_NAME: $ORG_NAME"

cd clones

# if the folder name exists, delete it
if [ -d $ORG_NAME ]; then
    rm -rf $ORG_NAME
fi

# Clone the fork into a directory with the name of the organization the fork is in
git clone $GIT_URL $ORG_NAME
cd $ORG_NAME

# Move to the specified branch
git checkout $BRANCH_NAME

# Install dependencies
yarn install

# Add the floornfts/mobile-minting repo as a remote "floor"
git remote add floor https://github.com/floornfts/mobile-minting.git

# Fetch the remote "floor"
git fetch floor

# Merge main from "floor" into the current branch
git merge floor/main --no-edit

# copy the .env.example file to .env
cp ../../../../.env .env

# Run tests
yarn test
