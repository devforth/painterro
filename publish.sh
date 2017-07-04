npm run build
npm --no-git-tag-version version patch
VERSION=`grep '"version":' package.json | cut -d\" -f4`
git add *
git commit -m "$VERSION"
git push
npm publish
