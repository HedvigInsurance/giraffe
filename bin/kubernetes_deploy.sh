#!/usr/bin/env bash

# Push only if it's not a pull request
if [ -z "$TRAVIS_PULL_REQUEST" ] || [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  # Push only if we're testing the master branch
  if [ "$TRAVIS_BRANCH" == "master" ]; then
    aws s3 cp s3://dev-com-hedvig-cluster-ett-data/kube ~/.kube --recursive

    curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.10.5/bin/linux/amd64/kubectl
    chmod +x ./kubectl
    chmod +x ~/.kube/heptio-authenticator-aws

    ./kubectl set image deployment/giraffe giraffe=${REMOTE_IMAGE_URL}:${TRAVIS_COMMIT}
  else
    echo "Skipping deploy because branch is not 'master'"
  fi
else
  echo "Skipping deploy because it's a pull request"
fi
