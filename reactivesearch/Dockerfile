FROM node:17

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY ["package.json", "package-lock.json*", "./"]

RUN yarn

CMD [ "yarn", "start"]
