#!/usr/bin/env bash

# Auto-release script for https://github.com/ivictbor/painterro
# Creates new release, builds assets and performs publish to github and npm

GH_USER=ivictbor
GH_PATH=`cat ~/.ghpass`
GH_REPO=painterro
GH_TARGET=master
ASSETS_PATH=build
npm --no-git-tag-version version patch
VERSION=`grep '"version":' package.json | cut -d\" -f4`
npm run build
git add -u
git commit -m "$VERSION"
git push
npm publish

res=`curl --user "$GH_USER:$GH_PATH" -X POST https://api.github.com/repos/${GH_USER}/${GH_REPO}/releases \
-d "
{
  \"tag_name\": \"v$VERSION\",
  \"target_commitish\": \"$GH_TARGET\",
  \"name\": \"v$VERSION\",
  \"body\": \"new version $VERSION\",
  \"draft\": false,
  \"prerelease\": false
}"`
echo Create release result: ${res}
rel_id=`echo ${res}|  grep -oP '"id": +\d+' | grep -oP '\d+'`
file_name=painterro-${VERSION}.min.js

curl --user "$GH_USER:$GH_PATH" -X POST https://uploads.github.com/repos/${GH_USER}/${GH_REPO}/releases/${rel_id}/assets?name=${file_name}\
 --header 'Content-Type: text/javascript ' --upload-file ${ASSETS_PATH}/${file_name}

file_map_name=painterro-${VERSION}.min.js.map
curl --user "$GH_USER:$GH_PATH" -X POST https://uploads.github.com/repos/${GH_USER}/${GH_REPO}/releases/${rel_id}/assets?name=${file_map_name}\
 --header 'Content-Type: text/javascript ' --upload-file ${ASSETS_PATH}/${file_map_name}

rm ${ASSETS_PATH}/${file_name}
rm ${ASSETS_PATH}/${file_map_name}