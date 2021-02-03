#!/usr/bin/env bash

# Auto-release script for https://github.com/devforth/painterro
# Creates new release, builds assets and performs publishing to github and npm

GH_USER=ivictbor
GH_REPO_USER=devforth
GH_PASS=`cat ~/.ghtoken`
WP_PASSWORD=`cat ~/.wppassword`
GH_REPO=painterro
GH_TARGET=master
ASSETS_PATH=build
npm --no-git-tag-version version patch
VERSION=`grep '"version":' package.json | cut -d\" -f4`
npm run build

if [ $? -eq 0 ]; then
    echo BUILD OK
else
    echo FAIL
    exit 0
fi

rm -rf wp
svn co http://plugins.svn.wordpress.org/painterro/ wp

rm -f wp/trunk/painterro-*.min.js
rm -f wp/trunk/painterro-*.min.js.map
cp build/painterro-${VERSION}.min.js wp/trunk/
cp build/painterro-${VERSION}.min.js.map wp/trunk/
sed -i -E "s/([ \t]+version: \")[0-9\\.]+(\",)/\1${VERSION}\2/" wp/trunk/index.js
sed -i -E "s/(Version: )[0-9\\.]+/\1${VERSION}/" wp/trunk/painterro-wp.php
sed -i -E "s/(define\\(\"PAINTERRO_FILE\", \"painterro-)[0-9\\.]+(\\.min\\.js\"\\);)/\1${VERSION}\2/" wp/trunk/painterro-wp.php
cd wp
svn add --force .
svn st | grep ^! | awk '{print " --force "$2}' | xargs svn rm
svn --username=vanbrosh --password="${WP_PASSWORD}" ci -m "${VERSION}"
cd ..

git add -u
git commit -m "$VERSION"
git push
npm publish

res=`curl --user "$GH_USER:$GH_PASS" -X POST https://api.github.com/repos/${GH_REPO_USER}/${GH_REPO}/releases \
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
rel_id=`echo ${res} | python -c 'import json,sys;print(json.load(sys.stdin)["id"])'`
file_name=painterro-${VERSION}.min.js

echo "Release id", $rel_id

curl --user "$GH_USER:$GH_PASS" -X POST https://uploads.github.com/repos/${GH_REPO_USER}/${GH_REPO}/releases/${rel_id}/assets?name=${file_name}\
 --header 'Content-Type: text/javascript ' --upload-file ${ASSETS_PATH}/${file_name}

file_map_name=painterro-${VERSION}.min.js.map
curl --user "$GH_USER:$GH_PASS" -X POST https://uploads.github.com/repos/${GH_REPO_USER}/${GH_REPO}/releases/${rel_id}/assets?name=${file_map_name}\
 --header 'Content-Type: text/javascript ' --upload-file ${ASSETS_PATH}/${file_map_name}

rm ${ASSETS_PATH}/${file_name}
rm ${ASSETS_PATH}/${file_map_name}