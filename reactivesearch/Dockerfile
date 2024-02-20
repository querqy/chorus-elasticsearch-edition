FROM node:16

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

RUN     npm install -g typescript

COPY ["package.json", "package-lock.json*", "./"]
RUN     npm install
#RUN     tsc

RUN yarn

CMD [ "yarn", "start"]
