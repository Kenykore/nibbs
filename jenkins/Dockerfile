#Jenkins base image.

FROM node:erbium AS builder

ENV WORKING_DIR=/usr/app/src/

WORKDIR ${WORKING_DIR}


RUN echo 'deb http://ppa.launchpad.net/ansible/ansible/ubuntu trusty main' >> /etc/apt/sources.list \
&& apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 93C4A3FD7BB9C367 \
&& apt update \
&& apt install -y ansible sshpass default-jdk wget


RUN apt-get install -y apt-transport-https ca-certificates curl unzip software-properties-common && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add - && \
    add-apt-repository \
       "deb [arch=amd64] https://download.docker.com/linux/debian \
       $(lsb_release -cs) \
       stable" && \
    apt update && \
    apt install -y docker-ce docker-ce-cli containerd.io

RUN npm install -g sonarqube-scanner @angular/cli && \
    npm install --save-dev @angular-devkit/build-angular --silent && \
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    apt install -y ./google-chrome-stable_current_amd64.deb

ENV CHROME_BIN=/usr/bin/google-chrome

RUN apt install -y python-pip python3-pip
RUN pip3 install dominate requests argparse
