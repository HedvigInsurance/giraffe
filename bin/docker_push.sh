#!/usr/bin/env bash
# Push only if it's not a pull request
pip install --user awscli
export PATH=$PATH:$HOME/.local/bin
eval $(aws ecr get-login --no-include-email --region ${AWS_DEFAULT_REGION})

# Build and push
docker build -t $IMAGE_NAME .
echo "Pushing $IMAGE_NAME:latest"
docker tag $IMAGE_NAME:latest $REMOTE_IMAGE_URL:${TRAVIS_COMMIT}
docker push $REMOTE_IMAGE_URL:${TRAVIS_COMMIT}
echo "Pushed $IMAGE_NAME:${TRAVIS_COMMIT}"
