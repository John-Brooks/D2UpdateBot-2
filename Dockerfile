FROM ubuntu:22.04
ARG NODE_VERSION=v16.15.1

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get -y install curl
#yolo run whatever this is I guess...
RUN curl -s https://deb.nodesource.com/setup_16.x | bash

RUN apt-get update && apt-get -y install nodejs