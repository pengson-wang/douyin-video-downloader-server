.PHONY: docker/build
.ONESHELL:

docker/build:
  DOCKER_BUILDKIT=1 docker build -t douyin-video-downloader -f ./Dockerfile .
