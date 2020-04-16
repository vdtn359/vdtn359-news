#!/usr/bin/env bash

VERSION="$(cat ./package.json | jq -r .version)"
{
    docker pull registry.heroku.com/vdtn359-news/web:"$VERSION"
} || {
  echo "Building web version $VERSION"
  npm run build
  npx mono-install --engine pnpm --install-dir produles --package-json ./package.json --package-lock ../../pnpm-lock.yaml --resolve --dry-run
  docker build -t registry.heroku.com/vdtn359-news/web:$VERSION -f Dockerfile --target prod .
  docker tag registry.heroku.com/vdtn359-news/web:$VERSION registry.heroku.com/vdtn359-news/web:$latest
  docker push registry.heroku.com/vdtn359-news/web:$VERSION
  docker push registry.heroku.com/vdtn359-news/web:latest
}
